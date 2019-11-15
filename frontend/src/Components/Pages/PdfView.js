import React, {useContext, useEffect, useState} from 'react';
import Canvas from '../Canvas';
import {ServiceContext} from '../../Services/SeviceContext';
import ThreeDotsSpinner from '../Common/ThreeDotsSpinner';
import {Fab, Modal} from '@material-ui/core';
import {Check} from '@material-ui/icons';
import {windowsCloseEventHandler} from '../../utils';
import {Prompt as RouterPrompt} from 'react-router-dom';
import AnnotationInfoModal from '../AnnotationInfoModal';
import ReactPaginate from 'react-paginate';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

function PdfView(props) {
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [changesDetected, setChangesDetected] = useState(false);
  const [scale, setScale] = useState({x: 1, y: 1});
  const [showAnnotationInfoModal, setShowAnnotationInfoModal] = useState(null);
  const {publicationsService, annotationsService, annotationsControllerService} = useContext(ServiceContext);
  const perPage = 2;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedPages = await publicationsService.getPublicationPages(props.match.params.id);
      setPages(fetchedPages);
      const fetchedAnnotations = await annotationsService.getAnnotationsForPublication(props.match.params.id);
      const annotationsByPage = fetchedPages.map(({id}) => fetchedAnnotations[id] || []);
      annotationsControllerService.annotations = annotationsByPage;
      setAnnotations(annotationsByPage);
      var pages = [];
      for(var i=0; i<perPage; i++){
        pages.push(fetchedPages[i]);
      }
      setSelectedPages(pages);
    };
    setChangesDetected(false);
    fetchData();
  }, [props.match.params.id]);

  const keyDownListener = ({key, metaKey, ctrlKey}) => {
    if (key === 'z' && ((isMac && metaKey) || (!isMac && ctrlKey))) {
      annotationsControllerService.undo();
      setAnnotations(annotationsControllerService.annotations);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', keyDownListener);
    return () => {
      window.removeEventListener('keydown', keyDownListener);
    };
  }, []);

  const onAnnotationsChange = () => {
    if (!changesDetected) {
      window.addEventListener('beforeunload', windowsCloseEventHandler);
    }
    setAnnotations([...annotationsControllerService.annotations]);
    setChangesDetected(true);
  };

  props.history.listen(() => {
    window.removeEventListener('beforeunload', windowsCloseEventHandler);
  });

  const saveAnnotations = async () => {
    for (let i = 0; i < pages.length; i++) {
      await annotationsService.saveChanges(annotationsControllerService.annotations[i], pages[i].id, i);
    }
    setChangesDetected(false);
    window.removeEventListener('beforeunload', windowsCloseEventHandler);
    setAnnotations(annotationsControllerService.annotations);
  };

  const handlePageClick = (data) => {
    var array = [];
    for(var i=0; i<perPage; i++){
      var index = Math.ceil(data.selected * perPage) + i;
      if(index < pages.length)
        array.push(pages[index]);
    }
    setCurrentPage(data.selected);
    setSelectedPages(array);
  };

  return (
      <div>
        <Modal
          open={showAnnotationInfoModal !== null}
          onClose={() => setShowAnnotationInfoModal(null)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <AnnotationInfoModal annotation={showAnnotationInfoModal}/>
        </Modal>
        <RouterPrompt
          when={changesDetected}
          message='You have unsaved changes, are you sure you want to leave?'
        />
        {
          pages.length > 0 && selectedPages.map((page, ind) => {
                ind = Math.ceil(currentPage * perPage) + ind;
                return <Canvas key={page.id} id={page.id} pageIndex={ind} image={page.imageUrl} annotations={annotations[ind] || []} onAnnotationsChange={onAnnotationsChange} scale={scale} onScaleChange={setScale} showAnnotationsInfoModal={(number) => setShowAnnotationInfoModal(annotations[ind][number])}/>;
              })
        }
        {
          pages.length > 0 && <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            breakLabel={'...'}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            pageCount={Math.ceil(pages.length/perPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName={'pagination justify-content-center'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
          />
        }
        {pages.length === 0 && <ThreeDotsSpinner/>}
        {changesDetected && <Fab className='fab' color='primary' onClick={saveAnnotations}>
          <Check/>
        </Fab>}
      </div>

  );
}

PdfView.propTypes = {};
PdfView.defaultProps = {};

export default PdfView;
