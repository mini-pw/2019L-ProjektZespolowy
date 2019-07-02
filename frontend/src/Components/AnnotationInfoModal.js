import React from 'react';
import {Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
    outline: 'none',
  },
});

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const AnnotationInfoModal = ({annotation, classes}) => <div style={getModalStyle()} className={classes.paper}>
  <Typography variant="h3">
    {annotation.id ? `Annotation #${annotation.id}` : 'New annotation'}
  </Typography>
  {annotation.creator && <Typography variant='h6'>
    Stworzony przez: {annotation.creator.displayName} {new Date(annotation.creationDate).toLocaleString()}
  </Typography>}
  {annotation.data.type && <Typography variant="h6">
    Typy: {annotation.data.type.join(', ')}
  </Typography>}
  {annotation.tags && annotation.tags.length > 0 && <Typography variant="h6">
    Tagi: {annotation.tags.map(t => t.name).join(', ')}
  </Typography>}
  {annotation.data.references && annotation.data.references.length > 0 && <Typography variant="h6">
    Referencje: {annotation.data.references.join(', ')}
  </Typography>}
  {annotation.status && <Typography variant='p'>
    Status: {annotation.status}
  </Typography>}
</div>;

export default withStyles(styles)(AnnotationInfoModal);
