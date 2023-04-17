import React, { useState } from 'react';
import { Conversation } from '../interfaces';
import { trpc } from '../utils/trpc';
import NotificationsMenu from './NotificationsMenu';
import { useRouter } from 'next/router';
import { TodoistApi } from '@doist/todoist-api-typescript';

interface TopbarProps {
  conversation: Conversation;
  userInfo: any;
  setUserInfo: (...args: any) => any;
  addSystemMessage: (...args: any) => Promise<any>;
  settings: any;
  setSettings: (...args: any) => any;
  activeProject: any;
  setActiveProject(...args: any): any;
  projects: any;
  setProjects: any;
}

const Topbar: React.FC<TopbarProps> = ({
  conversation,
  userInfo,
  setUserInfo,
  addSystemMessage,
  settings,
  setSettings,
  activeProject,
  setActiveProject,
  projects,
  setProjects
}) => {
  const [isMembersExpanded, setIsMembersExpanded] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const removeParticipantMutation =
    trpc.conversations.removeParticipant.useMutation();

  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);

  const notificationData = trpc.notifications.get.useQuery({});
  const createOrFetchProjectMutation = trpc.projects.create.useMutation();
  const updateProjectMutation = trpc.projects.update.useMutation();
  const router = useRouter();

  const api = new TodoistApi(userInfo.todoistApiKey);

  const createOrFetchDateProject = async (_e: any, dayOffset = 0) => {
    let date =
      dayOffset == 0 ? new Date() : new Date(Date.parse(activeProject.name));
    const name = new Date(
      date.setDate(date.getDate() + dayOffset)
    ).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const projectAttributes = {
      name: name
    };

    const existingProject = projects.find(
      (p: any) => p.name == projectAttributes.name
    );

    if (!existingProject) {
      api.addProject(projectAttributes).then(async (todoistProject: any) => {
        const fetchedProject = await createOrFetchProjectMutation.mutateAsync({
          id: todoistProject.id,
          ...projectAttributes
        });
        setActiveProject(fetchedProject);
        setProjects([...projects, fetchedProject]);
        console.log(fetchedProject);
      });
    } else {
      setActiveProject(existingProject);
    }
  };

  return (
    <>
      <header
        className='flex items-center justify-between px-4 py-2 relative'
        id='top-nav'
      >
        {router.asPath == '/tasks' ? (
          <>
            <div className='gap-3 flex flex-row items-center'>
              <i
                className='fa-light fa-minus hover:font-bold mr-2 cursor-pointer transform transition duration-300 hover:scale-125 hover:font-bold'
                onClick={async e => {
                  e.stopPropagation();
                  setSettings({
                    ...settings,
                    tasksPerRow: Math.max(settings.tasksPerRow - 1, 2)
                  });
                }}
              ></i>
              <i
                className='fa-light fa-plus hover:font-bold cursor-pointer transform transition duration-300 hover:scale-125 hover:font-bold'
                onClick={async e => {
                  e.stopPropagation();
                  setSettings({
                    ...settings,
                    tasksPerRow: Math.min(settings.tasksPerRow + 1, 8)
                  });
                }}
              ></i>
              <div
                className='hover:font-bold cursor-pointer transform transition duration-300 hover:scale-125'
                onClick={createOrFetchDateProject}
              >
                今 日
              </div>
              <div className='gap-5'></div>
              <i className='fa-solid fa-pipe scale-150'></i>
              <div className='gap-5'></div>
              <i
                className='fa-light fa-grid hover:font-bold mr-2 cursor-pointer transform transition duration-300 hover:scale-125 hover:font-bold'
                onClick={async e => {
                  e.stopPropagation();
                  setSettings({
                    ...settings,
                    taskLayout: 'grid'
                  });
                }}
              ></i>
              <i
                className='fa-light fa-list-ul hover:font-bold mr-2 cursor-pointer transform transition duration-300 hover:scale-125 hover:font-bold'
                onClick={async e => {
                  e.stopPropagation();
                  setSettings({
                    ...settings,
                    taskLayout: 'list'
                  });
                }}
              ></i>
              <i
                className={`fa-regular fa-arrow-down fa-sm ml-1 mr-3 mt-2 cursor-pointer text-gray ml-auto transform transition duration-300 hover:scale-125 hover:font-bold ${
                  userInfo.hideProjectHeader ? '' : 'hidden'
                }`}
                onClick={() => {
                  setUserInfo({
                    ...userInfo,
                    hideProjectHeader: !userInfo.hideProjectHeader
                  });
                }}
              ></i>
            </div>
            <div className='gap-3 flex flex-row items-center'>
              <i
                className='fa-light fa-chevron-left hover:font-bold cursor-pointer transform transition duration-300 hover:scale-125 hover:font-bold'
                onClick={async e => {
                  e.stopPropagation();
                  createOrFetchDateProject(e, -1);
                }}
              ></i>
              <div className='uppercase tracking-wide'>
                {activeProject?.name}
              </div>
              <i
                className='fa-light fa-chevron-right hover:font-bold cursor-pointer transform transition duration-300 hover:scale-125 hover:font-bold'
                onClick={async e => {
                  e.stopPropagation();
                  createOrFetchDateProject(e, 1);
                }}
              ></i>
            </div>
          </>
        ) : (
          <h1 className='text-xl font-semibold'>&nbsp;</h1>
        )}

        {/* Members dropdown title */}
        {(conversation?.participants?.length || 0) > 1 && (
          <div className='flex items-center space-x-2 hidden-sm'>
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
                className='group cursor-pointer hover-dark rounded items-center space-x-2 p-2 flex'
                key={`${conversation.id}/${participant.id}`}
              >
                {participant.avatarSource ? (
                  <img
                    src={participant.avatarSource}
                    className='rounded-full h-7 w-7 mr-1'
                  />
                ) : (
                  <div
                    className={`h-7 w-7 rounded-full ${
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
