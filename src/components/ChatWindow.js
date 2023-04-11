import { useRef, useEffect, useState } from 'react';
import AutoExpandTextarea from './AutoExpandTextarea';
import ChatMessage from './ChatMessage';
import { subscribeToChannel } from '../lib/ably';
import pusher from '../lib/pusher';
import { client } from '../trpc/client';
import { trpc } from '../utils/trpc';
import MentionPopover from './MentionPopover'; // Import the MentionPopover component

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

  // New state and ref for the MentionPopover
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const cursorPositionRef = useRef(null);

  // Existing pusher subscription code...
  // Existing useEffect for pusher subscription...

  const [position, setPosition] = useState({ top: 0, left: 0 });

  function handleKeyDown(event) {
    event.stopPropagation();
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    } else {
      if (channelRef) {
        channelRef.current?.trigger('client-is-typing', {
          ...newMessage,
          inProgress: true
        });
      }
      if (event.key === '@') {
        setIsMentionOpen(true);
        cursorPositionRef.current = event.target.selectionStart;
      } else {
        setIsMentionOpen(false);
      }
    }
  }

  // Existing functions...

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
        {/* Existing message rendering code... */}
      </div>
      <form className='flex items-end max-w-[760px] mb-3' id='chat-form'>
        <AutoExpandTextarea
          value={newMessage.content}
          onChange={updateMessageValue}
          onKeyDown={handleKeyDown}
          placeholder='Type your message here...'
          className='w-full p-2 mr-2 bg-dark'
          conversationId={conversationId}
        />
        {/* Send button */}
      </form>

      {/* Conditionally render MentionPopover */}
      {isMentionOpen && (
        <MentionPopover
          onSelect={(username) => {
            const textBeforeCursor = newMessage.content.slice(0, cursorPositionRef.current);
            const textAfterCursor = newMessage.content.slice(cursorPositionRef.current);
            updateMessageValue(textBeforeCursor + username + textAfterCursor);
            setIsMentionOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default ChatWindow;
