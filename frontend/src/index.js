import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter as Router} from 'react-router-dom';
import Popup from 'react-popup';
import {ServiceContext, setup} from './Services/SeviceContext';
import {ToastContainer} from 'react-toastify';

require('react-popup/style.css');
require('react-toastify/dist/ReactToastify.css');

const services = setup();

ReactDOM.render(<Router>
    <ToastContainer/>
    <Popup/>
    <ServiceContext.Provider value={services}>
      <App/>
    </ServiceContext.Provider>
  </Router>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
