import { signOut } from 'next-auth/react';

function SidebarItem({ itemText, iconName, onClick, link = '#' }) {
    return (
        <a href={link}>
            <li className="p-2 pl-4" onClick={onClick}>
                <i className={`far fa-${iconName} fa-lg mr-4 w-4`}></i> {itemText}
            </li>
        </a>
    );
}

export default function Sidebar({ setConversations, setConversation, setActiveComponent, features, setCurrentRoute, session }) {
    return (
        <div>
            <ul className="pl-3">
                {/* <SidebarItem iconName="trash-can-xmark" itemText="Clear Conversations" onClick={handleClearConversations} /> */}
                {/*<SidebarItem iconName="brightness" itemText="Light Mode" />*/}
               

                <SidebarItem iconName="user-hair-mullet" itemText="My Account" onClick={() => {
                    setCurrentRoute('/myAccount');
                }} />


                {/*<SidebarItem iconName="coin" itemText="Crypto" />*/}
                {/*<SidebarItem iconName="check-square" itemText="Todos" onClick={() => {
                    setCurrentRoute('/tasks');
                }} />*/}
                {/*<SidebarItem iconName="check-square" itemText="Features" onClick={() => {
                    setCurrentRoute('/features');
                }} />*/}
                <SidebarItem iconName="fa-solid fa-messages" itemText="Conversations" onClick={() => {
                    setCurrentRoute('/conversations');
                }} />
                <SidebarItem iconName="fa-solid fa-bookmark" itemText="Saved prompts" onClick={() => {
                    setCurrentRoute('/savedPrompts');
                }} />
                <SidebarItem iconName="fa-solid fa-bookmark" itemText="Saved responses" onClick={() => {
                    setCurrentRoute('/savedResponses');
                }} />
                <SidebarItem iconName="fa-solid fa-toolbox" itemText="Component builder" onClick={() => {
                    setCurrentRoute('/builder');
                }} />
                <SidebarItem iconName="arrow-right-from-bracket" itemText="Log Out" onClick={() => {
                    signOut({
                        callbackUrl: '/auth/signin',
                    });
                }} />
            </ul>
        </div>
    );
}
