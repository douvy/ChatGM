import ConversationLinkList from './ConversationLinkList';
import SidebarNav from './SidebarNav';

export default function Sidebar({
  conversations,
  setConversation,
  conversation,
  conversationId,
  selectConversation,
  userInfo,
  newConversation,
  setConversations,
  currentRoute,
  setCurrentRoute,
  setActiveComponent,
  ...props
}) {
  return (
    <nav className='fixed h-full w-[228px] shadow-md hidden lg:block br-1-gray bg-dark'>
      <ConversationLinkList
        conversations={conversations}
        setConversation={setConversation}
        activeConversation={conversation}
        activeConversationId={conversationId}
        selectConversation={selectConversation}
        userInfo={userInfo}
        newConversation={newConversation}
        setConversations={setConversations}
        currentRoute={currentRoute}
        c={props.c}
      ></ConversationLinkList>
      <hr className='my-4 border-t' />
      <SidebarNav
        setConversations={setConversations}
        setConversation={setConversation}
        setActiveComponent={setActiveComponent}
        features={props.features}
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
        session={props.session}
        userInfo={userInfo}
      />
    </nav>
  );
}
