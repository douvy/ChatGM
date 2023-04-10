import React, { useState } from 'react';
import { Conversation } from '../interfaces';
import { trpc } from '../utils/trpc';

interface TopbarProps {
    conversation: Conversation,
    userInfo: any,
    addSystemMessage: (...args: any) => Promise<any>
}

const Topbar: React.FC<TopbarProps> = ({ conversation, userInfo, addSystemMessage }) => {
    const [isMembersExpanded, setIsMembersExpanded] = useState(true);
    const removeParticipantMutation = trpc.conversations.removeParticipant.useMutation();

    return (
        <>
            <header className="flex items-center justify-between px-4 py-2 relative" id="top-nav">
                {/* Members dropdown title */}
                {(conversation?.participants?.length || 0) > 1 &&
                    <div className="flex items-center space-x-2">
                        <div
                            className="flex items-center cursor-pointer w-190"
                            onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                        >
                            <i className={`fa-solid mr-2 w-3 ${isMembersExpanded ? 'fa-arrow-down' : 'fa-arrow-right'} ml-2`}></i>
                            <span>{`${conversation.participants?.length} members`}</span>
                        </div>
                    </div>
                }
                <h1 className="text-xl font-semibold">&nbsp;</h1>
                <nav className="space-x-4">
                    <a href="#" className="hover:text-blue-300"></a>
                </nav>
            </header>
            {/* Members dropdown content */}
            {(conversation?.participants?.length || 0) > 1 && isMembersExpanded && (
                <div className="absolute mt-14 pl-4" id="members">
                    <ul className="pl-0">
                        {conversation.participants?.map((participant) => (
                            <li className="group cursor-pointer hover-dark rounded items-center space-x-2 p-2 pl-1" key={`${conversation.id}/${participant.id}`}>
                                {participant.avatarSource ? <img src={participant.avatarSource} className="rounded-full h-6 w-6 mr-1" /> :
                                    <div className={`h-4 w-4 rounded-full ${participant.id == conversation.creatorId ? 'bg-yellow' : 'bg-green-bright'} mr-1`}>
                                    </div>}
                                <span className="text-offwhite">{participant.username} {participant.id == conversation.creatorId ? '(creator)' : ''}</span>
                                {participant.id != userInfo.id && <div className="pl-4 pt-1 group-hover:block hidden flex items-center float-right background-orange-300">
                                    <i className="fa-light fa-close float-right hover:font-bold" onClick={async () => {
                                        let updatedConversation = await removeParticipantMutation.mutateAsync({
                                            conversationId: conversation.id as number,
                                            participantUsername: participant.username,
                                        });
                                        updatedConversation = await addSystemMessage(`${userInfo.username} removed ${participant.username} from the conversation.`);
                                        console.log(updatedConversation);
                                    }} />
                                </div>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default Topbar;
