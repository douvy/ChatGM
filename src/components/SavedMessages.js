import { useState, useRef } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import ChatMessage from './ChatMessage';

function SavedMessages({ starredMessages, role }) {
    const scrollContainer = useRef(null);

    return (
        <div className="mx-auto max-w-[760px]">
            <div className="p-4 overflow-y-auto" id="messages-box" ref={scrollContainer}>
                {starredMessages.filter((message) => {
                    console.log(message);
                    return message.role == role;
                }).map((message, index) => {
                    return (
                        <ChatMessage
                            key={message.id}
                            index={index}
                            message={message}
                            avatarSource={message.role == "user" ? message.avatarSource : "avatar-chat.png"}
                            sender={message.role == "user" ? message.sender : "ChatGPT-3.5"}
                            received={true}
                            updateConversation={() => { }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default SavedMessages;
