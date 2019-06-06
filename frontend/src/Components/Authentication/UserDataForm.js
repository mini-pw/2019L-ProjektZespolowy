import React from 'react';
import {Button} from '@material-ui/core';

const UserDataForm = ({onLogout}) => {
  return <div>
    <div className="form-field btn">
      <Button color="secondary" variant="contained" margin="normal" onClick={onLogout}>Log out</Button>
    </div>
  </div>;
};

export default UserDataForm;
