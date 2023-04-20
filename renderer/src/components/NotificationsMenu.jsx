import React, { useState } from 'react';
import client from '../trpc/client';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';

export default function NotificationsMenu({
  userInfo,
  notificationData,
  setIsBellDropdownOpen
}) {
  const router = useRouter();
  const [dismissedNotifications, setDismissedNotifications] = useState([]);

  const handleDismissNotification = (notificationId) => {
    setDismissedNotifications([...dismissedNotifications, notificationId]);
  };

  // Filter out dismissed notifications
  const filteredNotifications = notificationData?.data?.filter(
    (notification) => !dismissedNotifications.includes(notification.id)
  );

  // Sort the notifications in descending order based on the 'createdAt' field
  const sortedNotifications = filteredNotifications?.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Helper function to format timestamp
  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (diffInSeconds < 60) {
      return formatter.format(-diffInSeconds, 'second');
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return formatter.format(-diffInMinutes, 'minute');
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return formatter.format(-diffInHours, 'hour');
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return formatter.format(-diffInDays, 'day');
  };

  return (
    <div className='absolute right-0 mt-9 w-48 bg-dark border-gray-light rounded-md shadow-lg z-100 dropdown-container bell'>
      <ul className='py-1 text-base leading-6 text-offwhite'>
        {sortedNotifications?.map(notification => (
          <li
            key={notification.id}
            onClick={() => {
              router.push(
                '/conversations/[id]',
                `/conversations/${notification.conversation.id}`
              );
              setIsBellDropdownOpen(false);
            }}
            aria-label='Notification'
            className='flex justify-between items-center px-4 py-2 hover-dark cursor-pointer -mx-0 -mt-1 -mb-1'
          >
            <div className='flex items-center'>
              <div className='w-10 h-10 rounded-full overflow-hidden mr-3'>
                <img
                  src={notification.sender.avatarSource || '/avatar.png'}
                  className='rounded-full w-10 h-10'
                />
              </div>
              <div className='flex flex-col'>
                <p className='text-sm text-offwhite'>
                  <span>{notification.sender.username}</span> added{' '}
                  {notification.recipient.username} to a{' '}
                  <strong>conversation</strong>
                </p>
                <div className='text-xs text-gray-400 mt-0.5'>
                  <span>{notification.conversation.name}</span>
                </div>
                <p className='text-xs text-gray-500 mt-0.5'>
                  {formatDate(notification.createdAt)}
                </p>
              </div>
            </div>
            <div>
              <button
                type='button'
                aria-label='Mark as read'
                className='focus:outline-none'
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent element's onClick event
                  handleDismissNotification(notification.id);
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );  
}
