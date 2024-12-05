"use client";

import Peer from "peerjs";
import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from "react";

type VideoState = {
  videos: string[];
  selectedVideo: string | null;
  token: string | null;
  username: string | null;
  groupId: string | null;
  peer: any | null;
  peers: Record<string, MediaStream>;
  localStream: MediaStream | null;
  ws: any | null;
};

type VideoAction =
  | { type: "SET_VIDEOS"; payload: string[] }
  | { type: "SELECT_VIDEO"; payload: string }
  | { type: "SET_TOKEN"; payload: { username: string; token: string } }
  | { type: "SET_GROUP"; payload: string | null }
  | { type: "SET_LOCAL_STREAM"; payload: MediaStream }
  | { type: "ADD_PEER"; payload: { peerId: string; stream: MediaStream } }
  | { type: "REMOVE_PEER"; payload: string }
  | { type: "SET_PEER"; payload: Peer | null }
  | { type: "REMOVE_LOCAL_STREAM" }
  | { type: "SET_WS"; payload: any | null }
  | { type: "TOGGLE_AUDIO"; payload: any }
  | { type: "TOGGLE_VIDEO"; payload: any };

const initialState: VideoState = {
  videos: [],
  selectedVideo: null,
  token: typeof window !== "undefined" ? localStorage.getItem("authToken") : null,
  username: typeof window !== "undefined" ? localStorage.getItem("username") : null,
  groupId: null,
  peer: null,
  peers: {},
  localStream: null,
  ws: null,
};

const videoReducer = (state: VideoState, action: VideoAction): VideoState => {
  switch (action.type) {
    case "SET_VIDEOS":
      return { ...state, videos: action.payload };
    case "SELECT_VIDEO":
      return { ...state, selectedVideo: action.payload };
    case "SET_TOKEN":
      return { ...state, token: action.payload.token, username: action.payload.username };
    case "SET_GROUP":
      return { ...state, groupId: action.payload };
    case "SET_LOCAL_STREAM":
      return { ...state, localStream: action.payload };
    case "REMOVE_LOCAL_STREAM":
      return { ...state, localStream: null };
    case "SET_PEER":
      return { ...state, peer: action.payload };
    case "ADD_PEER":
      return { ...state, peers: { ...state.peers, [action.payload.peerId]: action.payload.stream } };
    case "SET_WS":
      return { ...state, ws: action.payload };
    case "REMOVE_PEER": {
      delete state.peers[action.payload];
      console.log("Peer removed", action.payload);
      return { ...state };
    }
    case "TOGGLE_AUDIO": { 
      if(state.peers[action.payload.peerId]) {
        const peerStream = state.peers[action.payload.peerId];
        const audioTrack = peerStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = action.payload.Muted;
        }
      }
      return { ...state };
    }
    case "TOGGLE_VIDEO": { 
      if(state.peers[action.payload.peerId]) {
        const peerStream = state.peers[action.payload.peerId];
        const videoTrack = peerStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = action.payload.VideoOff;
      }
      }
      return { ...state };
    }
    default:
      return state;
  }
};

const VideoContext = createContext<{
  state: VideoState;
  dispatch: React.Dispatch<VideoAction>;
}>({ state: initialState, dispatch: () => null });

const initializePeer = (dispatch: React.Dispatch<VideoAction>) => {
  const peer = new Peer();

  peer.on("call", (call) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          const newStream = remoteStream;
          newStream.getAudioTracks()[0].enabled = false;
          newStream.getVideoTracks()[0].enabled = false;
          dispatch({ type: "ADD_PEER", payload: { peerId: call.peer, stream: newStream } });
        });
      });
  });

  return peer;
};

export const VideoContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);
  const peerRef = useRef<Peer | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    if (!state.groupId) return;
  
    if (!peerRef.current) {
      const peer = initializePeer(dispatch);
      peerRef.current = peer;
      dispatch({ type: "SET_PEER", payload: peer });
  
      peer.on("open", (peerId) => {
        const ws = new WebSocket(`ws://localhost:8080/ws?groupId=${state.groupId}`);
        wsRef.current = ws;
        dispatch({ type: "SET_WS", payload: wsRef.current });
  
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "NEW_PEER", Group: state.groupId, peerId }));
        };
  
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "NEW_PEER") {
            navigator.mediaDevices
              .getUserMedia({ video: true, audio: true})
              .then((stream) => {
                const call = peer.call(message.peerId, stream);
                call.on("stream", (remoteStream) => {
                  const newStream=remoteStream;
                  newStream.getAudioTracks()[0].enabled = false;
                  newStream.getVideoTracks()[0].enabled = false;
                  dispatch({ type: "ADD_PEER", payload: { peerId: message.peerId, stream: newStream } });
                });
              });
          }
          if (message.type === "REMOVE_PEER") {
            dispatch({ type: "REMOVE_PEER", payload: message.peerId });
          }
          if (message.type === "TOGGLE_AUDIO") {
            console.log("toggle")
            console.log(message)
            dispatch({type:"TOGGLE_AUDIO", payload:{
              peerId:message.peerId,
              Muted:message.Muted
            }});
          }
          if(message.type === "TOGGLE_VIDEO"){
            console.log("toggle")
            console.log(message)
            dispatch({type:"TOGGLE_VIDEO", payload:{
              peerId:message.peerId,
              VideoOff:message.isVideoOff
            }});
          }
        };
      });

      return () => {
        console.log("Cleaning up peer call for ID:");
      };
    }
  }, [state.groupId, state.peer]);

  // const toggleAudio = (isMuted: boolean) => {
  //   if (state.localStream) {
  //     const audioTrack = state.localStream.getAudioTracks()[0];
  //     if (audioTrack) {
  //       audioTrack.enabled = !isMuted;
  //       dispatch({ type: "TOGGLE_AUDIO", payload: !isMuted });

  //       if (wsRef.current) {
  //         wsRef.current.send(
  //           JSON.stringify({
  //             type: "TOGGLE_AUDIO",
  //             peerId: state.peer?._id,
  //             Muted: !isMuted,
  //             groupId: state.groupId,
  //           })
  //         );
  //       }
  //     }
  //   }
  // };

  console.log("peers", Object.keys(state?.peers));
  console.log("my id", state?.peer);

  useEffect(() => {
    if (state.token) {
      localStorage.setItem("authToken", state.token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [state.token]);

  return (
    <VideoContext.Provider value={{ state, dispatch }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
