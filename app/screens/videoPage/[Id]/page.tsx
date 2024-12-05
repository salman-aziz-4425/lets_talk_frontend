"use client";

import { useVideoContext } from "@/app/context/VideoContext";
import { useEffect, useState, useRef } from "react";

export default function Page({ params }: { params: { Id: string } }) {
    const { state, dispatch } = useVideoContext();
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const streamInitialized = useRef(false); // Prevent duplicate initialization

    useEffect(() => {
        if (params?.Id) {
            dispatch({ type: "SET_GROUP", payload: params.Id });
            if (streamInitialized.current || state.localStream || state.peer) return;

            streamInitialized.current = true;
    
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    dispatch({ type: "SET_LOCAL_STREAM", payload: stream });
                    console.log("Local stream initialized");
                })
                .catch((error) => {
                    console.error("Error accessing media devices:", error);
                });
        }
        return () => {
          console.log("Cleaning up local stream");
        }
    }, [params?.Id]);

    useEffect(() => {
        if (!state.peer || !state.localStream || !params?.Id) return;

        const call = state.peer.call(params.Id, state.localStream);

        call.on("stream", (incomingStream: MediaStream) => {
            console.log("Incoming stream from peer:", params.Id);
            dispatch({ type: "ADD_PEER", payload: { peerId: params.Id, stream: incomingStream } });
        });

        call.on("close", () => {
            console.log("Call with peer closed:", params.Id);
            dispatch({ type: "REMOVE_PEER", payload: params.Id });
        });

        call.on("error", (err:any) => {
            console.error("Error during call:", err);
        });
    }, [params?.Id, dispatch]);

    const toggleMute = () => {
        if (state.localStream) {
            const audioTrack = state.localStream.getAudioTracks()[0];
            if (audioTrack) {
                console.log("Toggling audio track");
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                if (state?.ws) {
                    state.ws.send(JSON.stringify({
                        type: "TOGGLE_AUDIO",
                        peerId: state.peer._id,
                        Muted: !audioTrack.enabled
                    }));
                }
            }
        }
    };

    const toggleVideo = () => {
        if (state.localStream) {
            const videoTrack = state.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
                console.log("Toggling video track");
                if (state?.ws) {
                    state.ws.send(JSON.stringify({
                        type: "TOGGLE_VIDEO",
                        peerId: state.peer._id,
                        isVideoOff:videoTrack.enabled
                    }));
                }
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Group Video Chat</h1>
            <video
                autoPlay
                playsInline
                muted={isMuted}
                className="w-96 h-64 border-4 border-blue-500 rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
                ref={(video) => {
                    if (video && state.localStream) video.srcObject = state.localStream;
                }}
            />
            <div className="flex flex-wrap justify-center gap-6">
                {Object.entries(state.peers).map(([peerId, stream]:any) => (
                    peerId !== state?.peer?._id && (
                        <video
                        key={peerId}
                        autoPlay
                        playsInline
                        className="w-72 h-48 border-4 border-green-500 rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
                        ref={(video) => {
                            if (video) video.srcObject = stream;
                        }}
                    />
                    )
                   
                ))}
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={toggleMute}
                    className={`px-4 py-2 rounded-lg shadow-lg transition duration-300 ${
                        isMuted ? "bg-green-500" : "bg-red-500"
                    } text-white`}
                >
                    {isMuted ? "Unmute" : "Mute"}
                </button>
                <button
                    onClick={toggleVideo}
                    className={`px-4 py-2 rounded-lg shadow-lg transition duration-300 ${
                        isVideoOff ? "bg-green-500" : "bg-blue-500"
                    } text-white`}
                >
                    {isVideoOff ? "Turn Video On" : "Turn Video Off"}
                </button>
                <button className={`px-4 py-2 rounded-lg shadow-lg transition duration-300 ${
                        isVideoOff ? "bg-green-500" : "bg-blue-500"
                    } text-white`} onClick={()=>{
                    state?.ws?.send(JSON.stringify({type:"REMOVE_PEER",Group:state.groupId,peerId:state.peer._id}))
                }}>
                    <a href="/screens/dashboard">Leave Group</a>
                </button>
            </div>
        </div>
    );
}
