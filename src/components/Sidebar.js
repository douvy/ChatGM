function SidebarItem({ itemText, iconName, onClick }) {
    return (
        <a href="#">
            <li className="p-2 pl-4" onClick={onClick}>
                <i className={`far fa-${iconName} fa-lg mr-4`}></i> {itemText}
            </li>
        </a>
    );
}

export default function Sidebar({ setConversations, setConversation, handleLogout }) {
    function handleClearConversations() {
        fetch('/api/clearConversations')
            .then(response => response.json())
            .then(data => {
                if (data === true) {
                    setConversations([]);
                    setConversation({
                        messages: [],
                    });
                }
            })
            .catch(error => console.error(error));
    }

    return (
        <div>
            <ul className="pl-3">
                <SidebarItem iconName="trash-can-xmark" itemText="Clear Conversations" onClick={handleClearConversations} />
                <SidebarItem iconName="brightness" itemText="Light Mode" />
                <SidebarItem iconName="user-hair-mullet" itemText="My Account" />
                <SidebarItem iconName="arrow-right-from-bracket" itemText="Log Out" onClick={handleLogout} />
                <SidebarItem iconName="coin" itemText="Crypto" />
                <SidebarItem iconName="check-square" itemText="Todos" />
                <SidebarItem iconName="check-square" itemText="Features" />
            </ul>
        </div>
    );
}