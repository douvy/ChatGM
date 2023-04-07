import { signOut } from 'next-auth/react';

function SidebarItem({ itemText, iconName, onClick, link = '#', isActive }) {
    return (
        <a href={link} class={isActive ? 'active' : ''}>
            <li className="p-2 pl-3" onClick={onClick}>
                <i className={`far fa-${iconName} mr-4 w-4`}></i> {itemText}
            </li>
        </a>
    );
}

export default function Sidebar({ setConversations, setConversation, setActiveComponent, features, currentRoute, setCurrentRoute, session }) {
    return (
        <div>
            <ul className="pl-3">
                {/* <SidebarItem iconName="trash-can-xmark" itemText="Clear Conversations" onClick={handleClearConversations} /> */}
                {/*<SidebarItem iconName="brightness" itemText="Light Mode" />*/}

                {currentRoute == '/conversations'}
                <SidebarItem iconName="user-hair-mullet text-blue" itemText="My Account" onClick={() => {
                    setCurrentRoute('/myAccount');
                }} />

                {/*<SidebarItem iconName="check-square" itemText="Todos" onClick={() => {
                    setCurrentRoute('/tasks');
                }} />
                {/*<SidebarItem iconName="check-square" itemText="Features" onClick={() => {
                    setCurrentRoute('/features');
                }} />*/}
                <SidebarItem iconName="fa-solid fa-messages text-gray" isActive={currentRoute == "/conversations" ? true : false} itemText="Conversations" onClick={() => {
                    setCurrentRoute('/conversations');
                }} />
                <SidebarItem iconName="fa-solid fa-stars text-yellow" isActive={currentRoute == "/savedPrompts" ? true : false} itemText="Saved prompts" onClick={() => {
                    setCurrentRoute('/savedPrompts');
                }} />
                <SidebarItem iconName="fa-solid fa-stars text-yellow" isActive={currentRoute == "/savedResponses" ? true : false} itemText="Saved responses" onClick={() => {
                    setCurrentRoute('/savedResponses');
                }} />
                <SidebarItem iconName="fa-solid fa-toolbox text-purple" isActive={currentRoute == "/builder" ? true : false} itemText="Component builder" onClick={() => {
                    setCurrentRoute('/builder');
                }} />
                <SidebarItem iconName="arrow-right-from-bracket text-red" isActive={currentRoute == "/auth/signin" ? true : false} itemText="Log Out" onClick={() => {
                    signOut({
                        callbackUrl: '/auth/signin',
                    });
                }} />
            </ul>
        </div>
    );
}
