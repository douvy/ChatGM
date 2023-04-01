import { useState, useRef } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import ChatMessage from './ChatMessage';
import ChatResponse from './ChatResponse';

function ChatWindow({ conversation, setConversation, newMessage, sendMessage, updateMessageValue, messageContent, setMessageContent, updateConversations }) {
    const scrollContainer = useRef(null);
    console.log(conversation);

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function updateMessageContent(e) {
        setMessage(e.target.value);
    }

    console.log(updateMessageValue, "updateMessageValue");
    console.log(messageContent, "messageContent");

    function updateConversation(messageIndex, updatedMessate) {
        console.log(conversation.messages[messageIndex].starred);
        console.log(updatedMessate.starred);
        conversation.messages[messageIndex] = updatedMessate
        const updatedMessages = [...conversation.messages];
        conversation.messages = updatedMessages
        setConversation(conversation);
    }

    return (
        <div className="mx-auto max-w-[760px]">
            <div className="p-4 overflow-y-auto" id="messages-box" ref={scrollContainer}>
                {conversation.messages.map((message, index) => {
                    return (
                        <ChatMessage
                            key={conversation._id + index}
                            index={index}
                            message={message}
                            avatarSource={message.role == "user" ? message.avatarSource : "avatar-chat.png"}
                            sender={message.role == "user" ? message.sender : "ChatGPT-3.5"}
                            received={true}
                            updateConversation={updateConversation}
                        />
                    );
                })}
            </div>

            <form className="flex items-end max-w-[760px] p-4 md:p-4" id="chat-form">
                <AutoExpandTextarea
                    value={newMessage.content}
                    onChange={(updateMessageValue)}
                    // onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="w-full p-2 mr-2 bg-white"
                />
                <span className="button-container">
                    <button type="button" onClick={sendMessage} className="font-semibold uppercase p-2">Send</button>
                </span>
            </form>
        </div>
    );
}

export default ChatWindow;
