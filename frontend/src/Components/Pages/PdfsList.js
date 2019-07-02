import React, {Component, useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {withStyles} from '@material-ui/core/styles';
import {Link} from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import {ServiceContext} from '../../Services/SeviceContext';
import ThreeDotsSpinner from '../Common/ThreeDotsSpinner';

const styles = theme => ({
  root: {
    padding: '2%'
  },
  paper: {
    cursor: 'pointer',
    height: '100%',
    width: '100%',
    '&:hover': {
      height: '101%',
      width: '101%',
      margin: '-1%'
    }
  },
  image: {
    height: '390px',
    width: '100%',
    borderRadius: 5
  },
  control: {
    padding: theme.spacing(2)
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  title: {
    padding: theme.spacing(1),
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  link: {
    textDecoration: 'none',
    color: '#000'
  }
});

class PdfPreview extends Component {
  state = {
    elevation: 2
  };

  onMouseOver = () => this.setState({elevation: 8});
  onMouseOut = () => this.setState({elevation: 2});

  render() {
    const {classes, src, key, publicationId, name} = this.props;
    return <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
    <div style={{padding: '12px'}}>
      <Link to={`/paper/${publicationId}`} className={classes.link} title={name}>
        <Paper className={classes.paper} elevation={this.state.elevation}
               onMouseOver={this.onMouseOver}
               onMouseOut={this.onMouseOut}>
          <img src={src} className={classes.image} alt="Pdf preview"/>
          <div className={classes.title}>
            {name}
          </div>
        </Paper>
      </Link>
     </div>
    </Grid>;
  }
}

PdfPreview.propTypes = {
  classes: PropTypes.any,
  src: PropTypes.any
};

function PdfsList({classes, searchParams}) {
  const [publications, setPublications] = useState([]);
  const [pagesLoaded, setPagesLoaded] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const {publicationsService} = useContext(ServiceContext);

  useEffect(() => {
    const fetchData = async () => {
      const morePublications = await publicationsService.getPublicationPreviews(pagesLoaded, searchParams);
      if (morePublications.length > 0) {
        setPublications([...publications, ...morePublications]);
        setHasMore(true);
      }
    };
    fetchData();
  }, [pagesLoaded, searchParams]);

  return (
    <InfiniteScroll
      loadMore={() => {
        setHasMore(false);
        setPagesLoaded(pagesLoaded + 1);
      }}
      hasMore={hasMore}
    >
      <Grid container className={classes.root} spacing={24}>
        {publications.map(({src, id, name}) => <PdfPreview key={src} publicationId={id} name={name} classes={classes} src={src}/>)}
      </Grid>
      <div className={classes.loading}>
        <ThreeDotsSpinner/>
      </div>
    </InfiniteScroll>
  );
}

export default withStyles(styles)(PdfsList);
