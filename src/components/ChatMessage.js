import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

function ChatMessage({ index, message, avatarSource, sender, updateConversation }) {
  const [localMessage, setLocalMessage] = useState(message);

  const currentTimestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const customRenderer = {
    p: ({ children }) => (
      <>
        {children.map((child, index) => {
          if (typeof child === 'string') {
            const parts = child.split('\n');
            return parts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {part}
              </React.Fragment>
            ));
          }
          return child;
        })}
      </>
    ),
  };

  const starMessage = async () => {
    const updatedMessage = {
      ...localMessage,
      starred: !localMessage.starred
    };
    setLocalMessage(updatedMessage);
    const response = await fetch(`/api/messages/${message.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMessage),
    });
    updateConversation(index, updatedMessage);
  };

  return (
    <div className="w-full box">
      <div className="message p-4 pt-4 relative">
        <img src={avatarSource} alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-2" />
        <div className="pl-16 pt-0">
          <span className="text-sm mb-1 inline-block name">{sender}</span> <br />
          <p className="text-xs inline-block absolute top-3 right-4 timestamp">
            <span className="message-direction">
              {sender == 'ChatGPT-3.5' ? 'Received' : 'Sent'}
              <i
                className={`fa-regular ${sender == 'ChatGPT-3.5' ? 'fa-arrow-down-left' : 'fa-arrow-up-right'
                  } fa-lg ml-1 mr-3 mt-2`}
              ></i>
            </span>{' '}
            {currentTimestamp}
            <i className={`fa-star ${localMessage.starred ? 'fa-solid' : 'fa-regular'} ml-2 cursor-pointer`} onClick={starMessage}></i>
          </p>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            children={localMessage.content}
            components={customRenderer}
          />
        </div>
      </div>
    </div>

  );
}

export default ChatMessage;