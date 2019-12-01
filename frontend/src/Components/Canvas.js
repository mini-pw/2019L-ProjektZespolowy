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

const MyMenu = ({annotations, onNewAdnotationClick, onConnectAnnotationClick, onCopyAnnotationClick, onEditAnnotationClick, onDeleteAnnotationClick, selectedAnnotationsIndex, annotationsControllerService, onAnnotationsChange, onAddTextSubregionClick, image, availableTypes, id}) =>
  {
    var selectedAnnotationsCount = selectedAnnotationsIndex ? selectedAnnotationsIndex.length : 0;
    var subRegionIndex = null;
    var subregions = [];
    var isText = false;
    var currentAnnotation = null;
    if(selectedAnnotationsCount === 1){
      currentAnnotation = annotations[selectedAnnotationsIndex[0].annotationIndex];
      subRegionIndex = selectedAnnotationsIndex[0].subRegionIndex;
      currentAnnotation.data.type.forEach(type => {
        var availableType = availableTypes.find(el => el.value === type);
        if(!availableType.subtypes && availableType.parent){
          availableType = availableTypes.find(el => el.value === availableType.parent);
        }
        if(availableType.subtypes){
          subregions = subregions.concat(availableType.subtypes.filter((item) => subregions.findIndex(subregion => subregion.value === item.value) < 0));
        }
      });
      if(subRegionIndex != null) {
        var subType = currentAnnotation.data.subRegions[subRegionIndex].type[0];
        var availableType = subregions.find(el => el.value === subType);
        isText = availableType.isTextAnnotation;
      }
    }
    const getRegionSize = (type, annotationSize, image) => {
      var size = {
        x1: (annotationSize.x1 + annotationSize.x2)/2, 
        y1: (annotationSize.y1 + annotationSize.y2)/2, 
        x2: (annotationSize.x1 + annotationSize.x2)/2 + 50 / image.width, 
        y2: (annotationSize.y1 + annotationSize.y2)/2 + 25 / image.height
      };
      var availableType = subregions.find(el => el.value === type);
      if(availableType.orientation === 'horizontal') {
        size.x2 = size.x1 + (annotationSize.x2 - annotationSize.x1) - 15 / image.width;
      }
      else if (availableType.orientation === 'vertical') {
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
      {(selectedAnnotationsCount > 0 && !isText) && <Item onClick={onCopyAnnotationClick}>Kopiuj adnotację</Item>}
      {(selectedAnnotationsCount === 1 && (subRegionIndex == null || isText)) && <Item onClick={() => onEditAnnotationClick(isText)}>Edytuj adnotację</Item>}
      {(selectedAnnotationsCount > 0) && <Item onClick={onDeleteAnnotationClick}>Usuń adnotację</Item>}
      {(selectedAnnotationsCount > 1) && <Item onClick={onConnectAnnotationClick}>Połącz adnotacje</Item>}
      {(selectedAnnotationsCount === 1 && subregions.length !== 0 && subRegionIndex == null) 
                                        && <Submenu label='Dodaj podobiekty'>
                                            {
                                              subregions.map(el => {
                                                if(el.isTextAnnotation)
                                                  return <Item onClick={() => onAddTextSubregionClick(el.value, currentAnnotation)}>{el.name}</Item>;
                                                return <Item onClick={() => onAddSubregionClick(el.value)}>{el.name}</Item>;
                                                })
                                            }
                                          </Submenu>}
    </Menu>);
  }

function MyCanvas({image, scale, offset, onBoundsChange, onScaleChange, changeAnnotationIndex, 
  annotations, textAnnotations, onAnnotationMove, onAnnotationTransform, selectedAnnotationsIndex, 
  showModal, isAnnotationTextMode, isAnnotationTextEditMode, onSaveTextAnnotation, publicationsService}) {
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
        isAnnotationTextEditMode={isAnnotationTextEditMode}
        publicationsService={publicationsService}
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
  const [isAnnotationTextEditMode, setAnnotationTextEditMode] = useState(false);
  const [textAnnotations, setTextAnnotations] = useState([]);
  const currentTextAnnotationType = useRef();
  const currentTextAnnotationParent = useRef();
  const [availableTypes, setAvailableTypes] = useState(null);

  useEffect(() => {
    const handleResize = _debounce(() => {
      setRender([]);
    }, 100);
    const fetchData = async () => {
      var ocrInfo = await publicationsService.getOcrData(publicationId, pageIndex + 1);
      if(ocrInfo === null)
        ocrInfo = [];
      setTextAnnotations(ocrInfo);
    }
    const fetchTypes = async () => {
      var types = await publicationsService.getTypes();
      setAvailableTypes(types);
    }
    setOffset({x: 0, y: 0});
    window.addEventListener('resize', handleResize);
    fetchData();
    if(!availableTypes){
      fetchTypes();
    }
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

  const onEditAnnotationClick = (isTextAnnotation) => {
    if(!isTextAnnotation){
      annotationsControllerService.editSelectedAnnotation().then(onAnnotationsChange);
      return;
    }
    setAnnotationTextEditMode(true);
    setAnnotationTextMode(true);
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
    setAnnotationTextMode(true);
    currentTextAnnotationParent.current = parent;
    currentTextAnnotationType.current = type;
  };

  const onSaveTextAnnotation = (textAnnotations) => {
    if (!textAnnotations || textAnnotations.length === 0) {
      setAnnotationTextMode(false);
      setAnnotationTextEditMode(false);
      return;
    }

    if(isAnnotationTextEditMode){
      var index = selectedAnnotationsIndex[0].annotationIndex;
      var subindex = selectedAnnotationsIndex[0].subRegionIndex;
      var subregion = annotations[index].data.subRegions[subindex];
      currentTextAnnotationParent.current = annotations[index];
      currentTextAnnotationType.current = subregion.type[0];
    }
    var subregion = {
        x1: textAnnotations[0].x1 / downloadedImage.width,
        x2: textAnnotations[textAnnotations.length - 1].x2 / downloadedImage.width,
        y1: textAnnotations[0].y1 / downloadedImage.height,
        y2: textAnnotations[textAnnotations.length - 1].y2 / downloadedImage.height,
        type: [currentTextAnnotationType.current],
        subRegions: textAnnotations.map(el => ({
          x1: el.x1 / downloadedImage.width,
          x2: el.x2 / downloadedImage.width,
          y1: el.y1 / downloadedImage.height,
          y2: el.y2 / downloadedImage.height,
          text: el.text
        }))
    };
    if(isAnnotationTextEditMode){
      var index = selectedAnnotationsIndex[0].subRegionIndex;
      currentTextAnnotationParent.current.data.subRegions.splice(index,1);
    }
    if(currentTextAnnotationParent.current.data.subRegions === null)
      currentTextAnnotationParent.current.data.subRegions = [];
    currentTextAnnotationParent.current.data.subRegions.push(subregion);
    onAnnotationsChange();
    setSelectedAnnotationsIndex(null);
    setAnnotationTextMode(false);
    setAnnotationTextEditMode(false);
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
                isAnnotationTextEditMode={isAnnotationTextEditMode}
                textAnnotations={scaleUpTextAnnotations()}
                onSaveTextAnnotation={onSaveTextAnnotation}
                publicationsService={publicationsService}
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
            availableTypes={availableTypes}
    />
  </div>;
};

export default WithMenu;
