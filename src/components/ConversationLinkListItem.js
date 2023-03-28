import React from 'react';

function ConversationLinkListItem({ conversation, isActive, selectConversation }) {
  function handleClick() {
    selectConversation(conversation);
  }
  return (
    <a onClick={handleClick} href="#" className={isActive ? "active" : ""}>
      <li className="p-2 pl-4 whitespace-nowrap overflow-x-auto">
        <i className="far fa-message-middle fa-xl mr-4"></i>
        {conversation.name}
      </li>
    </a>
  );
}

export default ConversationLinkListItem;