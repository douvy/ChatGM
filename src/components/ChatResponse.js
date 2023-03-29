import React from 'react';
import ChatMessage from './ChatMessage';

function ChatResponse({ response }) {
  return (
    <ChatMessage
      message={response}
      avatarSource="avatar-chat.png"
      sender="ChatGPT-3.5"
      received={true}
    />
  );
}

export default ChatResponse;