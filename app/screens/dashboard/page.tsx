"use client";

import React, { useEffect, useState } from "react";
import { Input, Button, Card, Spacer } from "@nextui-org/react";
import PulseImage from "@/app/components/UI/Image";
import { useVideoContext } from "@/app/context/VideoContext";
import { useRouter } from "next/navigation";

type groups ={
    ID:Number,
    GroupName:string,
    AuthorId:Number

}

export default function Page() {
    const [groupName, setGroupName] = useState("");
    const [groupList, setGroupList] = useState<string[]>([]);
    const [groups,setgroups] =useState<groups[]>([])
    const {state, dispatch} = useVideoContext();

    const navigate=useRouter()

    useEffect(()=>{
        async function getGroups(){
            const response=await  fetch('http://localhost:8080/groupDetails', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`,
                }
            });
            const data=await response.json()
            setgroups(data)
        }
        void getGroups()
    },[])


    const handleAddGroup = async () => {
        await fetch('http://localhost:8080/group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`,
            },
            body: JSON.stringify({ groupName: groupName.trim() }),
        });
    };

    const handleEnterChatRoom = (groupId: Number) => {
        navigate.push(`videoPage/${groupId}`)
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-[#f7f9fc] rounded-lg shadow-md">
            <div className="flex justify-center mb-8">
                <PulseImage
                    src="/let-talk-logo.jpg"
                    alt="Let's Talk Logo"
                    width={150}
                    height={150}
                    enablePulse={true}
                />
            </div>
            <Input
                isClearable
                placeholder="Enter Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full mb-2"
            />
            <Button onClick={handleAddGroup} className="w-full mb-4">
                Add Group
            </Button>
            <Card className="max-h-80 overflow-auto">
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Group List</h2>
                    {groups.length > 0 ? (
                        groups.map((group, index) => (
                            <div
                                key={index}
                                className="flex items-center p-4 mb-4 bg-black rounded-lg shadow-sm cursor-pointer transition-transform transform hover:scale-105"
                                onClick={() => handleEnterChatRoom(group?.ID)}
                            >
                                <div className="w-10 h-10 rounded-full bg-[#3b82f6] mr-4"></div>
                                <span className="text-lg font-semibold">
                                    {index + 1}. {group?.GroupName}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p>No groups added yet!</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
