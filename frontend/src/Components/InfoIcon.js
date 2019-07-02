import React, {Component} from 'react';
import ReactTooltip from "react-tooltip";
import {withStyles} from '@material-ui/core';
import {Info} from '@material-ui/icons';

const styles = (theme) => ({
  icon: {
    marginBottom: '-5px',
    marginLeft: '5px'
  }
});

class InfoIcon extends Component {
  render() {
    return (
      <div style={{display: 'inline-block'}}>
        <Info fontSize='small'
              className={this.props.classes.icon}
              data-tip
              data-for={this.props.id}/>
        <ReactTooltip className='available-tooltip' id={this.props.id} place='bottom' effect='solid'>
          <div className='tooltip-title'>{this.props.title}</div>
          <ul>
            {this.props.items.map(item => <li key={item}>{item}</li>)}
          </ul>
        </ReactTooltip>
      </div>
    );
  }
}

export default withStyles(styles)(InfoIcon);
