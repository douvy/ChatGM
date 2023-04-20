import React from 'react';
import ChatMessage from './ChatMessage';

function ChatResponse({ message }) {
  return (
    <ChatMessage
      message={message}
      avatarSource="avatar-chat.png"
      sender="ChatGPT-3.5"
      received={true}
    />
  );
}

export default ChatResponse;