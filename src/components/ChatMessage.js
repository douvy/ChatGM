import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

function ChatMessage({ message, avatarSource, sender, received = false }) {
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

  return (
    <div className="w-full box">
      <div className="message p-4 pt-4 relative">
        <img src={avatarSource} alt="Avatar" className="w-9 h-9 rounded-full absolute left-4 top-2" />
        <div className="pl-16 pt-0">
          <span className="text-sm mb-1 inline-block name">{sender}</span> <br />
          <p className="text-xs inline-block absolute top-3 right-4 timestamp">
            <span className="message-direction">
              {received ? 'Received' : 'Sent'}
              <i
                className={`fa-regular ${
                  received ? 'fa-arrow-down-left' : 'fa-arrow-up-right'
                } fa-lg ml-1 mr-3 mt-2`}
              ></i>
            </span>{' '}
            {currentTimestamp}
          </p>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            children={message}
            components={customRenderer}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;