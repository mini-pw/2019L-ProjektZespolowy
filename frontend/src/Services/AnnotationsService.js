import {fetchBody} from '../utils';
import {groupBy} from '../common';

const apiUrl = 'http://annotations.mini.pw.edu.pl/api/annotations';//'http://localhost:8081/api/annotations';//

export default class AnnotationsService {
  constructor(authService, annotationsControllerService, publicationsService) {
    this.authService = authService;
    this.annotationsControllerService = annotationsControllerService;
    this.publicationsService = publicationsService;
    this.getTags();
    this.tags = null;
  }

  async getTags(){
    if(this.tags === null)
      this.tags = await this.publicationsService.getTags();
  }

  get headers() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf8',
      'X-AUTH-TOKEN': this.authService.token
    };
  }

  async getAnnotations(pageId) {
    await this.authService.ensureLoggedIn();
    const {list} = await fetchBody(`${apiUrl}/annotations/list`, {
      method: 'POST',
      body: JSON.stringify({
        pageNumber: 1,
        pageSize: 100,
        searchCriteria: {
          pageId
        }
      }),
      headers: this.headers
    });
    return list;
  }

  async getAnnotationsForPublication(publicationId) {
    await this.authService.ensureLoggedIn();
    const {list} = await fetchBody(`${apiUrl}/annotations/list`, {
      method: 'POST',
      body: JSON.stringify({
        pageNumber: 1,
        pageSize: 100,
        searchCriteria: {
          publicationId
        }
      }),
      headers: this.headers
    });
    await this.getTags();
    const withTags = list.map(annotation => {
      if (annotation.tags) {
        annotation.tags = annotation.tags.map(tagValue => this.tags.find(availableTag => availableTag.value === tagValue));
      } else {
        annotation.tags = [];
      }
      return annotation;
    });
    return groupBy(x => x.pageId)(withTags);
  }

  async saveChanges(annotations, pageId, pageIndex) {
    await this.authService.ensureLoggedIn();
    const updatedAnnotations = annotations
      .map((a) => (
        {annotation: a.data, pageId, annotationsUsed: [], tags: a.tags.map(t => t.value)}));
    if(annotations.length === 0){ //delete all annotations for page
      updatedAnnotations.push({annotation: null, pageId, annotationsUsed: null, tags: null});
    }
    const res = await fetch(`${apiUrl}/annotations/new`, {
      method: 'POST',
      body: JSON.stringify(updatedAnnotations),
      headers: this.headers
    });
    const newIds = await res.json();
    if (Array.isArray(newIds)) {
      this.annotationsControllerService.updateAnnotationsIds(pageIndex, newIds)
    }
    this.annotationsControllerService.clearHistory();
  }
}
