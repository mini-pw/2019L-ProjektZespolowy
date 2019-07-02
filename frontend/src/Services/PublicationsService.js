import {fetchBody} from '../utils';

const apiUrl = 'http://annotations.mini.pw.edu.pl/api/annotations';

export default class PublicationsService {
  constructor(authService) {
    this.authService = authService;
  }

  get headers() {
    return {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf8",
      'X-AUTH-TOKEN': this.authService.token
    };
  }

  async getPage(publicationId, pageNumber) {
    await this.authService.ensureLoggedIn();
    const publication = await fetchBody(`${apiUrl}/publications/${publicationId}`, {
      headers: this.headers
    });
    const page = await this.getPageData(publicationId, pageNumber);
    return {...publication, page};
  }

  async getPublication(publicationId) {
    await this.authService.ensureLoggedIn();
    const publication = await fetchBody(`${apiUrl}/publications/${publicationId}`, {
      headers: this.headers
    });
    const {count} = await fetchBody(`${apiUrl}/publications/pages`, {
      method: 'POST',
      body: JSON.stringify({
        pageNumber: 1,
        pageSize: 1,
        searchCriteria: {
          publicationId
        }
      }),
      headers: this.headers
    });
    return {...publication, pageCount: count};
  }

  async getPublicationPages(publicationId) {
    await this.authService.ensureLoggedIn();
    const {list} = await fetchBody(`${apiUrl}/publications/pages`, {
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
    return list;
  }

  async getPublicationPreviews(pageNumber, searchCriteria) {
    await this.authService.ensureLoggedIn();
    const {list: publications} = await fetchBody(`${apiUrl}/publications`, {
      method: 'POST',
      body: JSON.stringify({
        pageNumber,
        pageSize: 8,
        searchCriteria
      }),
      headers: this.headers
    });
    const imagesSrc = await Promise.all(publications.map(({id}) => this.getPageData(id, 1)));
    return publications.map((page, ind) => ({...page, src: imagesSrc[ind].imageUrl}));
  }

  async getPageData(publicationId, pageNumber) {
    await this.authService.ensureLoggedIn();
    const {list} = await fetchBody(`${apiUrl}/publications/pages`, {
      method: 'POST',
      body: JSON.stringify({
        pageNumber: pageNumber,
        pageSize: 1,
        searchCriteria: {
          publicationId
        }
      }),
      headers: this.headers
    });
    if (list && list.length > 0) {
      return list[0];
    }
    return '';
  }
}
