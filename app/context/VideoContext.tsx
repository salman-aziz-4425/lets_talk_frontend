import React, { createContext, useReducer, useContext, useEffect, useRef, ReactNode } from "react";

import useMediaStream from "@/hooks/useMediaStream";
import Peer from "peerjs";
import { VideoAction } from "@/types";
import { VideoState } from "@/types";
import { videoReducer } from "../screens/videoPage/videoReducer";
import { initializePeer } from "@/hooks/usePeer";

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
  muted: typeof window !== "undefined" ? localStorage.getItem("muted") === "true"?true:false : null,
  videoOff: typeof window !== "undefined" ? localStorage.getItem("videoOff") === "true"?true:false : null,
};

const VideoContext = createContext<{
  state: VideoState;
  dispatch: React.Dispatch<VideoAction>;
}>({ state: initialState, dispatch: () => null });

export const VideoContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);
  const peerRef = useRef<Peer | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { stream }: any = useMediaStream();

  useEffect(() => {
    if (!state.groupId) return;
    if (!peerRef.current) {
      const peer = initializePeer(dispatch, stream);
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
            const updatedStream: MediaStream = stream;
            // console.log("Calling peer:", message.peerId);
            // console.log( localStorage.getItem("muted") ==='true')
            // console.log( localStorage.getItem("videoOff") ==='true')
            const call = peer?.call(message.peerId, updatedStream,{
              metadata: {
                peerId: peerId,
                isMuted:  typeof window !== "undefined"?localStorage.getItem("muted") ==='true'?true:false:true,
                isVideoOff:  typeof window !== "undefined"?localStorage.getItem("videoOff") ==='true'?true:false:true,
              },
            });
            call?.on("stream", (remoteStream) => {
              dispatch({ type: "ADD_PEER", payload: { peerId: message.peerId, stream: remoteStream } });
            });
          }
          if (message.type === "REMOVE_PEER") {
            dispatch({ type: "REMOVE_PEER", payload: message.peerId });
          }
          if (message.type === "TOGGLE_AUDIO") {
            dispatch({
              type: "TOGGLE_AUDIO",
              payload: { peerId: message.peerId, Muted: message.Muted },
            });
          }
          if (message.type === "TOGGLE_VIDEO") {
            dispatch({
              type: "TOGGLE_VIDEO",
              payload: { peerId: message.peerId, VideoOff: message.isVideoOff },
            });
          }
        };
      });

      return () => {
        console.log("Cleaning up peer call for ID:");
      };
    }
  }, [state?.groupId, dispatch]);
  useEffect(() => {
    if (state?.token) {
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
