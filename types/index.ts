import { SVGProps } from "react";
import { Peer } from "peerjs";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type VideoState = {
    videos: string[];
    selectedVideo: string | null;
    token: string | null;
    username: string | null;
    groupId: string | null;
    peer: any | null;
    peers: Record<string, MediaStream>;
    localStream: MediaStream | null;
    ws: any | null;
    muted: boolean | null;
    videoOff: boolean | null;
    loading: boolean;
  };
  
  export type VideoAction =
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
    | { type: "TOGGLE_VIDEO"; payload: any }
    | { type: "SET_TOGGLE_AUDIO_STATE"; payload: any }
    | { type: "SET_TOGGLE_VIDEO_STATE"; payload: any }
    | { type: "SET_LOADING"; payload: boolean };
  