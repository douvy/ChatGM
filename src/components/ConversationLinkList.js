import React, { useState } from 'react';
import ConversationLinkListItem from './ConversationLinkListItem';

function ConversationLinkList({ conversations, setConversation, activeConversation, activeConversationId, selectConversation, userInfo, newConversation, setConversations, currentRoute }) {
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(conversations.filter((c) => c.participants?.length <= 1).length > 0);
  const [isGroupExpanded, setIsGroupExpanded] = useState(conversations.filter((c) => c.participants?.length > 1).length > 0);

  function removeConversation(conversation) {
    const updatedConversations = conversations.filter((t) => t.id !== conversation.id);
    setConversations(updatedConversations);
  }

  function updateConversations(updatedConversation) {
    setConversations([
      ...conversations.map((conversation) => { return conversation.id === updatedConversation.id ? updatedConversation : conversation })
    ])
  }

  return (
    <div className="overflow-y-auto" id="sidebar-top">
      <ul className="pl-3">
        <a href="#" onClick={newConversation} id="new-chat" className={!activeConversationId && currentRoute == '/'
          ? "active" : ""}>
          <li className="p-2 mt-2 pl-4">
            <i className="fa-solid fa-arrow-up-right fa-lg"></i> New Chat
          </li>
        </a>
        <a href="#">
          <li className="p-2 pl-4 mb-3 mt-1">
            <img src={userInfo.avatarSource || "/avatar.png"} className="w-7 h-7 rounded-full" />
            <span className="ml-3">{userInfo?.username}</span>
          </li>
        </a>
        <li className="p-2 pl-4 text-offwhite cursor-pointer" onClick={() => setIsPersonalExpanded(!isPersonalExpanded)}>
          <i className={`fa-solid text-offwhite ${isPersonalExpanded ? 'fa-arrow-down pr-2' : 'fa-arrow-right pr-2'}`}></i> Personal
        </li>
        {isPersonalExpanded && (
          <div className="max-h-[315px] overflow-y-auto">
            <ul className="pl-0">
              {conversations.filter((conversation) => conversation.participants?.length <= 1).map((conversation, index) => {
                return <ConversationLinkListItem key={index} index={index} selectConversation={selectConversation} conversation={conversation} isActive={activeConversationId == conversation.id} removeConversation={removeConversation} setConversation={setConversation} updateConversations={updateConversations} />
              })}
            </ul>
          </div>
        )}
        <li className="p-2 pl-4 mt-1 text-offwhite cursor-pointer" onClick={() => setIsGroupExpanded(!isGroupExpanded)}>
          <i className={`fa-solid text-offwhite ${isGroupExpanded ? 'fa-arrow-down pr-2' : 'fa-arrow-right pr-2'}`}></i> Group
        </li>
        {isGroupExpanded && (
          <div className="max-h-[315px] overflow-y-auto">
            <ul className="pl-0">
              {conversations.filter((conversation) => conversation.participants?.length > 1).map((conversation, index) => {
                return <ConversationLinkListItem key={index} index={index} selectConversation={selectConversation} conversation={conversation} isActive={activeConversationId == conversation.id} removeConversation={removeConversation} setConversation={setConversation} updateConversations={updateConversations} />
              })}
            </ul>
          </div>
        )}
      </ul>
    </div>
  )
}

export default ConversationLinkList;