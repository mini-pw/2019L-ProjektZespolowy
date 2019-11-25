import PublicationsService from '../PublicationsService';
import {MockAuthService} from './Mocks';
global.fetch = require('jest-fetch-mock')

describe('Testing PublicationsService', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })
 
  it("getPublicationPages => correctly formated post (body and url)", async () => {
    fetch.mockResponseOnce(JSON.stringify(
        {
            list: [{ imageUrl: "http://image.mock.url.com" },
            { imageUrl: "http://image2.mock.url.com" }]
        }
    ));

    var publicationsService = new PublicationsService(new MockAuthService());
    var publicationId = 5;
    var publicationsList = await publicationsService.getPublicationPages(publicationId);

    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].toString().includes('/publications/pages')).toBeTruthy();
    var expectedBody = '{"pageNumber":1,"pageSize":100,"searchCriteria":{"publicationId":'+ publicationId +'}}';
    expect(fetch.mock.calls[0][1].body).not.toBeNull();
    expect(fetch.mock.calls[0][1].body).toEqual(expectedBody);
  });

  it("getPublicationPages => response imageUrls formatted to https", async () => {
    fetch.mockResponseOnce(JSON.stringify(
        {
            list: [{ imageUrl: "http://image.mock.url.com" },
            { imageUrl: "http://image2.mock.url.com" }]
        }
    ));

    var publicationsService = new PublicationsService(new MockAuthService());
    var publicationId = 5;
    var publicationsList = await publicationsService.getPublicationPages(publicationId);

    for(var i=0; i< publicationsList.length; i++){
        expect(publicationsList[i].imageUrl.startsWith('https')).toBeTruthy();
    }
  });

  it("getPageData => correctly formated post (body and url)", async () => {
    fetch.mockResponseOnce(JSON.stringify(
        {
            list: [{ imageUrl: "http://image.mock.url.com" },
            { imageUrl: "http://image2.mock.url.com" }]
        }
    ));

    var publicationsService = new PublicationsService(new MockAuthService());
    var publicationId = 5;
    var pageNumber = 2;
    var publicationsList = await publicationsService.getPageData(publicationId, pageNumber);

    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].toString().includes('/publications/pages')).toBeTruthy();
    var expectedBody = '{"pageNumber":'+pageNumber+',"pageSize":1,"searchCriteria":{"publicationId":'+ publicationId +'}}';
    expect(fetch.mock.calls[0][1].body).not.toBeNull();
    expect(fetch.mock.calls[0][1].body).toEqual(expectedBody);
  });

  it("getPageData => response imageUrls formatted to https", async () => {
    fetch.mockResponseOnce(JSON.stringify(
        {
            list: [{ imageUrl: "http://image.mock.url.com" },
            { imageUrl: "http://image2.mock.url.com" }]
        }
    ));

    var publicationsService = new PublicationsService(new MockAuthService());
    var publicationId = 5;
    var pageNumber = 2;
    var publication = await publicationsService.getPageData(publicationId, pageNumber);

    expect(publication.imageUrl.startsWith('https')).toBeTruthy();
  });
})
