import { useState, useRef } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import ChatMessage from './ChatMessage';
import ChatResponse from './ChatResponse';

function ChatWindow({ conversation, setConversation, newMessage, setMessage, sendMessage }) {
    const scrollContainer = useRef(null);

    function setMessageValue(event) {
        setMessage({ content: event.target.value });
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    return (
        <div>
            <div className="p-4 overflow-y-auto" id="messages-box" ref={scrollContainer}>
                {conversation.messages.map((message, index) => {
                    if (message.role === 'user') {
                        return (
                            <ChatMessage key={index} message={message.content} avatarSource={message.avatarSource} sender={message.sender} />
                        );
                    } else {
                        return (
                            <ChatResponse key={index} response={message.content} />
                        );
                    }
                })}
            </div>

            <form className="flex items-end max-w-[760px] p-4 md:p-4" id="chat-form">
                <AutoExpandTextarea
                    value={newMessage.content}
                    onChange={setMessageValue}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="w-full p-2 mr-2"
                />
                <span className="button-container">
                    <button type="button" onClick={sendMessage} className="font-semibold uppercase p-2">Send</button>
                </span>
            </form>
        </div>
    );
}

export default ChatWindow;
