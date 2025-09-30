import React from 'react';

const FriendList = ({ friends, onRemoveFriend }) => {
  return (
    <div className="friend-list">
      <h3>Friends List</h3>
      <ul>
        {friends.map((friend) => (
          <li key={friend._id} className="friend-item">
            <span>{friend.name}</span>
            <span 
              className="remove-friend" 
              onClick={() => onRemoveFriend(friend._id)}
              style={{
                cursor: 'pointer',
                marginLeft: '10px',
                fontSize: '14px',
              }}
            >
              -
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;
