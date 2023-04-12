import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import ChatMessage from './ChatMessage';
import { subscribeToChannel } from '../lib/ably';
import pusher from '../lib/pusher';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import MentionPopover from './MentionPopover';

function ChatWindow({
  conversationId,
  conversation,
  setConversation,
  newMessage,
  sendMessage,
  updateMessageValue,
  starredMessages,
  setStarredMessages,
  referencedMessage,
  setReferencedMessage,
  userInfo
}) {
  const scrollContainer = useRef(null);
  const channelRef = useRef(null);
  const [socketId, setSocketId] = useState(null);
  const [submitLocket, setSubmitLock] = useState(false);
  const updateConversationMutation =
    trpc.conversations.updateMessages.useMutation();
  const messageCount = useRef(conversation.messages.length);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    client.users.query
      .query({
        id: true,
        username: true
      })
      .then(users => {
        setUsers(users);
      });
  }, []);

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const cursorPositionRef = useRef(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  pusher.connection.bind('connected', async () => {
    setSocketId(pusher.connection.socket_id);
    subscribeToChannel();
  });

  pusher.connection.bind('error', error => {
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
      channelName: channelName
    });
    channelRef.current = pusher.subscribe(channelName, auth);
    channelRef.current.bind('new-conversation', function (data) {
      setConversation(data.conversation);
    });
    channelRef.current.bind('new-message', function (data) {
      if (data.conversationId != conversation.id) {
        return;
      }
      setConversation({
        ...conversation,
        messages: [...conversation.messages, data.message]
      });
    });

    channelRef.current.bind('client-is-typing', function (newMessage) {
      console.log('someone is typing!', newMessage);
      if (!submitLocket) {
        setSubmitLock(true);
        console.log('newMessage', newMessage);
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
  };

  useEffect(() => {
    subscribeToChannel();
  }, [conversationId]);

  function handleKeyDown(event) {
    event.stopPropagation();
    if (event.key === '@') {
      setIsMentionOpen(true);
      cursorPositionRef.current = event.target.selectionStart;
      setSelectedUserIndex(0); // Reset the selected user index
    } else if (event.key === 'ArrowUp') {
      // Move the selection up in the list, and if at the top, move to the bottom
      if (isMentionOpen) {
        setSelectedUserIndex((prevIndex) => (prevIndex - 1 + users.length) % users.length);
        event.preventDefault();
      }
    } else if (event.key === 'ArrowDown') {
      // Move the selection down in the list, and if at the bottom, move to the top
      if (isMentionOpen) {
        setSelectedUserIndex((prevIndex) => (prevIndex + 1) % users.length);
        event.preventDefault();
      }
    } else if (event.key === 'Enter' && isMentionOpen) {
      // Select the highlighted user when the Enter key is pressed
      if (users[selectedUserIndex]) {
        onSelect(users[selectedUserIndex].username);
        setIsMentionOpen(false);
      }
    } else if (event.key !== 'Shift' && event.key !== 'Meta') {
      setIsMentionOpen(false);
    }
    if (event.key === 'Enter' && !event.shiftKey && !isMentionOpen) {
      event.preventDefault();
      sendMessage();
    } else {
      // ... (existing code) ...
    }
  }  
  

  async function updateConversation(
    messageIndex,
    updatedMessage,
    isEdit = false
  ) {
    if (conversation.messages[messageIndex].starred != updatedMessage.starred) {
      if (updatedMessage.starred) {
        setStarredMessages([...starredMessages, updatedMessage]);
      } else {
        setStarredMessages(
          starredMessages.filter(t => t.id !== updatedMessage.id)
        );
      }
    }
    conversation.messages[messageIndex] = updatedMessage;
    const updatedMessages = isEdit
      ? conversation.messages.filter((message, index) => {
          return index <= messageIndex;
        })
      : [...conversation.messages];
    console.log(updatedMessages, updatedMessages.length);
    let updatedConversation = {
      ...conversation,
      messages: updatedMessages
    };
    setConversation(updatedConversation);
    if (isEdit) {
      const updated = updateConversationMutation.mutate(updatedConversation);
      console.log(updated);
      updatedConversation = await client.openai.query.mutate(
        updatedConversation
      );
      setConversation({
        ...updatedConversation,
        messages: updatedConversation.messages
      });
    }
  }

  let messageEnd = null;
  useEffect(() => {
    if (messageCount.current < conversation.messages.length) {
      messageEnd?.scrollIntoView({ behaviour: 'smooth' });
    }
    messageCount.current = conversation.messages.length;
  }, [conversation]);

  if (!conversation.messages) {
    return <></>;
  }
  return (
    <div className='mx-auto max-w-[760px]'>
      <div
        className='p-1.5 pt-0 pb-0 mt-0 overflow-y-auto'
        id='messages-box'
        ref={scrollContainer}
      >
        {conversation.messages.map((message, index) => {
          return (
            <ChatMessage
              key={conversation.id + index}
              index={index}
              message={message}
              avatarSource={`/${message.avatarSource}`}
              sender={
                message.role == 'user'
                  ? message.sender || userInfo
                  : 'ChatGPT-3.5'
              }
              received={true}
              updateState={updateConversation}
              setConversation={setConversation}
              referencedMessage={referencedMessage}
              onClick={() => {
                setReferencedMessage(
                  message.id == referencedMessage?.id ? null : message
                );
              }}
              userInfo={userInfo}
            />
          );
        })}
        <div
          ref={element => {
            messageEnd = element;
          }}
        ></div>
      </div>
      <form className='flex items-end max-w-[760px] mb-3' id='chat-form'>
        <AutoExpandTextarea
          value={newMessage.content}
          onChange={updateMessageValue}
          onKeyDown={handleKeyDown}
          placeholder='Type your message here...'
          className='w-full p-2 mr-2 bg-dark'
          conversationId={conversationId}
          //   autoFocus={true}
        />
        <span className='button-container'>
          <button
            type='button'
            onClick={sendMessage}
            className='font-semibold uppercase p-2'
          >
            Send
          </button>
        </span>
      </form>
      {isMentionOpen && (
        <MentionPopover
          users={users}
          selectedUserIndex={selectedUserIndex}
          onSelect={username => {
            const textBeforeCursor = newMessage.content.slice(
              0,
              cursorPositionRef.current
            );
            const textAfterCursor = newMessage.content.slice(
              cursorPositionRef.current
            );
            updateMessageValue(textBeforeCursor + username + textAfterCursor);
            setIsMentionOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default ChatWindow;
