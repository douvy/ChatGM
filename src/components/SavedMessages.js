import { useState, useRef } from 'react';
import ChatMessage from './ChatMessage';

function SavedMessages({
  starredMessages,
  setStarredMessages,
  role,
  setReferencedMessage,
  setConversationId,
  userInfo
}) {
  const scrollContainer = useRef(null);
  const messagesToShow = starredMessages.filter(message => {
    // console.log(message);
    return message.role == role;
  });

  return (
    <div className='container mx-auto max-w-[760px] mt-3 md:mt-5' id='saved'>
      <h1 className='hidden text-title font-medium uppercase mb-5 text-white tracking-wide md:block'>
        Saved
      </h1>
      {messagesToShow.length > 0 && (
        <div
          className='overflow-y-auto'
          id='messages-box'
          ref={scrollContainer}
        >
          {messagesToShow.map((message, index) => {
            return (
              <ChatMessage
                onClick={() => {
                  setReferencedMessage(message);
                  setConversationId(message.conversationId);
                }}
                key={message.id}
                index={index}
                message={message}
                avatarSource={
                  message.role == 'user'
                    ? message.avatarSource
                    : 'avatar-chat.png'
                }
                sender={message.role == 'user' ? message.sender : 'ChatGPT-3.5'}
                received={true}
                updateState={(index, updatedMessage) => {
                  // const updatedMessages = [...starredMessages];
                  // updatedMessages[index] = updatedMessage;
                  // setStarredMessages(updatedMessages)
                  setStarredMessages(
                    starredMessages.filter(t => t.id !== updatedMessage.id)
                  );
                }}
                userInfo={userInfo}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavedMessages;
