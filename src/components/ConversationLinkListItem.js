import React from 'react';

function ConversationLinkListItem({ conversation, selectConversation }) {
  function handleClick() {
    selectConversation(conversation);
  }
  return (
    <a onClick={handleClick} href="#" className={conversation?.isActive ? "active" : ""}>
      <li className="p-2 pl-4">
        <i className="far fa-message-middle fa-xl mr-4"></i>
        {conversation.name}
      </li>
    </a>
  );
}

export default ConversationLinkListItem;