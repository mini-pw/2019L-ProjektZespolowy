import React, {Component} from 'react';
import {Image, Layer, Rect, Text, Transformer} from 'react-konva';
import {availableTypes, availableSubTypes} from '../common';

const getColorByIndex = (ind) => {
  // From https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
  const COLORS = [
    '#e6194b',
    '#3cb44b',
    '#ffe119',
    '#4363d8',
    '#f58231',
    '#911eb4',
    '#46f0f0',
    '#f032e6',
    '#bcf60c',
    '#fabebe',
    '#008080',
    '#e6beff',
    '#9a6324',
    '#fffac8',
    '#800000',
    '#aaffc3',
    '#808000',
    '#ffd8b1',
    '#000075',
    '#808080',
    '#000000'];
  return COLORS[ind % COLORS.length];
};

const initRectSize = 100;

class TransformerComponent extends React.Component {
  componentDidMount() {
    this.checkNode();
  }

  componentDidUpdate() {
    this.checkNode();
  }

  checkNode() {
    const stage = this.transformer.getStage();
    const {selectedShapeName} = this.props;

    const selectedNode = stage.findOne('.' + selectedShapeName);
    if (selectedNode === this.transformer.node()) {
      return;
    }

    if (selectedNode) {
      this.transformer.attachTo(selectedNode);
    } else {
      this.transformer.detach();
    }
    this.transformer.getLayer().batchDraw();
  }

  render() {
    return (
      <Transformer
        rotateEnabled={false}
        keepRatio={false}
        ref={node => {
          this.transformer = node;
        }}
      />
    );
  }
}

class DrawingCanvas extends Component {
  state = {
    selectedRect: null,
    selectedTextAnnotations: [],
    isDragging: false,
    originalX: 0,
    originalY: 0
  };

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  selectedRects() {
    return this.props.selectedAnnotations ? this.props.selectedAnnotations.map(
      ({annotationIndex, subRegionIndex}) => 
      subRegionIndex == null ? `rect${annotationIndex}` : `rect${annotationIndex}.${subRegionIndex}`) : [];
  }

  formatTypes(types) {
    var allTypes = availableTypes.concat(availableSubTypes);
    return types.map(type => allTypes.find(({value}) => value === type).name).join(',');
  }

  isTextAnnotation(types) {
    var type = types.join();
    if(type.includes('cell') || type.includes('title') || type.includes('text'))
      return true;
    return false;
  }

  handleMouseDown = (event) => {
    if(!this.props.isAnnotationTextMode)
      return;
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);

