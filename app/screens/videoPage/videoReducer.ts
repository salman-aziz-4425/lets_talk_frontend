import { VideoAction } from "@/types";
import { VideoState } from "@/types";


export const videoReducer = (state: VideoState, action: VideoAction): VideoState => {
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
    case "SET_TOGGLE_AUDIO_STATE": {
      localStorage.setItem("muted", action.payload);
      return { ...state, muted: action.payload };
    }
    case "SET_TOGGLE_VIDEO_STATE": {
      localStorage.setItem("videoOff", action.payload);
      return { ...state, videoOff: action.payload };
    }
    default:
      return state;
  }
};
