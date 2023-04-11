import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import ChatMessage from './ChatMessage';
import { subscribeToChannel } from "../lib/ably";
import pusher from '../lib/pusher';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';

function ChatWindow({ conversationId, conversation, setConversation, newMessage, sendMessage, updateMessageValue, starredMessages, setStarredMessages, referencedMessage, setReferencedMessage, userInfo }) {
    const scrollContainer = useRef(null);
    const channelRef = useRef(null);
    const [socketId, setSocketId] = useState(null);
    const [submitLocket, setSubmitLock] = useState(false);
    const updateConversationMutation = trpc.conversations.updateMessages.useMutation();
    const messageCount = useRef(conversation.messages.length);

    pusher.connection.bind('connected', async () => {
        setSocketId(pusher.connection.socket_id);
        subscribeToChannel();
    });

    pusher.connection.bind('error', (error) => {
        console.log('Pusher subscription failed:', error);
    });

    const subscribeToChannel = async () => {
        if (typeof conversationId === 'undefined') {
            return;
        }
        if (channelRef.current) {
            channelRef.current.unsubscribe();
        }

        let channelName = `private-conversation-${conversationId}`;
        const auth = await client.pusher.authenticate.query({
            socketId: pusher.connection.socket_id,
            channelName: channelName,
        })
        channelRef.current = pusher.subscribe(channelName, auth);
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
        event.stopPropagation();
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        } else {
            if (channelRef) {
                console.log("client is typing", channelRef.current);
                channelRef.current?.trigger('client-is-typing', {
                    ...newMessage,
                    inProgress: true,
                });
            }
        }
    }

    async function updateConversation(messageIndex, updatedMessage, isEdit = false) {
        if (conversation.messages[messageIndex].starred != updatedMessage.starred) {
            if (updatedMessage.starred) {
                setStarredMessages([...starredMessages, updatedMessage]);
            } else {
                setStarredMessages(starredMessages.filter((t) => t.id !== updatedMessage.id));
            }
        }
        conversation.messages[messageIndex] = updatedMessage
        const updatedMessages = isEdit ? conversation.messages.filter((message, index) => {
            return index <= messageIndex;
        }) : [...conversation.messages];
        console.log(updatedMessages, updatedMessages.length);
        let updatedConversation = {
            ...conversation,
            messages: updatedMessages,
        }
        setConversation(updatedConversation)
        if (isEdit) {
            const updated = updateConversationMutation.mutate(updatedConversation);
            console.log(updated)
            updatedConversation = await client.openai.query.mutate((updatedConversation));
            setConversation({
                ...updatedConversation,
                messages: updatedConversation.messages,
            });
        }
    }

    let messageEnd = null;
    useEffect(() => {
        if (messageCount.current < conversation.messages.length) {
            messageEnd?.scrollIntoView({ behaviour: "smooth" });
        }
        messageCount.current = conversation.messages.length;
    }, [conversation]);
    if (!conversation.messages) {
        return <></>
    }
    return (
        <div className="mx-auto max-w-[760px]">
            <div className="p-1.5 pt-0 pb-0 mt-0 overflow-y-auto" id="messages-box" ref={scrollContainer}>
                {conversation.messages.map((message, index) => {
                    return (
                        <ChatMessage
                            key={conversation.id + index}
                            index={index}
                            message={message}
                            avatarSource={message.avatarSource}
                            sender={message.role == "user" ? (message.sender || userInfo) : "ChatGPT-3.5"}
                            received={true}
                            updateState={updateConversation}
                            setConversation={setConversation}
                            referencedMessage={referencedMessage}
                            onClick={() => {
                                setReferencedMessage(message.id == referencedMessage?.id ? null : message);
                            }}
                            userInfo={userInfo}
                        />
                    );
                })}
                <div ref={(element) => { messageEnd = element; }}></div>
            </div>
            <form className="flex items-end max-w-[760px] mb-3" id="chat-form">
                <AutoExpandTextarea
                    value={newMessage.content}
                    onChange={(updateMessageValue)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    className="w-full p-2 mr-2 bg-dark"
                />
                <span className="button-container">
                    <button type="button" onClick={sendMessage} className="font-semibold uppercase p-2">Send</button>
                </span>
            </form>
        </div>
    );
}

export default ChatWindow;
