import React, { useState } from 'react';
import { Conversation } from '../interfaces';

interface ConversationMembersProps {
    conversation: Conversation,
    userInfo: any,
}

const ConversationMembers: React.FC<ConversationMembersProps> = ({ conversation, userInfo }) => {
    const [isMembersExpanded, setIsMembersExpanded] = useState(true);

    if (!conversation.participants || conversation.participants?.length <= 1) {
        return <></>;
    }

    return (
        <>
            <header className="flex items-center justify-between px-4 py-2 relative" id="top-nav">
                {/* Members dropdown title */}
                <div className="flex items-center space-x-2">
                    <div
                        className="flex items-center cursor-pointer w-190"
                        onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                    >
                        <i className={`fa-solid mr-2 w-3 ${isMembersExpanded ? 'fa-arrow-down' : 'fa-arrow-right'} ml-2`}></i>
                        <span>{`${conversation.participants?.length} members`}</span>
                    </div>
                </div>
                <h1 className="text-xl font-semibold">&nbsp;</h1>
                <nav className="space-x-4">
                    <a href="#" className="hover:text-blue-300"></a>
                </nav>
            </header>
            {/* Members dropdown content */}
            {isMembersExpanded && (
                <div className="absolute mt-14 pl-4" id="members">
                    <ul className="pl-0">
                        {conversation.participants?.map((participant) => (
                            <li className="flex items-center space-x-2 p-1" key={participant.id}>
                                <div className={`h-4 w-4 rounded-full ${participant.id == conversation.creatorId ? 'bg-yellow-400' : 'bg-green-bright'} mr-1`}></div>
                                <span className="text-offwhite">{participant.username} {participant.id == conversation.creatorId ? '(creator)' : ''}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default ConversationMembers;
