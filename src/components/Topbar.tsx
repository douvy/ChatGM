import React, { useState } from 'react';
import { Conversation } from '../interfaces';
import { trpc } from '../utils/trpc';
import NotificationsMenu from './NotificationsMenu';
import { useRouter } from 'next/router';

interface TopbarProps {
  conversation: Conversation;
  userInfo: any;
  addSystemMessage: (...args: any) => Promise<any>;
}

const Topbar: React.FC<TopbarProps> = ({
  conversation,
  userInfo,
  addSystemMessage
}) => {
  const [isMembersExpanded, setIsMembersExpanded] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const removeParticipantMutation =
    trpc.conversations.removeParticipant.useMutation();

  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const notificationData = trpc.notifications.get.useQuery({});

  const router = useRouter();

  return (
    <>
      <header
        className='flex items-center justify-between px-4 py-2 relative'
        id='top-nav'
      >
        {/* Members dropdown title */}
        {(conversation?.participants?.length || 0) > 1 && (
          <div className='flex items-center space-x-2'>
            <div
              className='flex items-center cursor-pointer w-190'
              onClick={() => setIsMembersExpanded(!isMembersExpanded)}
            >
              <i
                className={`fa-solid mr-2 w-3 ${
                  isMembersExpanded ? 'fa-arrow-down' : 'fa-arrow-right'
                } ml-2`}
              ></i>
              <span>{`${conversation.participants?.length} members`}</span>
            </div>
          </div>
        )}
        <h1 className='text-xl font-semibold'>&nbsp;</h1>
        <nav className='space-x-4 relative flex z-10'>
          <div className='relative inline-block'>
            <button
              className='focus:outline-none'
              aria-expanded={isBellDropdownOpen}
              onClick={() => {
                setIsBellDropdownOpen(!isBellDropdownOpen);
                setIsAvatarDropdownOpen(false); // Close avatar dropdown
              }}
            >
              <i className='fa-regular fa-bell fa-xl mr-2 pt-4'></i>
              <span className='absolute top-[1px] right-[1px] w-4 h-4 rounded-full bg-blue unread-indicator'></span>
            </button>
          </div>

          {isBellDropdownOpen && (
            <NotificationsMenu
              userInfo={userInfo}
              notificationData={notificationData}
              setIsBellDropdownOpen={setIsBellDropdownOpen}
            />
          )}

          <button
            className='focus:outline-none'
            aria-expanded={isAvatarDropdownOpen}
            onClick={() => {
              setIsAvatarDropdownOpen(!isAvatarDropdownOpen);
              setIsBellDropdownOpen(false); // Close bell dropdown
            }}
          >
            <img
              src={userInfo.avatarSource || '/avatar.png'}
              className='rounded-full w-7 h-7 mr-2.5'
            />
          </button>

          {isAvatarDropdownOpen && (
            <div className='absolute right-0 mt-9 w-48 bg-dark border-gray-light rounded-md shadow-lg z-100 dropdown-container'>
              <ul className='py-1 text-base leading-6 text-offwhite'>
                <li
                  className='flex flex-col items-start px-4 py-2 hover-dark cursor-pointer text-sm -mx-0 -mt-1 -mb-1'
                  onClick={() => (
                    router.push('/account'), setIsAvatarDropdownOpen(false)
                  )}
                >
                  <div className='flex items-center w-full'>
                    <div className='w-11 h-11 rounded-full overflow-hidden'>
                      <img
                        src={userInfo.avatarSource || '/avatar.png'}
                        className='rounded-full'
                      />
                    </div>
                    <div className='ml-1'>
                      <span className='ml-3'>{userInfo?.username}</span>
                    </div>
                  </div>
                  <div className='flex items-center w-full mt-2'>
                    <i className='fa-regular fa-gear'></i>
                    <span className='ml-2'>Settings</span>
                  </div>
                </li>
                <hr className='border-t border-gray w-full my-2' />
                <li className='flex items-center px-4 py-2 hover-dark cursor-pointer text-sm -mx-0 -mt-1 -mb-1'>
                  <i className='fa-solid fa-wave-pulse'></i>
                  <span className='ml-2'>Example 1</span>
                </li>
                <li className='flex items-center px-4 py-2 hover-dark cursor-pointer text-sm -mx-0 -mt-1 -mb-1'>
                  <i className='fa-solid fa-puzzle-piece'></i>
                  <span className='ml-2'>Example 2</span>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </header>
      {/* Members dropdown content */}
      {(conversation?.participants?.length || 0) > 1 && isMembersExpanded && (
        <div className='absolute mt-14 pl-3' id='members'>
          <ul className='pl-0 w-[190px]'>
            {conversation.participants?.map(participant => (
              <li
                className='group cursor-pointer hover-dark rounded items-center space-x-2 p-2'
                key={`${conversation.id}/${participant.id}`}
              >
                {participant.avatarSource ? (
                  <img
                    src={participant.avatarSource}
                    className='rounded-full h-7 w-7 mr-1'
                  />
                ) : (
                  <div
                    className={`h-4 w-4 rounded-full ${
                      participant.id == conversation.creatorId
                        ? 'bg-yellow'
                        : 'bg-green-bright'
                    } mr-1`}
                  ></div>
                )}
                <span className='text-offwhite'>
                  {participant.username}{' '}
                  {participant.id == conversation.creatorId ? '(creator)' : ''}
                </span>
                {participant.id != userInfo.id && (
                  <div className='pl-4 pt-1 group-hover:block hidden flex items-center float-right background-orange-300'>
                    <i
                      className='fa-light fa-close float-right hover:font-bold'
                      onClick={async () => {
                        let updatedConversation =
                          await removeParticipantMutation.mutateAsync({
                            conversationId: conversation.id as number,
                            participantUsername: participant.username
                          });
                        updatedConversation = await addSystemMessage(
                          `${userInfo.username} removed ${participant.username} from the conversation.`
                        );
                        console.log(updatedConversation);
                      }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Topbar;
