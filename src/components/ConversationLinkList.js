import ConversationLinkListItem from './ConversationLinkListItem';

function ConversationLinkList({ conversations, setConversation, activeConversation, activeConversationId, selectConversation, userInfo, newConversation, setConversations }) {

  function removeConversation(conversation) {
    setConversations(conversations.filter((t) => t.id !== conversation.id));
  }

  function updateConversations(updatedConversation) {
    setConversations([
      ...conversations.map((conversation) => { return conversation.id === updatedConversation.id ? updatedConversation : conversation })
    ])
  }

  return (
    <div id="sidebar-top">
      <ul className="pl-3">
        <a href="#" onClick={newConversation} id="new-chat" className={!activeConversationId
          ? "active" : ""}><li className="p-2 mt-2 pl-4"><i className="far fa-arrow-up-right fa-lg"></i> New Chat</li></a>
        <a href="#"><li className="p-2  pl-4 mb-3 mt-1"><img src="/avatar.png" className="w-7 h-7 rounded-full" /><span className="ml-3">{userInfo?.username}</span></li></a>
      </ul>
      <div className="max-h-[315px] overflow-y-auto">
        <ul className="pl-3">
          {conversations.map((conversation, index) => {
            return <ConversationLinkListItem key={index} index={index} selectConversation={selectConversation} conversation={conversation} isActive={activeConversationId == conversation.id} removeConversation={removeConversation} setConversation={setConversation} updateConversations={updateConversations} />
          })}
        </ul>
      </div>
    </div>
  )
}

export default ConversationLinkList;
