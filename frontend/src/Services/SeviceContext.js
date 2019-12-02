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
  const publicationsService = new PublicationsService(authService);
  const annotationsControllerService = new AnnotationsControllerService(messageService, publicationsService);
  return {
    authService,
    publicationsService: publicationsService,
    annotationsService: new AnnotationsService(authService, annotationsControllerService, publicationsService),
    helperService: new HelperService(),
    annotationsControllerService,
    messageService
  }
}

export const ServiceContext = createContext({});
