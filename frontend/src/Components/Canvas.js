import useImage from 'use-image';
import {Stage} from 'react-konva';
import {Item, Menu, MenuProvider, Submenu} from 'react-contexify';
import React, {useContext, useState, useEffect, useRef} from 'react';
import 'react-contexify/dist/ReactContexify.min.css';
import DrawingCanvas from './DrawingCanvas';
import * as PropTypes from 'prop-types';
import ThreeDotsSpinner from './Common/ThreeDotsSpinner';
import {ServiceContext} from '../Services/SeviceContext';
import _debounce from 'lodash.debounce'
import './Canvas.css';

// import Helper from './Common/Helper';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const MyMenu = ({annotations, onNewAdnotationClick, onConnectAnnotationClick, onCopyAnnotationClick, onEditAnnotationClick, onDeleteAnnotationClick, selectedAnnotationsIndex, annotationsControllerService, onAnnotationsChange, onAddTextSubregionClick, image, id}) =>
  {
    var selectedAnnotationsCount = selectedAnnotationsIndex ? selectedAnnotationsIndex.length : 0;
    var subRegionIndex = null;
    var isChart = false;
    var isTable = false;
    var currentAnnotation = null;
    if(selectedAnnotationsCount == 1){
      currentAnnotation = annotations[selectedAnnotationsIndex[0].annotationIndex];
      subRegionIndex = selectedAnnotationsIndex[0].subRegionIndex;
      var selectedAnnotationsType = currentAnnotation.data.type[0];
      isChart = selectedAnnotationsType.toLowerCase().includes('plot') || selectedAnnotationsType.toLowerCase().includes('chart');
      isTable = !isChart && selectedAnnotationsType.toLowerCase().includes('table');
    }
    const getRegionSize = (type, annotationSize, image) => {
      var size = {
        x1: (annotationSize.x1 + annotationSize.x2)/2, 
        y1: (annotationSize.y1 + annotationSize.y2)/2, 
        x2: (annotationSize.x1 + annotationSize.x2)/2 + 50 / image.width, 
        y2: (annotationSize.y1 + annotationSize.y2)/2 + 25 / image.height
      };
      if(type === 'row' || type === 'x_axis') {
        size.x2 = size.x1 + (annotationSize.x2 - annotationSize.x1) - 15 / image.width;
      }
      else if (type === 'column' || type === 'y_axis') {
        size.x2 = size.x1 + 25 / image.width;
        size.y2 = size.y1 + (annotationSize.y2 - annotationSize.y1) - 15 / image.height;
      }
      return size;
    };
    const onAddSubregionClick = (type) => {
      if(!currentAnnotation.data.subRegions)
        currentAnnotation.data.subRegions = [];
      var size = getRegionSize(type, currentAnnotation.data, image);
      var newSubAnnotation = {
          x1: size.x1,
          x2: size.x2,
          y1: size.y1,
          y2: size.y2,
          type: [type],
          text: '',
          subRegions: []
      };
      currentAnnotation.data.subRegions.push(newSubAnnotation);
      onAnnotationsChange();
    };
    return (
    <Menu id={id}>
      <Item onClick={onNewAdnotationClick}>Dodaj adnotację</Item>
      {(selectedAnnotationsCount > 0) && <Item onClick={onCopyAnnotationClick}>Kopiuj adnotację</Item>}
      {(selectedAnnotationsCount === 1 && subRegionIndex == null) && <Item onClick={onEditAnnotationClick}>Edytuj adnotację</Item>}
      {(selectedAnnotationsCount > 0) && <Item onClick={onDeleteAnnotationClick}>Usuń adnotację</Item>}
      {(selectedAnnotationsCount > 1) && <Item onClick={onConnectAnnotationClick}>Połącz adnotacje</Item>}
      {(selectedAnnotationsCount === 1 && (isChart || isTable) && subRegionIndex == null) && <Submenu label='Dodaj podobiekty'>
                                            <Item onClick={() => onAddTextSubregionClick('title', currentAnnotation)}>Tytuł</Item>
                                            {(isChart === true) &&  
                                            <>
                                              <Item onClick={() => onAddSubregionClick('x_axis')}>Oś x</Item>
                                              <Item onClick={() => onAddTextSubregionClick('x_axis_title', currentAnnotation)}>Tytuł osi x</Item>
                                              <Item onClick={() => onAddSubregionClick('y_axis')}>Oś y</Item>
                                              <Item onClick={() => onAddTextSubregionClick('y_axis_title', currentAnnotation)}>Tytuł osi y</Item>
                                            </>}
                                            {(isTable === true) &&  
                                            <>
                                              <Item onClick={() => onAddTextSubregionClick('cell', currentAnnotation)}>Komórka</Item>
                                              <Item onClick={() => onAddSubregionClick('row')}>Wiersz</Item>
                                              <Item onClick={() => onAddTextSubregionClick('row_title', currentAnnotation)}>Tytuł wiersza</Item>
                                              <Item onClick={() => onAddSubregionClick('column')}>Kolumna</Item>
                                              <Item onClick={() => onAddTextSubregionClick('column_title', currentAnnotation)}>Tytuł kolumny</Item>
                                            </>}
                                            <Item onClick={() => onAddTextSubregionClick('text_annotation', currentAnnotation)}>Adnotacja tekstowa</Item>
                                          </Submenu>}
    </Menu>);
  }

