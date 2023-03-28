import React from 'react';

function ConversationLinkListItem({ name, isActive }) {
  return (
    <a href="#" className={isActive ? "active" : ""}>
      <li className="p-2 pl-4 whitespace-nowrap overflow-x-auto">
        <i className="far fa-message-middle fa-xl mr-4"></i>
        {name}
      </li>
    </a>
  );
}

export default ConversationLinkListItem;