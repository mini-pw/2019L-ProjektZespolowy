import useImage from 'use-image';
import {Stage} from 'react-konva';
import {Item, Menu, MenuProvider} from 'react-contexify';
import React, {useContext, useState} from 'react';
import 'react-contexify/dist/ReactContexify.min.css';
import DrawingCanvas from './DrawingCanvas';
import * as PropTypes from 'prop-types';
import ThreeDotsSpinner from './Common/ThreeDotsSpinner';
import {ServiceContext} from '../Services/SeviceContext';
// import Helper from './Common/Helper';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const MyMenu = ({onNewAdnotationClick, onConnectAnnotationClick, onCopyAnnotationClick, onEditAnnotationClick, onDeleteAnnotationClick, selectedAnnotationsCount, id}) =>
  <Menu id={id}>
    <Item onClick={onNewAdnotationClick}>Dodaj adnotację</Item>
    {(selectedAnnotationsCount > 0) && <Item onClick={onCopyAnnotationClick}>Kopiuj adnotację</Item>}
    {(selectedAnnotationsCount === 1) && <Item onClick={onEditAnnotationClick}>Edytuj adnotację</Item>}
    {(selectedAnnotationsCount > 0) && <Item onClick={onDeleteAnnotationClick}>Usuń adnotację</Item>}
    {(selectedAnnotationsCount > 1) && <Item onClick={onConnectAnnotationClick}>Połącz adnotacje</Item>}
  </Menu>;

function MyCanvas({image, scale, offset, onBoundsChange, onScaleChange, changeAnnotationIndex, annotations, onAnnotationMove, onAnnotationTransform, selectedAnnotationsIndex, showModal}) {
  // const [showZoomHelper, setShowZoomHelper] = useState(false);
  // const {helperService} = useContext(ServiceContext);

  const dragBound = ({x}) => {
    if (scale.x <= 1) {
      return {x: offset.x, y: 0};
    }
    const newBounds = {
      x: Math.min(0, Math.max(x, (-image.width) * scale.x + window.innerWidth)),
      y: 0
    };
    onBoundsChange(newBounds);
    return newBounds;
  };

  const isInZoomMode = (evt) => {
     return (isMac && evt.metaKey) || (!isMac && evt.altKey);
  };

  const onZoom = ({evt}) => {
    if (!isInZoomMode(evt)) {
      // if (helperService.showZoomHelper()) {
      //   setShowZoomHelper(true);
      // }
      return;
    }
    evt.preventDefault();
    const oldScale = scale.x;

    const newScale = Math.max(0.2, evt.deltaY < 0 ? oldScale * 1.15 : oldScale / 1.15);
    onScaleChange({x: newScale, y: newScale});
  };

  const getHelperText = () => {
    if (isMac) {
      return 'Trzymaj ⌘ i skroluj by zmienić zoom';
    }
    return 'Trzymaj alt i skroluj by zmienić zoom';
  };

  return <div>
    {/*<Helper visible={showZoomHelper} text={getHelperText()}/>*/}
    <Stage width={image.width} height={image.height * scale.x} onWheel={onZoom}
           scale={scale} x={offset.x} draggable dragBoundFunc={dragBound} perfectDrawEnabled={false}
    >
      <DrawingCanvas
        changeAnnotationIndex={changeAnnotationIndex}
        annotations={annotations}
        onAnnotationMove={onAnnotationMove}
        showModal={showModal}
        image={image}
        onAnnotationTransform={onAnnotationTransform}
        selectedAnnotations={selectedAnnotationsIndex}
      />
    </Stage>
  </div>;
}

MyCanvas.propTypes = {
  image: PropTypes.any,
  props: PropTypes.any
};

