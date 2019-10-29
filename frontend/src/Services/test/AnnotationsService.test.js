import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import AnnotationsService from '../AnnotationsService';
import {MockAuthService, MockAnnotationControllerService} from './Mocks';
global.fetch = require('jest-fetch-mock')

describe('Testing AnnotationService', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })
 
  it("If annotations are an empty array => empty annotation injected", async () => {
    fetch.mockResponseOnce(JSON.stringify({test: "test"}));

    var annotationService = new AnnotationsService(new MockAuthService(), new MockAnnotationControllerService());
    await annotationService.saveChanges([],1,11);

    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].toString().includes('/annotations/new')).toBeTruthy();
    var expectedBody = '[{"annotation":null,"pageId":1,"annotationsUsed":null,"tags":null}]';
    expect(fetch.mock.calls[0][1].body).not.toBeNull();
    expect(fetch.mock.calls[0][1].body).toEqual(expectedBody);
  });

  it("If annotation array is not empty => annotations are correctly mapped", async () => {
    fetch.mockResponseOnce(JSON.stringify({test: "test"}));

    var annotationService = new AnnotationsService(new MockAuthService(), new MockAnnotationControllerService());
    await annotationService.saveChanges([{data: "somedata", tags: []}],1,11);
    
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].toString().includes('/annotations/new')).toBeTruthy();
    var expectedBody = '[{"annotation":"somedata","pageId":1,"annotationsUsed":[],"tags":[]}]';
    expect(fetch.mock.calls[0][1].body).not.toBeNull();
    expect(fetch.mock.calls[0][1].body).toEqual(expectedBody);
  });
})
