import { useEffect, useState } from 'react';
import ConversationLinkListItem from './ConversationLinkListItem';

function ConversationLinkList({ conversations, activeConversation, selectConversation, session }) {
  return (
    <ul className="pl-3">
      <a href="#" id="new-chat"><li className="p-2 mt-2 pl-4"><i className="far fa-arrow-up-right fa-lg"></i> New Chat</li></a>
      <a href="#"><li className="p-2  pl-4 mb-3 mt-1"><img src="/avatar.png" className="w-7 h-7 rounded-full" /><span className="ml-3">{session.user.username}</span></li></a>
      {conversations.map((conversation, index) => {
        return <ConversationLinkListItem key={index} selectConversation={selectConversation} conversation={conversation} isActive={activeConversation._id == conversation._id} />
      })}
    </ul>
  );
};

export default ConversationLinkList;