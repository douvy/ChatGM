import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';

function ConversationLinkListItem({ conversation, setConversation, isActive, selectConversation, removeConversation, updateConversations }) {
  const router = useRouter();
  const [showIcons, setShowIcons] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const [localConversationName, setLocalConversationName] = useState(conversation.name);
  const deleteConversationMutation = trpc.conversations.delete.useMutation();
  const updateConversationName = trpc.conversations.updateName.useMutation();

  function handleClick() {
    setShowIcons(true);
    selectConversation(conversation);
  }

  const handleDelete = async () => {
    try {
      const response = await deleteConversationMutation.mutate(conversation.id);
      console.log("delete response:", response);
      removeConversation(conversation)
    } catch (error) {
      console.error(error);
    }
  };

  const updateConversation = async () => {
    let updatedConversation = {
      ...conversation,
      name: localConversationName
    }
    setConversation(updatedConversation)
    const response = await updateConversationName.mutate(updatedConversation);
    updateConversations(updatedConversation)
    setEditingMessage(false);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      updateConversation();
    }
  }

  return (

    <a onClick={handleClick}
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
      href="#" className={isActive ? "active" : ""}>
      <li className="p-2 pl-3 whitespace-nowrap overflow-hidden flex items-center justify-between relative">
        <div className="flex items-center space-x-4">
          <i className="far fa-message-middle text-gray"></i>
          <span
            className="inline-block"
            style={{
              maxWidth: '',
              whiteSpace: 'nowrap',
              textOverflow: 'clip',
              overflow: 'hidden',
            }}
          >
            {!editingMessage ? conversation.name :
              <form className="p-0 m-0">
                <input value={localConversationName} className="border-1 max-h-9 p-0 m-0 h-auto w-full border-none focus:outline-none" rows="1" autoFocus={true} spellCheck="false" onInput={(e) => {
                  setLocalConversationName(
                    e.target.value,
                  )
                }} onKeyDown={handleKeyDown}>
                </input>
              </form>}
          </span>
        </div>
        {(isActive || showIcons) && (
          <span
            className="inline-block ml-2 z-10 absolute right-0 top-1/2 transform -translate-y-1/2"
            style={{
              boxShadow: '0 0 0px rgba(0, 0, 0, 0.3)',
              background: 'linear-gradient(90deg, #2E3034 100%, transparent)',
            }}
          >
            {!editingMessage ? <i className="far fa-pen-to-square mr-2 ml-5 text-gray hover-offwhite" onClick={() => {
              setEditingMessage(true);
            }}></i> : <i className="fa-solid fa-check mr-2 ml-5 text-gray hover-offwhite" onClick={updateConversation}></i>}
            <i className="fas fa-trash text-gray hover-offwhite mr-2" onClick={handleDelete}></i>
          </span>
        )}
      </li>
    </a>
  );
}

export default ConversationLinkListItem;