import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

function SidebarItem({ itemText, iconName, onClick, link = '', isActive }) {
  return (
    <a className={`cursor-pointer ${isActive ? 'active' : ''}`}>
      <li className='p-2 pl-3' onClick={onClick}>
        <i className={`fa-solid fa-${iconName} mr-4 w-4`}></i> {itemText}
      </li>
    </a>
  );
}

export default function SidebarNav({
  setConversations,
  setConversation,
  setActiveComponent,
  features,
  currentRoute,
  setCurrentRoute,
  session,
  userInfo
}) {
  const router = useRouter();
  const path = router.asPath;

  return (
    <div>
      <ul className='pl-3'>
        {/* <SidebarItem iconName="trash-can-xmark" itemText="Clear Conversations" onClick={handleClearConversations} /> */}
        {/*<SidebarItem iconName="brightness" itemText="Light Mode" />*/}

        {currentRoute == '/conversations'}
        <SidebarItem
          iconName='user-hair-mullet text-blue'
          isActive={path == '/account' ? true : false}
          itemText='My Account'
          onClick={() => {
            router.push('/account', '/account', { shallow: true });
            setConversation(null);
          }}
        />

        {userInfo.includeTaskFeature ? (
          <SidebarItem
            iconName='fa-sharp fa-regular text-orange fa-list-check'
            isActive={path == '/tasks' ? true : false}
            itemText='Todos'
            onClick={() => {
              router.push('/tasks', '/tasks', { shallow: true });
              setCurrentRoute('/tasks');
              setConversation(null);
            }}
          />
        ) : (
          <></>
        )}
        {userInfo.includeNotepad ? (
          <SidebarItem
            iconName='fa-solid fa-memo-pad text-pink'
            isActive={path == '/notepad' ? true : false}
            itemText='Notepad'
            onClick={() => {
              router.push('/notepad', '/notepad', { shallow: true });
              setCurrentRoute('/notepad');
              setConversation(null);
            }}
          />
        ) : (
          <></>
        )}
        {/* <SidebarItem iconName="check-square" itemText="Features" onClick={() => {
                    setCurrentRoute('/features');
                }} /> */}
        {/* <SidebarItem iconName="fa-solid fa-messages text-gray" isActive={currentRoute == "/conversations" ? true : false} itemText="Conversations" onClick={() => {
                    setCurrentRoute('/conversations');
                }} /> */}
        <SidebarItem
          iconName='fa-solid fa-stars text-yellow'
          isActive={path == '/savedPrompts' ? true : false}
          itemText='Saved prompts'
          onClick={() => {
            router.push('/prompts', '/prompts', { shallow: true });
            setCurrentRoute('/savedPrompts');
            setConversation(null);
          }}
        />
        <SidebarItem
          iconName='fa-solid fa-stars text-yellow'
          isActive={path == '/savedResponses' ? true : false}
          itemText='Saved responses'
          onClick={() => {
            router.push('/saved/responses', '/saved/responses', {
              shallow: true
            });
            setCurrentRoute('/savedResponses');
            setConversation(null);
          }}
        />
        <SidebarItem
          iconName='fa-solid fa-toolbox text-purple'
          isActive={path == '/builder' ? true : false}
          itemText='Component builder'
          onClick={() => {
            router.push('/builder', '/builder', { shallow: true });
            setCurrentRoute('/builder');
            setConversation(null);
          }}
        />
        <SidebarItem
          iconName='arrow-right-from-bracket text-red'
          // isActive={path == '/auth/signin' ? true : false}
          itemText='Log Out'
          onClick={() => {
            signOut({
              callbackUrl: '/auth/signin'
            });
          }}
        />
      </ul>
    </div>
  );
}
