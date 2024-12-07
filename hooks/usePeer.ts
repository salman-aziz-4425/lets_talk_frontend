import { VideoAction } from "@/types";
import Peer from "peerjs";

export const initializePeer = (dispatch: React.Dispatch<VideoAction>, myStream: MediaStream) => {
  const peer = new Peer();
  console.log("initialize peer", myStream);

  peer.on("call", (call) => {
    const { peerId, isMuted, isVideoOff } = call.metadata || {};
    // console.log(call.peer)
    // console.log("myStream", myStream);
    // console.log("metaData", call.metadata);
    // console.log("Received call from peer:", peerId || "Unknown");
    // console.log("Is peer muted?", isMuted || "Unknown");
    // console.log("Is peer video off?",isVideoOff|| "Unknown");
    call.answer(myStream);
    call.on("stream", (remoteStream) => {
      console.log("Adding peer stream:", call.peer);
      remoteStream.getAudioTracks()[0].enabled = isMuted;
      remoteStream.getVideoTracks()[0].enabled =  isVideoOff;
      dispatch({ type: "ADD_PEER", payload: { peerId: call.peer, stream: remoteStream } });
    });
  });

  return peer;
};
