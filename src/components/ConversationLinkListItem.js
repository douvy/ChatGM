import React, { useState } from 'react';
import { useRouter } from 'next/router';

function ConversationLinkListItem({ conversation, isActive, selectConversation }) {
  const router = useRouter();
  const [showIcons, setShowIcons] = useState(false);

  function handleClick() {
    setShowIcons(true);
    selectConversation(conversation);
  }

  return (

    <a onClick={handleClick}
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
      href="#" className={isActive ? "active" : ""}>
      <li className="p-2 pl-3 whitespace-nowrap overflow-hidden flex items-center justify-between relative">
        <div className="flex items-center space-x-4">
          <i className="far fa-message-middle text-gray"></i>
          <span
            className="inline-block"
            style={{
              maxWidth: 'calc(100% - 100px)',
              whiteSpace: 'nowrap',
              textOverflow: 'clip',
              overflow: 'hidden',
            }}
          >
            {conversation.name}
          </span>
        </div>
        {(isActive || showIcons) && (
          <span
            className="inline-block ml-2 z-10 absolute right-0 top-1/2 transform -translate-y-1/2"
            style={{
              boxShadow: '0 0 0px rgba(0, 0, 0, 0.3)',
              background: 'linear-gradient(90deg, #2E3034 60%, transparent)',
            }}
          >
            <i className="far fa-pen-to-square mr-2 ml-5 text-gray hover-offwhite"></i>
            <i className="fas fa-trash text-gray hover-offwhite mr-2"></i>
          </span>
        )}
      </li>
    </a>
  );
}

export default ConversationLinkListItem;