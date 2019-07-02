import React, {useState} from 'react';
import {Button, TextField} from '@material-ui/core';

const LoginForm = ({onLogin}) => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const isValid = () => username && password;

  return <form noValidate autoComplete='off'>
    <div className="form-field">
      <TextField label='User name' margin="normal" autoFocus onChange={event => setUsername(event.target.value)}/>
    </div>
    <div className="form-field">
      <TextField label='Password' type="password" margin="normal" onChange={event => setPassword(event.target.value)}/>
    </div>
    <div className="form-field btn">
      <Button color="primary" variant="contained" margin="normal" disabled={!isValid()} onClick={() => onLogin({username, password})}>Login</Button>
    </div>
  </form>;
};

export default LoginForm;
