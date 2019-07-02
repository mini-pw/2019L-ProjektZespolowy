import React, {useEffect, useState} from 'react';
import './Common.css';
import {Typography} from '@material-ui/core';

const Helper = ({text, visible = false}) => {
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    if (visible) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  }, [text, visible]);

  return showPopup && <div id='helper'>
    <Typography variant="h4" align="center" color="inherit" className="title" style={{fontWeight: 300}}>
      {text}
    </Typography>
  </div>;
};

export default Helper;
