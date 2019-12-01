const pushToList = (list, element) => list ? [...list, element] : [element];

export const groupBy = (groupFunc) => (list) => list.reduce(
  (acc, item) => ({
    ...acc,
    [groupFunc(item)]: pushToList(acc[groupFunc(item)], item)
  }), {});

export const availableTags = [
  {id: 1, name: "To discuss", value: "to_discuss"},
  {id: 2, name: "Hard case", value: "hard_case"},
  {id: 3, name: "Multiple items", value: "multiple_items"}
];

export const publicationStatuses = [
  {value: 'ALL', name: 'All'},
  {value: 'NEW', name: 'New'},
  {value: 'AUTO_ANNOTATED', name: 'Auto annotated'},
  {value: 'ANNOTATED', name: 'Annotated'},
  {value: 'SUPER_ANNOTATED', name: 'Super annotated'},
];
