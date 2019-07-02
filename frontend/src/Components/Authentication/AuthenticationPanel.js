import React, {useContext, useState} from 'react';
import {Button, ClickAwayListener} from '@material-ui/core';
import UserinfoBanner from './UserinfoBanner';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import {ServiceContext} from '../../Services/SeviceContext';
import './Authentication.css';
import UserDataForm from './UserDataForm';

const AuthenticationPanel = () => {
  const {authService} = useContext(ServiceContext);
  const [showPopup, setShowPopup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState(authService.username);

  const login = async ({username, password}) => {
    await authService.logIn(username, password);
    setShowPopup(false);
    setUsername(authService.username);
  };

  const registration = async ({username, firstName, lastName, email, password}) => {
    await authService.registration(username, firstName, lastName, email, password);
    setShowPopup(false);
    setUsername(authService.username);
  };

  const logout = () => {
    authService.logOut();
    setUsername();
    setShowPopup(false);
  };

  return <div>
    <div>
      {username
        ? <UserinfoBanner username={username} onClick={() => setShowPopup(!showPopup)}/>
        : <div>
            <Button onClick={() => {setShowPopup(!showPopup); setShowLogin(true)} }>Login</Button>
            <Button onClick={() => {setShowPopup(!showPopup); setShowLogin(false)} }>Registration</Button>
          </div>
        }
    </div>
    {showPopup && showLogin && <ClickAwayListener onClickAway={() => setShowPopup(false)}>
      <div className='login-popup'>
        {username
          ? <UserDataForm onLogout={logout}/>
          : <LoginForm onLogin={login}/>
        }
      </div>
    </ClickAwayListener>
    }
    {showPopup && !showLogin && <ClickAwayListener onClickAway={() => setShowPopup(false)}>
      <div className='login-popup'>
        {username
          ? <UserDataForm onLogout={logout}/>
          : <RegistrationForm onRegistration={registration}/>
        }
      </div>
    </ClickAwayListener>
    }
  </div>;
};

export default AuthenticationPanel;
