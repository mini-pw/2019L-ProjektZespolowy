import {createContext} from 'react';
import AuthService from './AuthService';
import MessageService from './MessageService';
import PublicationsService from './PublicationsService';
import AnnotationsService from './AnnotationsService';
import HelperService from './HelperService';
import AnnotationsControllerService from './AnnotationsControllerService';

export function setup () {
  const messageService = new MessageService();
  const authService = new AuthService(messageService);
  const annotationsControllerService = new AnnotationsControllerService(messageService);
  return {
    authService,
    publicationsService: new PublicationsService(authService),
    annotationsService: new AnnotationsService(authService, annotationsControllerService),
    helperService: new HelperService(),
    annotationsControllerService,
    messageService
  }
}

export const ServiceContext = createContext({});