    this.stage = event.currentTarget.getStage();
    this.setState({
      originalX: this.stage.getPointerPosition().x,
      originalY: this.stage.getPointerPosition().y,
      isDragging: true
    });
  };
  
  handleMouseMove = (event) => {
    const { isDragging } = this.state;

    if (!isDragging) {
      return;
    }
    var x1 = Math.min(this.state.originalX, this.stage.getPointerPosition().x);
    var x2 = Math.max(this.state.originalX, this.stage.getPointerPosition().x);
    var y1 = Math.min(this.state.originalY, this.stage.getPointerPosition().y);
    var y2 = Math.max(this.state.originalY, this.stage.getPointerPosition().y);
    var selected = this.props.textAnnotations.filter(el => x1<el.x2 && x2>el.x1 && y2>el.y1 && y1<el.y2);
    this.setState(
      {
        selectedTextAnnotations: selected
      }
    );
  };

  handleMouseUp = () => {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);

    this.setState(
      {
        originalX: 0,
        originalY: 0,
        isDragging: false
      }
    );
  };

  render() {
    return (
      <Layer>
        <Image onMouseDown={this.handleMouseDown} image={this.props.image} perfectDrawEnabled={false}/>
        {this.props.annotations && this.props.annotations.filter(el => !this.isTextAnnotation(el.type))
        .map(
          ({x1, y1, type, subRegions}, ind) => 
                    <React.Fragment key={ind}>
                      {type && type.length > 0 && <Text x={x1+5} y={y1+5} text={this.formatTypes(type)} fill={getColorByIndex(ind)} />}
                      {subRegions && subRegions.map(({x1, y1, type}, ind2) => 
                        type && type.length > 0 && <Text key={ind2} x={x1+5} y={y1+5} text={this.formatTypes(type)} fill={getColorByIndex(ind)}/> )}
                    </React.Fragment>
        )}
        {this.props.annotations && this.props.annotations.filter(el => !this.isTextAnnotation(el.type))
        .map(({x1, y1, x2, y2, type, subRegions}, ind) =>
          <React.Fragment key={ind}>
            <Rect onClick={(evt) => this.props.changeAnnotationIndex(ind, null, evt)}
                  onDblClick={() => this.props.showModal(ind)}
                  x={x1} y={y1} width={initRectSize} height={initRectSize} scaleX={(x2 - x1) / initRectSize}
                  scaleY={(y2 - y1) / initRectSize}
                  draggable
                  onDragEnd={(args) => this.props.onAnnotationMove(args, ind, null)}
                  onTransformEnd={(args) => this.props.onAnnotationTransform(args, ind, null)}
                  stroke={getColorByIndex(ind)}
                  strokeScaleEnabled={false}
                  name={`rect${ind}`}
                  perfectDrawEnabled={false}
            />
            {subRegions && subRegions.map(({x1, y1, x2, y2, type}, ind2) =>
              <Rect onClick={(evt) => this.props.changeAnnotationIndex(ind, ind2, evt)}
                    x={x1} y={y1} width={initRectSize} height={initRectSize} scaleX={(x2 - x1) / initRectSize}
                    scaleY={(y2 - y1) / initRectSize}
                    draggable
                    onDragEnd={(args) => this.props.onAnnotationMove(args, ind, ind2)}
                    onTransformEnd={(args) => this.props.onAnnotationTransform(args, ind, ind2)}
                    stroke={getColorByIndex(ind)}
                    strokeScaleEnabled={false}
                    name={`rect${ind}.${ind2}`}
                    key={`${ind}.${ind2}`}
                    perfectDrawEnabled={false}
              />)}
          </React.Fragment>
        )}
        {this.selectedRects().map((rectName) => <TransformerComponent key={rectName} selectedShapeName={rectName}/>)}
      
        {this.props.isAnnotationTextMode && this.state.selectedTextAnnotations && 
          this.state.selectedTextAnnotations.map(
              ({x1, y1, x2, y2}, ind) => 
                            <Rect x={x1} y={y1} width={initRectSize} height={initRectSize} 
                                  scaleX={(x2 - x1) / initRectSize}
                                  scaleY={(y2 - y1) / initRectSize}
                                  stroke='#6262e5'
                                  strokeScaleEnabled={false}
                                  name={`text${ind}`}
                                  key={ind} 
                                  perfectDrawEnabled={false}
                            />
            )}
        {this.props.annotations && this.props.annotations.filter(el => this.isTextAnnotation(el.type))
            .map(
              ({x1, y1, type, subRegions}, ind) => 
                        <React.Fragment key={ind}>
                          {subRegions.map(({x1, y1, x2, y2, type}, ind2) =>
                            <Rect x={x1} y={y1} width={initRectSize} height={initRectSize} scaleX={(x2 - x1) / initRectSize}
                                  scaleY={(y2 - y1) / initRectSize}
                                  stroke={getColorByIndex(ind)}
                                  strokeScaleEnabled={false}
                                  name={`rect${ind}.${ind2}`}
                                  key={`${ind}.${ind2}`}
                                  perfectDrawEnabled={false}
                            />)}
                        </React.Fragment>
            )}
      </Layer>
    );
  }
}

export default DrawingCanvas;
