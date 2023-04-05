import ConversationLinkListItem from './ConversationLinkListItem';

function ConversationLinkList({ conversations, activeConversation, selectConversation, session, newConversation }) {
  return (
    <div>
      <ul className="pl-3">
        <a href="#" onClick={newConversation} id="new-chat"><li className="p-2 mt-2 pl-4"><i className="far fa-arrow-up-right fa-lg"></i> New Chat</li></a>
        <a href="#"><li className="p-2  pl-4 mb-3 mt-1"><img src="/avatar.png" className="w-7 h-7 rounded-full" /><span className="ml-3">{session ? session.user.username : ''}</span></li></a>
      </ul>
      <div className="max-h-[280px] overflow-y-auto">
        <ul className="pl-3">
          {conversations.map((conversation, index) => {
            return <ConversationLinkListItem key={index} index={index} selectConversation={selectConversation} conversation={conversation} isActive={activeConversation.id == conversation.id} />
          })}
        </ul>
      </div>
    </div>
  )
}

export default ConversationLinkList;