const WithMenu = ({annotations, image, scale, id, pageIndex, onScaleChange, onAnnotationsChange, showAnnotationsInfoModal}) => {
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [selectedAnnotationsIndex, setSelectedAnnotationsIndex] = useState(null);
  const {annotationsControllerService} = useContext(ServiceContext);
  const [downloadedImage] = useImage(image);
  if (!downloadedImage) {
    return <ThreeDotsSpinner/>;
  }

  const onAddAnnotation = ({event}) => {
    const centeredOffset = scale.x < 1 ? centerBounds(offset) : offset;
    annotationsControllerService.addAnnotationToPage(pageIndex, {
      data: {
        x1: ((event.layerX - centeredOffset.x) / scale.x ) / downloadedImage.width,
        x2: ((event.layerX - centeredOffset.x) / scale.x + 100) / downloadedImage.width,
        y1: ((event.layerY - centeredOffset.y) / scale.y) / downloadedImage.height,
        y2: ((event.layerY - centeredOffset.y) / scale.y + 100) / downloadedImage.height,
        type: null,
        text: '',
        subRegions: []
      }
    }).then(onAnnotationsChange);
  };

  const onEditAnnotationClick = () => {
    annotationsControllerService.editSelectedAnnotation().then(onAnnotationsChange);
  };

  const onDeleteAnnotationClick = () => {
    annotationsControllerService.deleteSelectedAnnotations();
    onAnnotationsChange();
    setSelectedAnnotationsIndex(null);
  };

  const onConnectAnnotationClick = () => {
    annotationsControllerService.connectSelectedAnnotations();
    onAnnotationsChange();
    setSelectedAnnotationsIndex(null);
  };

  const onCopyAnnotationClick = () => {
    const copyOffset = 0.025;
    annotationsControllerService.copySelectedAnnotations(copyOffset);
    onAnnotationsChange();
    setSelectedAnnotationsIndex(null);
  };

  const transformAnnotation = (target, index) => {
    const {x, y, width, height, scaleX, scaleY} = target.attrs;
    let offetX = width * scaleX, offsetY = height * scaleY;
    annotationsControllerService.transformAnnotation(pageIndex, index, {
      x1: (Math.min(x, x + offetX)) / downloadedImage.width,
      x2: (Math.max(x, x + offetX)) / downloadedImage.width,
      y1: (Math.min(y, y + offsetY)) / downloadedImage.height,
      y2: (Math.max(y, y + offsetY)) / downloadedImage.height
    });
    onAnnotationsChange();
  };

  const centerBounds = (bounds) => {
    const imageWidth = downloadedImage.width * scale.x;
    const screenWidth = window.innerWidth;
    return {
      ...bounds,
      x: (screenWidth - imageWidth) / 2
    };
  };

  const changeAnnotationIndex = (ind, {evt}) => {
    if ((isMac && evt.metaKey) || (!isMac && evt.ctrlKey)) {
      annotationsControllerService.toggleAnnotationSelection(pageIndex, ind);
    } else {
      annotationsControllerService.selectAnnotation(pageIndex, ind);
    }
    setSelectedAnnotationsIndex(annotationsControllerService.selectedAnnotations);
  };

  downloadedImage.height *= window.innerWidth / downloadedImage.width;
  downloadedImage.width = window.innerWidth;

  const scaleUpAnnotations = () => annotations.map(({data: {x1, x2, y1, y2, type}}) => ({
    x1: x1 * downloadedImage.width,
    x2: x2 * downloadedImage.width,
    y1: y1 * downloadedImage.height,
    y2: y2 * downloadedImage.height,
    type
  }));

  return <div>
    <MenuProvider id={`canvas_menu${id}`}>
      <MyCanvas image={downloadedImage} annotations={scaleUpAnnotations()}
                scale={scale} offset={centerBounds(offset)}
                onAnnotationMove={({currentTarget}, index) => transformAnnotation(currentTarget, index)}
                onAnnotationTransform={({currentTarget}, index) => transformAnnotation(currentTarget, index)}
                onBoundsChange={setOffset}
                onScaleChange={onScaleChange}
                changeAnnotationIndex={changeAnnotationIndex}
                selectedAnnotationsIndex={selectedAnnotationsIndex}
                showModal={showAnnotationsInfoModal}
      />
    </MenuProvider>
    <MyMenu id={`canvas_menu${id}`}
            selectedAnnotationsCount={selectedAnnotationsIndex ? selectedAnnotationsIndex.length : 0}
            onNewAdnotationClick={onAddAnnotation}
            onCopyAnnotationClick={onCopyAnnotationClick}
            onEditAnnotationClick={onEditAnnotationClick}
            onDeleteAnnotationClick={onDeleteAnnotationClick}
            onConnectAnnotationClick={onConnectAnnotationClick}
    />
  </div>;
};

export default WithMenu;
