import React from 'react';

const UserinfoBanner = (props) => {
  const {username, onClick} = props;
  return <div onClick={onClick}>
    <p>{username}</p>
  </div>
};

export default UserinfoBanner