function MyCanvas({image, scale, offset, onBoundsChange, onScaleChange, changeAnnotationIndex, 
  annotations, textAnnotations, onAnnotationMove, onAnnotationTransform, selectedAnnotationsIndex, 
  showModal, isAnnotationTextMode, onSaveTextAnnotation}) {
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
        isAnnotationTextMode={isAnnotationTextMode}
        textAnnotations={textAnnotations}
        onSaveTextAnnotation={onSaveTextAnnotation}
      />
    </Stage>
  </div>;
}

MyCanvas.propTypes = {
  image: PropTypes.any,
  props: PropTypes.any
};

const WithMenu = ({annotations, image, scale, id, pageIndex, publicationId, onScaleChange, onAnnotationsChange, showAnnotationsInfoModal}) => {
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [selectedAnnotationsIndex, setSelectedAnnotationsIndex] = useState(null);
  const [render, setRender] = useState([]);
  const {annotationsControllerService, publicationsService} = useContext(ServiceContext);
  const [downloadedImage] = useImage(image);
  const [isAnnotationTextMode, setAnnotationTextMode] = useState(false);
  const [textAnnotations, setTextAnnotations] = useState([]);
  const currentTextAnnotationType = useRef();
  const currentTextAnnotationParent = useRef();

  useEffect(() => {
    const handleResize = _debounce(() => {
      setRender([]);
    }, 100);
    setOffset({x: 0, y: 0});
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    }, true).then(onAnnotationsChange);
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

  const transformAnnotation = (target, index, subregionIndex) => {
    const {x, y, width, height, scaleX, scaleY} = target.attrs;
    let offetX = width * scaleX, offsetY = height * scaleY;
    annotationsControllerService.transformAnnotation(pageIndex, index, subregionIndex, {
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

  const changeAnnotationIndex = (ind, subRegionInd, {evt}) => {
    if ((isMac && evt.metaKey) || (!isMac && evt.ctrlKey)) {
      annotationsControllerService.toggleAnnotationSelection(pageIndex, ind, subRegionInd);
    } else {
      annotationsControllerService.selectAnnotation(pageIndex, ind, subRegionInd);
    }
    setSelectedAnnotationsIndex(annotationsControllerService.selectedAnnotations);
  };

  downloadedImage.height *= window.innerWidth / downloadedImage.width;
  downloadedImage.width = window.innerWidth;

  const scaleUpAnnotations = () => annotations.map(({data: {x1, x2, y1, y2, type, subRegions}}) => ({
    x1: x1 * downloadedImage.width,
    x2: x2 * downloadedImage.width,
    y1: y1 * downloadedImage.height,
    y2: y2 * downloadedImage.height,
    type,
    subRegions: subRegions ? subRegions.map(({x1, x2, y1, y2, type, subRegions}) => ({
      x1: x1 * downloadedImage.width,
      x2: x2 * downloadedImage.width,
      y1: y1 * downloadedImage.height,
      y2: y2 * downloadedImage.height,
      subRegions: subRegions ? subRegions.map(({x1, x2, y1, y2, text}) => ({
        x1: x1 * downloadedImage.width,
        x2: x2 * downloadedImage.width,
        y1: y1 * downloadedImage.height,
        y2: y2 * downloadedImage.height,
        text: text
      })):null,
      type
    })) : null
  }));

  const scaleUpTextAnnotations = () => textAnnotations.map(({x1, x2, y1, y2, text}) => ({
    x1: x1 * downloadedImage.width,
    x2: x2 * downloadedImage.width,
    y1: y1 * downloadedImage.height,
    y2: y2 * downloadedImage.height,
    text: text
  }));

  const onAddTextSubregionClick = async (type, parent) => {
    var ocrInfo = await publicationsService.getOcrData(publicationId, pageIndex + 1);
    setTextAnnotations(ocrInfo);
    setAnnotationTextMode(true);
    currentTextAnnotationParent.current = parent;
    currentTextAnnotationType.current = type;
  };

  const onSaveTextAnnotation = (textAnnotations) => {
    if (!textAnnotations || textAnnotations.length == 0) {
      setAnnotationTextMode(false);
      return;
    }
    var subregion = {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
        type: [currentTextAnnotationType.current],
        subRegions: textAnnotations.map(el => ({
          x1: el.x1 / downloadedImage.width,
          x2: el.x2 / downloadedImage.width,
          y1: el.y1 / downloadedImage.height,
          y2: el.y2 / downloadedImage.height,
          text: el.text
        }))
    };
    currentTextAnnotationParent.current.data.subRegions.push(subregion);
    onAnnotationsChange();
    setAnnotationTextMode(false);
  };

  return <div>
    <MenuProvider id={`canvas_menu${id}`}>
      <MyCanvas image={downloadedImage} annotations={scaleUpAnnotations()}
                scale={scale} offset={centerBounds(offset)}
                onAnnotationMove={({currentTarget}, index, subregionIndex) => transformAnnotation(currentTarget, index, subregionIndex)}
                onAnnotationTransform={({currentTarget}, index, subregionIndex) => transformAnnotation(currentTarget, index, subregionIndex)}
                onBoundsChange={setOffset}
                onScaleChange={onScaleChange}
                changeAnnotationIndex={changeAnnotationIndex}
                selectedAnnotationsIndex={selectedAnnotationsIndex}
                showModal={showAnnotationsInfoModal}
                isAnnotationTextMode={isAnnotationTextMode}
                textAnnotations={scaleUpTextAnnotations()}
                onSaveTextAnnotation={onSaveTextAnnotation}
      />
    </MenuProvider>
    <MyMenu id={`canvas_menu${id}`}
            annotations={annotations}
            selectedAnnotationsIndex={selectedAnnotationsIndex}
            onNewAdnotationClick={onAddAnnotation}
            onCopyAnnotationClick={onCopyAnnotationClick}
            onEditAnnotationClick={onEditAnnotationClick}
            onDeleteAnnotationClick={onDeleteAnnotationClick}
            onConnectAnnotationClick={onConnectAnnotationClick}
            annotationsControllerService={annotationsControllerService}
            onAnnotationsChange={onAnnotationsChange}
            image={downloadedImage}
            onAddTextSubregionClick={onAddTextSubregionClick}
    />
  </div>;
};

export default WithMenu;
