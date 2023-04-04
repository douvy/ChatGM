import React from 'react';

function ConversationLinkListItem({ conversation, isActive, selectConversation, setCurrentRoute }) {
  function handleClick() {
    selectConversation(conversation.id);
    // setCurrentRoute('/');
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