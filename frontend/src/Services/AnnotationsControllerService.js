import React from 'react';
import Prompt from '../Components/Prompt';
import Popup from 'react-popup';
import _ from 'lodash';

class Stack {
  stack = [];
  constructor(maxSize=5) {
    this.maxSize = maxSize;
  }

  push(entity) {
    this.stack = [...this.stack.slice(-(this.maxSize - 1)), entity];
  }

  pop() {
    if (this.stack.length <= 1) {
      return;
    }
    this.stack = this.stack.slice(0, -1);
  }

  clear() {
    this.stack = this.stack.slice(-1);
  }

  get top() {
    return this.stack[this.stack.length - 1];
  }
}

export default class AnnotationsControllerService {
  selectedAnnotations = [];
  get annotations() {
    return this.stack.top;
  }

  set annotations(entity) {
    this.stack.push(entity);
  }

  constructor(messageService, publicationsService) {
    this.messageService = messageService;
    this.publicationsService = publicationsService;
    this.stack = new Stack();
  }

  async getTypes(){
    var types = await this.publicationsService.getTypes();
    this.availableTypes = types;
  }

  async getTags(){
    var tags = await this.publicationsService.getTags();
    this.availableTags = tags;
  }

  selectAnnotation(pageIndex, annotationIndex, subRegionIndex) {
    this.selectedAnnotations = [{pageIndex, annotationIndex, subRegionIndex}];
  }

  updateAnnotationsIds(pageIndex, newIds) {
    this.annotations[pageIndex] = this.annotations[pageIndex].map((annotation, ind) => ({...annotation, id: newIds[ind]}));
    this.annotations = [...this.annotations];
  }

  isAnnotationSelected(pageIndex, annotationIndex, subRegionIndex) {
    return this.selectedAnnotations.some((annotation) => annotation.pageIndex === pageIndex &&
      annotation.annotationIndex === annotationIndex && annotation.subRegionIndex === subRegionIndex);
  }

  toggleAnnotationSelection(pageIndex, annotationIndex, subRegionIndex) {
    if (this.isAnnotationSelected(pageIndex, annotationIndex, subRegionIndex)) {
      this.selectedAnnotations = this.selectedAnnotations.filter((annotation) => 
      !(annotation.pageIndex === pageIndex && annotation.annotationIndex === annotationIndex && annotation.subRegionIndex === subRegionIndex));
    } else {
      this.selectedAnnotations = [...this.selectedAnnotations, {pageIndex, annotationIndex, subRegionIndex}];
    }
  }

  async addAnnotationToPage(pageIndex, newAnnotation, showModal) {
    if (showModal) {
      if(!this.availableTypes){
        await this.getTypes();
      }
      if(!this.availableTags){
        await this.getTags();
      }
      const setAnnotationData = async (newAnnotation) => new Promise(resolve => {
        var availableTypes = this.availableTypes;
        var availableTags = this.availableTags;
        Popup.registerPlugin('prompt', function (callback) {
          let defaultType = [];
          newAnnotation.data.type = defaultType;
          newAnnotation.data.text = null;
          newAnnotation.tags = [];
          let promptType = defaultType;
          let promptText = null;
          let promptTags = [];
  
          let promptChange = function (type, text, tags) {
            promptType = type;
            promptText = text;
            promptTags = tags;
          };
  
          this.create({
            title: 'New annotation',
            content: <Prompt availableTags={availableTags} availableTypes={availableTypes} type={defaultType} text="" tags={[]} onChange={promptChange}/>,
            buttons: {
              left: ['cancel'],
              right: [
                {
                  text: 'Save',
                  key: '⌘+s',
                  className: 'success',
                  action: function () {
                    callback(promptType, promptText, promptTags);
                    Popup.close();
                  }
                }]
            }
          });
        });
  
        /** Call the plugin */
        Popup.plugins().prompt(function (type, text, tags) {
          newAnnotation.data.type = type;
          newAnnotation.data.text = text;
          newAnnotation.tags = tags;
          resolve(newAnnotation);
        });
      });
      newAnnotation = await setAnnotationData(newAnnotation);
    }
    const updatedAnnotations = _.cloneDeep(this.annotations);
    updatedAnnotations[pageIndex] = [...this.annotations[pageIndex], newAnnotation];
    this.annotations = updatedAnnotations;
  }

