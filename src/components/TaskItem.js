import React, { useState, useEffect } from 'react';
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
  setActiveTaskIndex,
  completed,
  toggleCompletion
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

  // Add isChecked state
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(completed);
  }, [completed]);

  // Update isChecked state when completed prop changes
  useEffect(() => {
    setIsChecked(completed);
  }, [completed]);

  return (
    <div
      className={`w-full box cursor-pointer ${completed ? 'bg-green-200' : ''}`}
      onClick={() => {
        setActiveTask(task, index);
      }}
    >
      <div
        className={`message p-2 relative hover-dark-gray ${
          task.id == userInfo.activeTaskId ? 'bg-dark-blue' : ''
        }`}
      >
        <div className='w-6 h-6 rounded-full absolute left-4 top-0 flex items-center justify-center p-1'>
          <button
            type='button'
            className={`w-full h-full rounded-full task_checkbox priority_1 border border-gray-300 mt-2 ${
              task.labels.includes('completed') ? 'bg-green' : ''
            }`}
            role='checkbox'
            aria-checked={task.labels.includes('completed')}
            aria-label=''
            onClick={e => {
              toggleCompletion(task, e);
            }}
          >
            <div className='w-full h-full rounded-full flex items-center justify-center'>
              <svg
                width='24'
                height='24'
                fill='currentColor'
                viewBox='0 0 24 24'
                className={`w-3 h-3 check ${
                  isChecked ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}
              >
                <path d='M11.23 13.7l-2.15-2a.55.55 0 0 0-.74-.01l.03-.03a.46.46 0 0 0 0 .68L11.24 15l5.4-5.01a.45.45 0 0 0 0-.68l.02.03a.55.55 0 0 0-.73 0l-4.7 4.35z'></path>
              </svg>
            </div>
          </button>
        </div>
        <div
          className={`flex items-center pl-16 ${
            isChecked ? 'line-through' : ''
          }`}
        >
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
