import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import copy from 'clipboard-copy';

function TaskItem({
  index,
  task,
  userInfo,
  setUserInfo,
  setActiveTask,
  setActiveTaskIndex
}) {
  if (task.id == userInfo.activeTaskId) {
    setActiveTaskIndex(index);
  }
  const currentTimestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const customRenderer = {
    p: ({ children }) => (
      <>
        {children.map(child => {
          if (typeof child === 'string') {
            const parts = child.split('\n');
            return parts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {part}
              </React.Fragment>
            ));
          }
          return child;
        })}
      </>
    )
  };

  return (
    <div
      className='w-full box cursor-pointer'
      onClick={() => {
        setActiveTask(task, index);
      }}
      // style={{ aspectRatio: '1 / 1' }}
    >
      <div
        className={`message p-2 relative hover-dark-gray ${
          task.id == userInfo.activeTaskId ? 'bg-dark-blue' : ''
        }`}
      >
        <img
          src={'avatar.png'}
          alt='Avatar'
          className='w-6 h-6 rounded-full absolute left-4 top-0'
        />
        <div className='flex items-center pl-16'>
          {
            /* <span className='text-sm mb-1 inline-block name'>{'Task'}</span>{' '} */
          }
          <br />
          <p className='text-xs inline-block absolute top-0 right-4 timestamp'>
            <span className='message-direction'>
              {''}
              <i
                className={`fa-regular fa-arrow-down-left fa-lg ml-1 mr-3 mt-2`}
              ></i>
            </span>{' '}
            {currentTimestamp}
            <i
              className={`fa-star ${
                false ? 'fa-solid' : 'fa-regular'
              } ml-2 cursor-pointer`}
              onClick={() => {}}
            ></i>
            {true ? (
              <i className='fa-solid  w-5 h-5 ml-2'></i>
            ) : (
              <i
                className={`fa-light fa-copy w-5 h-5 ml-2 cursor-pointer`}
                onClick={() => {
                  // copyToClipboard(task.content);
                }}
              ></i>
            )}
          </p>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            children={task.content}
            components={customRenderer}
          />
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
