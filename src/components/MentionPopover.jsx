// src/components/MentionPopover.jsx

import React, { useState } from 'react';
import { client } from '../trpc/client';

const MentionPopover = ({ users, onSelect }) => {
  const handleSelect = username => {
    if (onSelect) {
      onSelect(username);
    }
  };

  return (
    <div>
      <div className='mention-popover p-4 rounded text-offwhite'>
        <ul>
          {users.map(user => (
            <li
              className='rounded'
              key={user.username}
              onClick={() => handleSelect(user.username)}
            >
              {user.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MentionPopover;