  deleteSelectedAnnotations() {
    const updatedAnnotations = _.cloneDeep(this.annotations);
    this.selectedAnnotations.sort(function (a, b) {
      if (a.subRegionIndex > b.subRegionIndex) {
          return -1;
      }
      if (b.subRegionIndex > a.subRegionIndex) {
          return 1;
      }
      return 0;
    });
    this.selectedAnnotations.sort(function (a, b) {
      if (a.annotationIndex > b.annotationIndex) {
          return -1;
      }
      if (b.annotationIndex > a.annotationIndex) {
          return 1;
      }
      return 0;
    });
    for(var i=0; i<this.selectedAnnotations.length; i++){
      var selected = this.selectedAnnotations[i];
      if(selected.subRegionIndex == null)
        updatedAnnotations[selected.pageIndex].splice(selected.annotationIndex, 1);
      else
        updatedAnnotations[selected.pageIndex][selected.annotationIndex].data.subRegions.splice(selected.subRegionIndex, 1);
    }
    this.annotations = [...updatedAnnotations];
    this.selectedAnnotations = [];
  }

  async editSelectedAnnotation() {
    if (this.selectedAnnotations.length !== 1) {
      throw new Error('Only one annotation must be selected for edit');
    }
    if(!this.availableTypes){
      await this.getTypes();
    }
    if(!this.availableTags){
      await this.getTags();
    }
    const [{pageIndex, annotationIndex}] = this.selectedAnnotations;
    const setAnnotationData = async () => new Promise(resolve => {
      var availableTypes = this.availableTypes;
      var availableTags = this.availableTags;
      Popup.registerPlugin('prompt', function (defaultType, defaultText, defaultTags, callback) {
        let promptType = null;
        let promptText = null;
        let promptTags = [];

        let promptChange = function (type, text, tags) {
          promptType = type;
          promptText = text;
          promptTags = tags;
        };

        this.create({
          title: 'Zmień adnotację',
          content: <Prompt availableTags={availableTags} availableTypes={availableTypes} type={defaultType} text={defaultText} tags={defaultTags} onChange={promptChange}/>,
          buttons: {
            left: ['cancel'],
            right: [
              {
                text: 'Save',
                key: '⌘+s',
                className: 'success',
                action: function () {
                  callback(promptType, promptText, promptTags);
                  Popup.close();
                }
              }]
          }
        });
      });

      let updateAnnotation = (type, text, tags) => {
        const updatedAnnotations = _.cloneDeep(this.annotations);
        updatedAnnotations[pageIndex][annotationIndex].data.type = type;
        updatedAnnotations[pageIndex][annotationIndex].data.text = text;
        updatedAnnotations[pageIndex][annotationIndex].tags = tags;
        resolve(updatedAnnotations);
      };
      const originalType = this.annotations[pageIndex][annotationIndex].data.type;
      const originalText = this.annotations[pageIndex][annotationIndex].data.text;
      const originalTags = this.annotations[pageIndex][annotationIndex].tags;
      Popup.plugins().prompt(originalType, originalText, originalTags, updateAnnotation);
    });

    var newAnnotations = await setAnnotationData();
    this.annotations = this.deleteSubRegionsWhenTypeChanges(newAnnotations, pageIndex, annotationIndex);
  }

  deleteSubRegionsWhenTypeChanges(newAnnotations, pageIndex, annotationIndex){
    var newTypes = newAnnotations[pageIndex][annotationIndex].data.type;
    var subregions = [];
    newTypes.forEach(type => {
      var availableType = this.availableTypes.find(el => el.value === type);
      if(!availableType.subtypes && availableType.parent){
        availableType = this.availableTypes.find(el => el.value === availableType.parent);
      }
      if(availableType.subtypes){
        subregions = subregions.concat(availableType.subtypes.filter((item) => subregions.findIndex(subregion => subregion.value === item.value) < 0));
      }
    });
    var regions = newAnnotations[pageIndex][annotationIndex].data.subRegions;
    if(regions)
      regions = regions.filter((item) => subregions.findIndex(subregion => subregion.value === item.type[0]) >= 0);
    newAnnotations[pageIndex][annotationIndex].data.subRegions = regions;
    return newAnnotations;
  }

