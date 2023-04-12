import React from 'react';

const MentionPopover = ({ users, selectedUserIndex, onSelect }) => {
  const handleSelect = (username) => {
    if (onSelect) {
      onSelect(username);
    }
  };

  return (
    <div className='mention-popover p-4 rounded text-offwhite'>
      <ul>
        {users.map((user, index) => (
          <li
            className={`rounded flex items-center cursor-pointer hover-blue p-1 ${
              index === selectedUserIndex ? 'bg-blue' : '' // Highlight the selected user
            }`}
            key={user.username}
            onClick={() => handleSelect(user.username)}
          >
            {/* User avatar (use avatarSource from the user object) */}
            <img
              src={user.avatarSource || '/avatar.png'}
              className='rounded-full w-7 h-7 mr-2.5'
            />
            {/* User username */}
            {user.username}
            {/* Small circle */}
            <span className='relative w-4 h-4 mr-2.5 ml-2'>
              <span className='absolute top-[1px] right-[1px] w-4 h-4 rounded-full unread-indicator bg-green'></span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MentionPopover;
