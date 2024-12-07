
import { VideoAction } from "@/types";
import Peer from "peerjs";


export const initializePeer = (dispatch: React.Dispatch<VideoAction>, myStream: any) => {
  const peer = new Peer();
  console.log("initialize peer", myStream);
  peer.on("call", (call) => {
    console.log("myStream", myStream);
    call.answer(myStream);
    call.on("stream", (remoteStream) => {
      console.log("Adding peer stream:", call.peer);
      dispatch({ type: "ADD_PEER", payload: { peerId: call.peer, stream: remoteStream } });
    });
  });

  return peer;
};
