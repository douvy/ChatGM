import { useEffect, useState } from 'react';
import ConversationLinkListItem from './ConversationLinkListItem';

function ConversationLinkList({ conversations, activeConversation, selectConversation, session, setCurrentRoute, newConversation }) {
  return (
    <ul className="pl-3">
      <a href="#" onClick={newConversation} id="new-chat"><li className="p-2 mt-2 pl-4"><i className="far fa-arrow-up-right fa-lg"></i> New Chat</li></a>
      <a href="#"><li className="p-2  pl-4 mb-3 mt-1"><img src="/avatar.png" className="w-7 h-7 rounded-full" /><span className="ml-3">{session.user.username}</span></li></a>
      {conversations.map((conversation, index) => {
        return <ConversationLinkListItem key={index} index={index} selectConversation={selectConversation} conversation={conversation} isActive={activeConversation.id == conversation.id} setCurrentRoute={setCurrentRoute} />
      })}
    </ul>
  );
};

export default ConversationLinkList;