// src/components/MentionPopover.jsx

import React, { useState } from 'react';
import { client } from '../trpc/client'

const MentionPopover = ({ onSelect }) => {
  // usernames
  const [users, setUsers] = useState([])
    client.users.query.query({
      id: true,
      username: true
    }).then((users) => {
      setUsers(users)
    })

  const handleSelect = (username) => {
    if (onSelect) {
      onSelect(username);
    }
  };

  return (
    <div>
      <div className="mention-popover p-4 rounded text-offwhite">
        <ul>
          {users.map((user) => (
            <li className="rounded" key={user.username} onClick={() => handleSelect(user.username)}>
              {user.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MentionPopover;
