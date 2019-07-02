import React, {useContext, useEffect, useState} from 'react';
import Canvas from '../Canvas';
import {ServiceContext} from '../../Services/SeviceContext';
import ThreeDotsSpinner from '../Common/ThreeDotsSpinner';
import {Fab, Modal} from '@material-ui/core';
import {Check} from '@material-ui/icons';
import {windowsCloseEventHandler} from '../../utils';
import {Prompt as RouterPrompt} from 'react-router-dom';
import AnnotationInfoModal from '../AnnotationInfoModal';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

function PdfView(props) {
  const [pages, setPages] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [changesDetected, setChangesDetected] = useState(false);
  const [scale, setScale] = useState({x: 1, y: 1});
  const [showAnnotationInfoModal, setShowAnnotationInfoModal] = useState(null);
  const {publicationsService, annotationsService, annotationsControllerService} = useContext(ServiceContext);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedPages = await publicationsService.getPublicationPages(props.match.params.id);
      setPages(fetchedPages);
      const fetchedAnnotations = await annotationsService.getAnnotationsForPublication(props.match.params.id);
      const annotationsByPage = fetchedPages.map(({id}) => fetchedAnnotations[id] || []);
      annotationsControllerService.annotations = annotationsByPage;
      setAnnotations(annotationsByPage);
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
    setAnnotations(annotationsControllerService.annotations);
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
          pages.length > 0 && pages.map((page, ind) => <Canvas key={page.id} id={page.id} pageIndex={ind} image={page.imageUrl} annotations={annotations[ind] || []} onAnnotationsChange={onAnnotationsChange} scale={scale} onScaleChange={setScale} showAnnotationsInfoModal={(number) => setShowAnnotationInfoModal(annotations[ind][number])}/>)
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