  copySelectedAnnotations(copyOffset) {
    const updatedAnnotations = _.cloneDeep(this.annotations);
    this.selectedAnnotations.forEach(({pageIndex, annotationIndex, subRegionIndex}) => 
    {
      if(subRegionIndex == null) {
        updatedAnnotations[pageIndex].push({
          ...updatedAnnotations[pageIndex][annotationIndex],
          data: {
            ...updatedAnnotations[pageIndex][annotationIndex].data,
            x1: updatedAnnotations[pageIndex][annotationIndex].data.x1 + copyOffset,
            x2: updatedAnnotations[pageIndex][annotationIndex].data.x2 + copyOffset,
            y1: updatedAnnotations[pageIndex][annotationIndex].data.y1 + copyOffset,
            y2: updatedAnnotations[pageIndex][annotationIndex].data.y2 + copyOffset,
            subRegions: updatedAnnotations[pageIndex][annotationIndex].data.subRegions.map(region => 
              {return {...region, x1: region.x1 + copyOffset, x2: region.x2 + copyOffset, y1: region.y1 + copyOffset, y2: region.y2 + copyOffset}})
          }
        });
      }
      else {
        updatedAnnotations[pageIndex][annotationIndex].data.subRegions.push({
          ...updatedAnnotations[pageIndex][annotationIndex].data.subRegions[subRegionIndex],
          x1: updatedAnnotations[pageIndex][annotationIndex].data.subRegions[subRegionIndex].x1 + copyOffset/2,
          x2: updatedAnnotations[pageIndex][annotationIndex].data.subRegions[subRegionIndex].x2 + copyOffset/2,
          y1: updatedAnnotations[pageIndex][annotationIndex].data.subRegions[subRegionIndex].y1 + copyOffset/2,
          y2: updatedAnnotations[pageIndex][annotationIndex].data.subRegions[subRegionIndex].y2 + copyOffset/2
        });
      }
    });
    this.annotations = updatedAnnotations;
  }

  transformAnnotation(pageIndex, annotationIndex, subRegionIndex, newDataFields) {
    const updatedAnnotations = _.cloneDeep(this.annotations);
    if(subRegionIndex == null)
      updatedAnnotations[pageIndex][annotationIndex].data = {
        ...updatedAnnotations[pageIndex][annotationIndex].data,
        ...newDataFields
      };
    else
      updatedAnnotations[pageIndex][annotationIndex].data.subRegions[subRegionIndex] = {
        ...updatedAnnotations[pageIndex][annotationIndex].data.subRegions[subRegionIndex],
        ...newDataFields
      };
    this.annotations = updatedAnnotations;
  }

  getSelectedAnnotationsIds() {
    return this.selectedAnnotations.map(({pageIndex, annotationIndex}) => this.annotations[pageIndex][annotationIndex].id);
  }

  connectSelectedAnnotations() {
    const selectedIds = this.getSelectedAnnotationsIds();
    if (selectedIds.some((id) => !id)) {
      this.messageService.showError(
        'Musisz opublikować bieżące zmiany przed tym jak dodać referencję między adnotacjami');
      return;
    }
    this.annotations = this.annotations.map((annotationsOnPage, pageIndex) =>
      annotationsOnPage.map((annotation, annotationIndex) => {
        if (!this.isAnnotationSelected(pageIndex, annotationIndex)) {
          return annotation;
        }
        const currentReferences = annotation.data.references || [];
        const additionalAnnotations = selectedIds.filter((id) => id !== annotation.id && !currentReferences.includes(id));
        return {
          ...annotation,
          data: {...annotation.data, references: [...currentReferences, ...additionalAnnotations]}
        };
      }));
    this.selectedAnnotations = [];
  }

  undo() {
    this.stack.pop();
  }

  clearHistory() {
    this.stack.clear();
  }
}
