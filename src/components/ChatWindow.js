import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import ChatMessage from './ChatMessage';
import { subscribeToChannel } from "../lib/ably";
import pusher from '../lib/pusher';
import Pusher from 'pusher-js';
import { client } from '../trpc/client';

function ChatWindow({ conversationId, conversation, setConversation, newMessage, sendMessage, updateMessageValue, starredMessages, setStarredMessages }) {
    const scrollContainer = useRef(null);
    const channelRef = useRef(null);
    const [socketId, setSocketId] = useState(null);
    const [submitLocket, setSubmitLock] = useState(false);

    pusher.connection.bind('connected', async () => {
        setSocketId(pusher.connection.socket_id);
        subscribeToChannel();
    });

    const subscribeToChannel = async () => {
        if (channelRef.current) {
            channelRef.current.unsubscribe();
        }

        let channelName = `private-conversation-${conversationId}`;
        const auth = await client.pusher.authenticate.query({
            socketId: pusher.connection.socket_id,
            channelName: channelName,
        })
        channelRef.current = pusher.subscribe(channelName, auth);
        console.log("current channel:", channelRef.current);
        channelRef.current.bind('new-message', function (data) {
            setConversation(data.conversation);
        });
        channelRef.current.bind('client-is-typing', function (newMessage) {
            console.log("someone is typing!", newMessage);
            if (!submitLocket) {
                setSubmitLock(true);
                console.log("newMessage", newMessage);
                if (newMessage.content) {
                    setConversation({
                        ...conversation,
                        messages: [...conversation.messages, newMessage]
                    });
                } else {
                    setConversation(conversation);
                }

            }
            // setConversation(data.conversation);
        });
    }

    useEffect(() => {
        subscribeToChannel();
    }, [conversationId]);

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        } else {
            if (channelRef) {
                console.log("client is typing", channelRef.current);
                // channelRef.current.trigger('client-is-typing', {
                //     message: conversation.message,
                // });
                channelRef.current?.trigger('client-is-typing', {
                    ...newMessage,
                    inProgress: true,
                });
            }
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
        messageEnd?.scrollIntoView({ behaviour: "smooth" });
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
                    placeholder="Type your message here..."
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
