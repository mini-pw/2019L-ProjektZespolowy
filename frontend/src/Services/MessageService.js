import {toast} from 'react-toastify';

export default class MessageService {
  showSuccess(message) {
    toast.success(message, {
      autoClose: 3000,
      position: toast.POSITION.TOP_LEFT
    });
  }

  showError(message) {
    toast.error(message, {
      autoClose: 3000,
      position: toast.POSITION.TOP_LEFT
    });
  }

  showInfo(message) {
    toast.info(message, {
      autoClose: 3000,
      position: toast.POSITION.TOP_LEFT
    });
  }

  showWarn(message) {
    toast.warn(message, {
      autoClose: 3000,
      position: toast.POSITION.TOP_LEFT
    });
  }
};
