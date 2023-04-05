import { useRef, useEffect } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import ChatMessage from './ChatMessage';
import { subscribeToChannel } from "../lib/ably";

function ChatWindow({ conversation, setConversation, newMessage, sendMessage, updateMessageValue, starredMessages, setStarredMessages }) {
    const scrollContainer = useRef(null);

    // useEffect(() => {
    //     subscribeToChannel("active-conversation", () => {
    //     });
    // }, []);

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function updateConversation(messageIndex, updatedMessage) {
        if (conversation.messages[messageIndex].starred != updatedMessage.starred) {
            if (updatedMessage.starred) {
                setStarredMessages([...starredMessages, updatedMessage]);
            } else {
                setStarredMessages(starredMessages.filter((t) => t.id !== updatedMessage.id));
            }
        }
        conversation.messages[messageIndex] = updatedMessage
        const updatedMessages = [...conversation.messages];
        conversation.messages = updatedMessages;
        setConversation(conversation);
    }

    let messageEnd = null;
    useEffect(() => {
        messageEnd.scrollIntoView({ behaviour: "smooth" });
    }, [conversation]);
    if (!conversation.messages) {
        return <></>
    }
    return (
        <div className="mx-auto max-w-[760px]">
            <div className="p-4 overflow-y-auto" id="messages-box" ref={scrollContainer}>
                {conversation.messages.map((message, index) => {
                    return (
                        <ChatMessage
                            key={conversation.id + index}
                            index={index}
                            message={message}
                            avatarSource={message.role == "user" ? message.avatarSource : "avatar-chat.png"}
                            sender={message.role == "user" ? message.sender : "ChatGPT-3.5"}
                            received={true}
                            updateState={updateConversation}
                        />
                    );
                })}
                <div ref={(element) => { messageEnd = element; }}></div>
            </div>

            <form className="flex items-end max-w-[760px] p-4 md:p-4" id="chat-form">
                <AutoExpandTextarea
                    value={newMessage.content}
                    onChange={(updateMessageValue)}
                    onKeyDown={handleKeyDown}
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
