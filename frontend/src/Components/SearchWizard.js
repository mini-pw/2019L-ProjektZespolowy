import {
  Button,
  Checkbox,
  FormControlLabel,
  InputBase,
  MenuItem,
  Paper,
  Select,
  TextField,
  withStyles
} from '@material-ui/core';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import {Search} from '@material-ui/icons';
import DateFnsUtils from '@date-io/date-fns';
import React, {useState} from 'react';
import {publicationStatuses} from '../common';

const styles = theme => ({
  paper: {
    margin: '10px 10% 0 10%',
    '& span': {
      fontSize: '1rem'
    }
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr 1fr 1fr',
    padding: theme.spacing(2)
  },
  search: {
    gridArea: '1/1/2/5',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'gainsboro',
    width: '100%'
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    width: '100%',
    height: '100%',
    color: 'inherit'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100% !important',
    [theme.breakpoints.up('md')]: {
      width: 200
    }
  },
  annotatedByMe: {
    gridArea: '2/1/3/2',
    justifyContent: 'flex-end !important'
  },
  flexLine: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  annotatorsCount: {
    gridArea: '2/2/3/5'
  },
  annotationDateFrom: {
    gridArea: '3/1/4/3'
  },
  annotationDateTo: {
    gridArea: '3/3/4/5'
  },
  tags: {
    gridArea: '4/1/5/3'
  },
  tagSelect: {
    width: '50%'
  },
  buttons: {
    gridArea: '4/3/5/5',
    justifyContent: 'flex-end !important'
  },
  button: {
    marginRight: '40px'
  }
});

const SearchWizard = ({classes, onClose, onSearch, searchParams}) => {
  const [params, setParams] = useState(searchParams || {
    name: '',
    maxAnnotators: 999,
    minAnnotators: 0,
    annotatedByMe: false,
    publicationPeriod: {
      from: new Date(1),
      to: new Date()
    },
    status: 'ALL'
  });

  const handleChange = (paramName) => ({target: {value}}) => setParams({...params, [paramName]: value});
  const handleChecked = (paramName) => ({target: {checked}}) => setParams({...params, [paramName]: checked});
  const setPubPeriodFrom = (value) => setParams(
    {...params, publicationPeriod: {...params.publicationPeriod, from: value}});
  const setPubPeriodTo = (value) => setParams({...params, publicationPeriod: {...params.publicationPeriod, to: value}});
  const formatParams = () => ({
    ...params,
    publicationPeriod: {
      // from: params.publicationPeriod.from.toISOString(),
      // to: params.publicationPeriod.to.toISOString()
    }
  });

  return (
    <Paper className={classes.paper} elevation={5}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div className={classes.layout}>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <Search/>
            </div>
            <InputBase
              placeholder="Nazwa…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput
              }}
              value={params.name}
              onChange={handleChange('name')}
              inputProps={{'aria-label': 'Search'}}
            />
          </div>
          <div className={`${classes.annotatedByMe} ${classes.flexLine}`}>
            <FormControlLabel
              control={<Checkbox checked={params.annotatedByMe} onChange={handleChecked('annotatedByMe')}/>}
              label="Adnotowane przeze mnie"/>
          </div>
          <div className={`${classes.annotatorsCount} ${classes.flexLine}`}>
            <span>Ilość anotatorów:</span>
            <TextField
              id="standard-number"
              label="Od"
              value={params.minAnnotators}
              onChange={handleChange('minAnnotators')}
              type="number"
              InputLabelProps={{
                shrink: true
              }}
              margin="normal"
            />
            <span>-</span>
            <TextField
              id="standard-number"
              label="Do"
              type="number"
              value={params.maxAnnotators}
              onChange={handleChange('maxAnnotators')}
              InputLabelProps={{
                shrink: true
              }}
              margin="normal"
            />
          </div>
          <div className={`${classes.annotationDateFrom} ${classes.flexLine}`}>
            <span>Data publikacji od:</span>
            <KeyboardDatePicker
              format="dd/MM/yyyy"
              margin="normal"
              id="mui-pickers-date"
              label="Data"
              value={params.publicationPeriod.from}
              onChange={setPubPeriodFrom}
              KeyboardButtonProps={{
                'aria-label': 'change date'
              }}
            />
          </div>
          <div className={`${classes.annotationDateTo} ${classes.flexLine}`}>
            <span>Data publikacji do:</span>
            <KeyboardDatePicker
              format="dd/MM/yyyy"
              margin="normal"
              id="mui-pickers-date"
              label="Data"
              value={params.publicationPeriod.to}
              onChange={setPubPeriodTo}
              KeyboardButtonProps={{
                'aria-label': 'change date'
              }}
            />
          </div>
          <div className={`${classes.tags} ${classes.flexLine}`}>
            <span>Status: </span>
            <Select
              className={classes.tagSelect}
              value={params.status}
              onChange={handleChange('status')}
            >
              {publicationStatuses.map(({value, name}) => <MenuItem key={value} value={value}>{name}</MenuItem>)}
            </Select>
          </div>
          <div className={`${classes.buttons} ${classes.flexLine}`}>
            <Button onClick={onClose} className={classes.button} variant="contained" color="secondary">Wróć</Button>
            <Button onClick={() => onSearch(formatParams())} className={classes.button} variant="contained"
                    color="primary">Szukaj</Button>
          </div>
        </div>
      </MuiPickersUtilsProvider>
    </Paper>
  );
};

export default withStyles(styles)(SearchWizard);
