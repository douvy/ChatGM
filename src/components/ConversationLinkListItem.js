import React from 'react';
import { useRouter } from 'next/router';

function ConversationLinkListItem({ conversation, isActive, selectConversation }) {
  const router = useRouter();

  function handleClick() {
    // router.push(`/chats/${conversation.id}`);
    selectConversation(conversation);
  }
  return (
    <a onClick={handleClick} href="#" className={isActive ? "active" : ""}>
      <li className="p-2 pl-4 whitespace-nowrap overflow-x-auto">
        <i className="far fa-message-middle fa-lg mr-4"></i>
        {conversation.name}
      </li>
    </a>
  );
}

export default ConversationLinkListItem;