import React, { useEffect, useState, useRef } from 'react';
import ConversationLinkListItem from './ConversationLinkListItem';
import { useRouter } from 'next/router';

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function ConversationLinkList({
  conversations,
  setConversation,
  activeConversation,
  activeConversationId,
  selectConversation,
  userInfo,
  setUserInfo,
  newConversation,
  setConversations,
  currentRoute,
  c
}) {
  const router = useRouter();

  const [isPersonalExpanded, setIsPersonalExpanded] = useState(
    conversations.filter(c => c.participants?.length <= 1).length > 0
  );
  const [isGroupExpanded, setIsGroupExpanded] = useState(
    conversations.filter(c => c.participants?.length > 1).length > 0
  );
  const prevConversations = usePrevious(conversations);

  const personalConversations = conversations.filter(
    conversation => conversation.participants?.length <= 1
  );
  const groupConversations = conversations.filter(
    conversation => conversation.participants?.length > 1
  );

  useEffect(() => {
    console.log('C', c);
    switch (c?.key) {
      case 'ArrowUp':
        // if (activeTaskIndex > 0) {
        //   setActiveTask(tasks[activeTaskIndex - 1], activeTaskIndex - 1);
        // }
        break;
      case 'ArrowDown':
        // if (activeTaskIndex < tasks.length - 1) {
        //   setActiveTask(tasks[activeTaskIndex + 1], activeTaskIndex + 1);
        // }
        break;
    }
  }, [c]);

  function removeConversation(conversation) {
    const updatedConversations = conversations.filter(
      t => t.id !== conversation.id
    );
    setConversations(updatedConversations);
  }

  function updateConversations(updatedConversation) {
    setConversations([
      ...conversations.map(conversation => {
        return conversation.id === updatedConversation.id
          ? updatedConversation
          : conversation;
      })
    ]);
  }

  useEffect(() => {
    if (
      !isPersonalExpanded &&
      prevConversations?.length < conversations.length
    ) {
      setIsPersonalExpanded(personalConversations.length > 0);
    }
    if (!isGroupExpanded && prevConversations?.length < conversations.length) {
      setIsGroupExpanded(groupConversations.length > 0);
    }
  }, [conversations]);

  return (
    <div className='overflow-y-auto' id='sidebar-top'>
      <div className='z-0'>
        <ul className='pl-3'>
          <div className='sticky top-0 bg-dark z-20 relative sticky-cover'>
            <div className='sticky top-2 bg-dark z-20'>
              <div
                onClick={() => {
                  router.push('/');
                  newConversation();
                }}
                id='new-chat'
                className='border-1 nav-item' // Removed the conditional class assignment
              >
                <li className='p-3 mt-1 pl-4 w-4/5 cursor-pointer'>
                  <i className='fa-solid fa-arrow-up-right fa-lg'></i> New Chat
                </li>
                {!userInfo.hideSidebar && (
                  <div className='w-1/4 cursor-default'>
                    <i
                      className={`fa-solid fa-arrow-left cursor-pointer text-gray w-5 h-5 mb-3 ml-3 absolute top-4 right-0 transform transition duration-300 hover:scale-125 hover:font-bold`}
                      onClick={e =>
                        setUserInfo({ ...userInfo, hideSidebar: true })
                      }
                    ></i>
                  </div>
                )}
              </div>
              <a href='#'>
                <li className='p-2 pl-4 mb-3 mt-1'>
                  <img
                    src={userInfo.avatarSource || '/avatar.png'}
                    className='w-7 h-7 rounded-full'
                  />
                  <span className='ml-3'>{userInfo?.username}</span>
                </li>
              </a>
            </div>
            <li
              className='p-2 pl-4 text-offwhite cursor-pointer'
              onClick={() => setIsPersonalExpanded(!isPersonalExpanded)}
            >
              <i
                className={`fa-solid text-offwhite ${
                  isPersonalExpanded
                    ? 'fa-arrow-down pr-2'
                    : 'fa-arrow-right pr-2'
                }`}
              ></i>{' '}
              Personal
            </li>
            {isPersonalExpanded && (
              <div className='max-h-[315px] overflow-y-auto'>
                <ul className='pl-0'>
                  {personalConversations.map((conversation, index) => {
                    return (
                      <ConversationLinkListItem
                        key={index}
                        index={index}
                        selectConversation={() => {
                          router.push(
                            '/conversations/[id]',
                            `/conversations/${conversation.id}`
                          );
                          selectConversation(conversation);
                        }}
                        conversation={conversation}
                        isActive={activeConversationId == conversation.id}
                        removeConversation={removeConversation}
                        setConversation={setConversation}
                        updateConversations={updateConversations}
                      />
                    );
                  })}
                </ul>
              </div>
            )}
            <li
              className='p-2 pl-4 mt-1 text-offwhite cursor-pointer'
              onClick={() => setIsGroupExpanded(!isGroupExpanded)}
            >
              <i
                className={`fa-solid text-offwhite ${
                  isGroupExpanded ? 'fa-arrow-down pr-2' : 'fa-arrow-right pr-2'
                }`}
              ></i>{' '}
              Group
            </li>
            {isGroupExpanded && (
              <div className='max-h-[315px] overflow-y-auto'>
                <ul className='pl-0'>
                  {groupConversations.map((conversation, index) => {
                    return (
                      <ConversationLinkListItem
                        key={index}
                        index={index}
                        selectConversation={selectConversation}
                        conversation={conversation}
                        isActive={activeConversationId == conversation.id}
                        removeConversation={removeConversation}
                        setConversation={setConversation}
                        updateConversations={updateConversations}
                      />
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </ul>
      </div>
    </div>
  );
}

export default ConversationLinkList;
