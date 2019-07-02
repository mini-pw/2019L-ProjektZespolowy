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

  constructor(messageService) {
    this.messageService = messageService;
    this.stack = new Stack();
  }

  selectAnnotation(pageIndex, annotationIndex) {
    this.selectedAnnotations = [{pageIndex, annotationIndex}];
  }

  updateAnnotationsIds(pageIndex, newIds) {
    this.annotations[pageIndex] = this.annotations[pageIndex].map((annotation, ind) => ({...annotation, id: newIds[ind]}));
    this.annotations = [...this.annotations];
  }

  isAnnotationSelected(pageIndex, annotationIndex) {
    return this.selectedAnnotations.some((annotation) => annotation.pageIndex === pageIndex &&
      annotation.annotationIndex === annotationIndex);
  }

  toggleAnnotationSelection(pageIndex, annotationIndex) {
    if (this.isAnnotationSelected(pageIndex, annotationIndex)) {
      this.selectedAnnotations = this.selectedAnnotations.filter((annotation) => !(annotation.pageIndex === pageIndex &&
        annotation.annotationIndex === annotationIndex));
    } else {
      this.selectedAnnotations = [...this.selectedAnnotations, {pageIndex, annotationIndex}];
    }
  }

  async addAnnotationToPage(pageIndex, newAnnotation) {
    const setAnnotationData = async (newAnnotation) => new Promise(resolve => {
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
          content: <Prompt type={defaultType} text="" tags={[]} onChange={promptChange}/>,
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
    const updatedAnnotations = _.cloneDeep(this.annotations);
    updatedAnnotations[pageIndex] = [...this.annotations[pageIndex], await setAnnotationData(newAnnotation)];
    this.annotations = updatedAnnotations;
  }

  deleteSelectedAnnotations() {
    this.annotations = this.annotations.map((annotationsOnPage, pageIndex) =>
      annotationsOnPage.filter((_, annotationIndex) => !this.isAnnotationSelected(pageIndex, annotationIndex)));
    this.selectedAnnotations = [];
  }

  async editSelectedAnnotation() {
    if (this.selectedAnnotations.length !== 1) {
      throw new Error('Only one annotation must be selected for edit');
    }
    const [{pageIndex, annotationIndex}] = this.selectedAnnotations;
    const setAnnotationData = async () => new Promise(resolve => {
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
          content: <Prompt type={defaultType} text={defaultText} tags={defaultTags} onChange={promptChange}/>,
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
    this.annotations = await setAnnotationData();
  }

  copySelectedAnnotations(copyOffset) {
    const updatedAnnotations = _.cloneDeep(this.annotations);
    this.selectedAnnotations.forEach(({pageIndex, annotationIndex}) => updatedAnnotations[pageIndex].push({
      ...updatedAnnotations[pageIndex][annotationIndex],
      data: {
        ...updatedAnnotations[pageIndex][annotationIndex].data,
        x1: updatedAnnotations[pageIndex][annotationIndex].data.x1 + copyOffset,
        x2: updatedAnnotations[pageIndex][annotationIndex].data.x2 + copyOffset,
        y1: updatedAnnotations[pageIndex][annotationIndex].data.y1 + copyOffset,
        y2: updatedAnnotations[pageIndex][annotationIndex].data.y2 + copyOffset
      }
    }));
    this.annotations = updatedAnnotations;
  }

  transformAnnotation(pageIndex, annotationIndex, newDataFields) {
    const updatedAnnotations = _.cloneDeep(this.annotations);
    updatedAnnotations[pageIndex][annotationIndex].data = {
      ...updatedAnnotations[pageIndex][annotationIndex].data,
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
