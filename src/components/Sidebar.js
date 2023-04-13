import ConversationLinkList from './ConversationLinkList';
import SidebarNav from './SidebarNav';

export default function Sidebar({
  conversations,
  setConversation,
  conversation,
  conversationId,
  selectConversation,
  userInfo,
  setUserInfo,
  newConversation,
  setConversations,
  currentRoute,
  setCurrentRoute,
  setActiveComponent,
  style,
  ...props
}) {
  return (
    <nav
      className='fixed h-full w-[228px] shadow-md hidden lg:block br-1-gray bg-dark'
      style={style}
    >
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
      <i
        className={`fa-solid fa-arrow-left cursor-pointer text-gray w-5 h-5 mr-auto mb-3 ml-3 absolute bottom-0 left-0 transform transition duration-300 hover:scale-125 hover:font-bold`}
        onClick={e => setUserInfo({ ...userInfo, hideSidebar: true })}
      ></i>
    </nav>
  );
}
