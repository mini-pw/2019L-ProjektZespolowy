import React, {useState} from 'react';
import {Button, TextField} from '@material-ui/core';

const RegistrationForm = ({onRegistration}) => {
  const [username, setUsername] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const isValid = () => username && firstName && lastName && email && password;

  return <form noValidate autoComplete='off'>
    <div className="form-field">
      <TextField label='User name' margin="normal" autoFocus onChange={event => setUsername(event.target.value)}/>
    </div>
    <div className="form-field">
      <TextField label='First name' margin="normal" autoFocus onChange={event => setFirstName(event.target.value)}/>
    </div>
    <div className="form-field">
      <TextField label='Last name' margin="normal" autoFocus onChange={event => setLastName(event.target.value)}/>
    </div>
    <div className="form-field">
      <TextField label='Email' margin="normal" autoFocus onChange={event => setEmail(event.target.value)}/>
    </div>
    <div className="form-field">
      <TextField label='Password' type="password" margin="normal" onChange={event => setPassword(event.target.value)}/>
    </div>
    <div className="form-field btn">
      <Button color="primary" variant="contained" margin="normal" disabled={!isValid()} onClick={() => onRegistration({username, firstName, lastName, email, password})}>Register</Button>
    </div>
  </form>;
};

export default RegistrationForm;
