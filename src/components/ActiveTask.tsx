import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { trpc } from '../utils/trpc';
import { client } from '../trpc/client';

interface ActiveTaskProps {
  activeTask: any;
  userInfo: any;
  setUserInfo: (...args: any) => any;
}

const ActiveTask: React.FC<ActiveTaskProps> = ({
  activeTask,
  userInfo,
  setUserInfo
}) => {
  const [isMembersExpanded, setIsMembersExpanded] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [userInfo]);

  useEffect(() => {
    updateCountdown();
  }, [userInfo.activeTaskSetAt]);

  const updateCountdown = () => {
    const now = new Date();
    const startTime = new Date(userInfo.activeTaskSetAt);
    const diff = Math.max(0, startTime.getTime() + 900000 - now.getTime());
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    setCountdown(
      `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
    );
  };

  const resetAtiveTaskTimer = async (userInfo: any) => {
    const newStart = new Date();
    setUserInfo({
      ...userInfo,
      activeTaskSetAt: newStart
    });
    client.users.update.query({
      id: userInfo.id,
      activeTaskSetAt: newStart
    });
  };

  const clearActiveTask = async (userInfo: any) => {
    setUserInfo({
      ...userInfo,
      activeTaskId: null
    });
    client.users.update.query({
      id: userInfo.id,
      activeTaskId: null
    });
  };

  return (
    <>
      <header
        className='flex items-center justify-between px-4 py-2 relative cursor-pointer'
        id='top-nav'
        onClick={() => {
          window.open(activeTask.url, '_blank');
        }}
      >
        {/* Members dropdown title */}
        <div className='w-full items-center space-x-2'>
          <div>
            <div className='text-sm font-normal flex justify-between'>
              <span className=''>{activeTask.content}</span>
              <div className='gap-3 flex flex-row items-center'>
                <div className='text-white-500'>{countdown}</div>
                <i
                  className='fa-light fa-refresh hover:font-bold'
                  onClick={async e => {
                    e.stopPropagation();
                    resetAtiveTaskTimer(userInfo);
                  }}
                ></i>
                <i
                  className='fa-light fa-close hover:font-bold'
                  onClick={async e => {
                    e.stopPropagation();
                    clearActiveTask(userInfo);
                  }}
                ></i>
              </div>
            </div>
            <h2>
              <ReactMarkdown children={activeTask.description} />
            </h2>
          </div>
        </div>
        <h1 className='text-xl font-semibold'>&nbsp;</h1>
        <nav className='space-x-4'>
          <a href='#' className='hover:text-blue-300'></a>
        </nav>
      </header>
    </>
  );
};

export default ActiveTask;
