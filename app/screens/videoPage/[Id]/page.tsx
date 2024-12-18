"use client";

import PulseImage from "@/app/components/UI/Image";
import { useVideoContext } from "@/app/context/VideoContext";
import useMediaStream from "@/hooks/useMediaStream";
import { Spacer } from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function Page({ params }: { params: { Id: string } }) {
    const { state, dispatch } = useVideoContext();
    const { stream, setState }: any = useMediaStream();
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const streamInitialized = useRef(false);

    useEffect(() => {
        if (params?.Id) {
            dispatch({ type: "SET_GROUP", payload: params.Id });
            streamInitialized.current = true;
            dispatch({ type: "SET_LOCAL_STREAM", payload: stream });
        }
    }, [params?.Id]);

    const toggleMute = () => {
        const audioTrack = stream.getAudioTracks()[0];
        const newMutestatus = !audioTrack?.enabled;
        console.log("Toggling audio track");
        audioTrack.enabled = !audioTrack.enabled;
        const updatedStream = stream;
        updatedStream.getAudioTracks()[0].enabled = audioTrack.enabled;
        setState(updatedStream);
        if (state?.ws) {
            dispatch({ type: "SET_TOGGLE_AUDIO_STATE", payload: newMutestatus });
            state.ws.send(
                JSON.stringify({
                    type: "TOGGLE_AUDIO",
                    Group: state.groupId,
                    peerId: state.peer._id,
                    Muted: !audioTrack.enabled,
                })
            );
        }
        setIsMuted(newMutestatus);
    };

    const toggleVideo = () => {
        const videoTrack = stream?.getVideoTracks()[0];
        const isVideoOff = !videoTrack.enabled;
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(isVideoOff);
        const updatedStream = new MediaStream([...stream.getTracks()]);
        updatedStream.getVideoTracks()[0].enabled = isVideoOff;
        if (state?.ws && state?.peer?._id) {
            dispatch({ type: "SET_TOGGLE_VIDEO_STATE", payload: isVideoOff });
            state.ws.send(
                JSON.stringify({
                    type: "TOGGLE_VIDEO",
                    peerId: state.peer._id,
                    isVideoOff,
                })
            );
        }
        setState(updatedStream);
    };

    if (state?.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center w-full">
                <div className="flex flex-col items-center justify-center">
                    <PulseImage
                        src="/let-talk-logo.jpg"
                        alt="Let's Talk Logo"
                        width={300}
                        height={300}
                        enablePulse={true}
                    />
                    <div className="spinner spinner-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen rounded-lg bg-black text-white">
            <div className="flex flex-col items-center justify-center w-3/4 relative">
                <h1 className="text-3xl font-bold mb-6">Group Video Chat</h1>
                <video
                    autoPlay
                    playsInline
                    muted={!stream?.getAudioTracks()[0]?.enabled}
                    style={{ transform: "rotateY(180deg)" }}
                    className="w-2/3 h-auto border-4 border-blue-500 rounded-lg shadow-lg"
                    ref={(video) => {
                        if (video && stream) video.srcObject = stream;
                    }}
                />
                <div
                    onClick={toggleMute}
                    className={`absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 cursor-pointer ${isMuted ? "text-green-500" : "text-red-500"
                        }`}
                >
                    <i className={`fas fa-microphone${isMuted ? "-slash" : ""} text-3xl`}></i>
                </div>

                <div className="mt-6 flex gap-6">
                    <button
                        onClick={toggleMute}
                        className={`px-4 py-2 rounded-lg shadow-lg transition duration-300 ${!stream?.getAudioTracks()[0]?.enabled ? "bg-green-500" : "bg-red-500"
                            } text-white`}
                    >
                        {!stream?.getAudioTracks()[0]?.enabled ? "Unmute" : "Mute"}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={`px-4 py-2 rounded-lg shadow-lg transition duration-300 ${!stream?.getVideoTracks()[0]?.enabled ? "bg-green-500" : "bg-blue-500"
                            } text-white`}
                    >
                        {!stream?.getVideoTracks()[0]?.enabled ? "Turn Video On" : "Turn Video Off"}
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg shadow-lg bg-red-500 transition duration-300 text-white`}
                        onClick={() => {
                            state?.ws?.send(
                                JSON.stringify({
                                    type: "REMOVE_PEER",
                                    Group: state.groupId,
                                    peerId: state.peer._id,
                                })
                            );
                        }}
                    >
                        <Link href="/screens/dashboard">Leave Group</Link>
                    </button>
                </div>
            </div>

            <div className="w-1/4 flex flex-col items-center justify-start p-4">
                <h2 className="text-xl font-bold mb-4">Remote Users</h2>
                <div className="flex flex-col gap-4">
                    {Object.entries(state.peers).map(([peerId, stream]: any) =>
                        peerId !== state?.peer?._id ? (
                            <video
                                key={peerId}
                                autoPlay
                                muted={!stream?.getAudioTracks()[0]?.enabled}
                                playsInline
                                style={{ transform: "rotateY(180deg)" }}
                                className="w-full h-32 border-4 border-green-500 rounded-lg shadow-lg"
                                ref={(video) => {
                                    if (video) video.srcObject = stream;
                                }}
                            />
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
}
