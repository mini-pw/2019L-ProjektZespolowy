import {fetchBody} from '../utils';

const apiUrl = 'http://annotations.mini.pw.edu.pl/api/annotations'; //'http://localhost:8081/api/annotations'; //

export default class PublicationsService {
  constructor(authService) {
    this.authService = authService;
    this.types = null;
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
    list.forEach(el => el.imageUrl = el.imageUrl.replace("http", "https"));
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
      list[0].imageUrl = list[0].imageUrl.replace("http", "https");
      return list[0];
    }
    return '';
  }

  async getOcrData(publicationId, pageNumber) {
    await this.authService.ensureLoggedIn();
    const data = await fetchBody(`${apiUrl}/publications/ocr`, {
      method: 'POST',
      body: JSON.stringify({
        publication_id: publicationId,
        page: pageNumber
      }),
      headers: this.headers
    });
    return data.results[0].ocr;
  }

  async getTypes() {
    await this.authService.ensureLoggedIn();
    if(this.types == null){
      /*const types = await fetchBody(`${apiUrl}/publications/types`, {
        headers: this.headers
      });*/
      this.types = [
        {
          name: "Plot", 
          value: "plot",
          subtypes: [
            {name: "Title", value: "title", isTextAnnotation: true},
            {name: "X axis", value: "x_axis", isTextAnnotation: false, orientation: 'horizontal'},
            {name: "Title of x axis", value: "x_axis_title", isTextAnnotation: true},
            {name: "Y axis", value: "y_axis", isTextAnnotation: false, orientation: 'vertical'},
            {name: "Title of y axis", value: "y_axis_title", isTextAnnotation: true},
            {name: "Text annotation", value: "text_annotation", isTextAnnotation: true}
          ]
        },
        {
          name: "Chart", 
          value: "chart",
          parent: "plot"
        },
        {
          name: "Linear plot", 
          value: "linear_plot",
          parent: "plot"
        },
        {
          name: "Pie chart", 
          value: "pie_chart",
          parent: "plot"
        },
        {
          name: "Dot plot", 
          value: "dot_plot",
          parent: "plot"
        },
        {
          name: "Column plot", 
          value: "column_plot",
          parent: "plot"
        },
        {
          name: "Box plot", 
          value: "box_plot",
          parent: "plot"
        },
        {
          name: "Other plot", 
          value: "other_plot",
          parent: "plot"
        },
        {
          name: "Table", 
          value: "table",
          subtypes: [
            {name: "Cell", value: "cell", isTextAnnotation: true},
            {name: "Title", value: "title", isTextAnnotation: true},
            {name: "Row", value: "row", isTextAnnotation: false, orientation: 'horizontal'},
            {name: "Row Title", value: "row_title", isTextAnnotation: true},
            {name: "Column", value: "column", isTextAnnotation: false, orientation: 'vertical'},
            {name: "Column Title", value: "column_title", isTextAnnotation: true},
            {name: "Text annotation", value: "text_annotation", isTextAnnotation: true}
          ]
        },
        {
          name: "ChaTa reference", 
          value: "chata_reference"
        },
        {
          name: "Image", 
          value: "image"
        },
        {
          name: "Algorithm", 
          value: "algorithm"
        },
        {
          name: "Diagram", 
          value: "diagram"
        }
      ];
    }
    
    return this.types;
  }
}
