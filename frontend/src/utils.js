export const truncateText = (maxLength) => (text) => text.length < maxLength ? text : `${text.substring(0, maxLength - 3)}...`;

export const fetchBody = async (...args) => {
  const result = await fetch(...args);

  const text = await result.text();
  if (text.length === 0){
    return;
  }

  const body = JSON.parse(text);
  if (result.status !== 200) {
    throw body.errorCode;
  }
  return body;
};

export const fetchBodyThrowMessage = async (...args) => {
  const result = await fetch(...args);

  const text = await result.text();
  if (text.length === 0){
    return;
  }

  const body = JSON.parse(text);
  if (result.status !== 200) {
    throw body.message;
  }
  return body;
};

export const windowsCloseEventHandler = (ev) => {
  ev.preventDefault();
  return ev.returnValue = 'If you will leave the changes will not be saved';
};

