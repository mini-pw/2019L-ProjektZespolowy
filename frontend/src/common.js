const pushToList = (list, element) => list ? [...list, element] : [element];

export const groupBy = (groupFunc) => (list) => list.reduce(
  (acc, item) => ({
    ...acc,
    [groupFunc(item)]: pushToList(acc[groupFunc(item)], item)
  }), {});

export const availableTypes = [
  {id: 13, name: "Plot", value: "plot"},
  {id: 14, name: "Chart", value: "chart"},
  {id: 1, name: "Linear plot", value: "linear_plot"},
  {id: 2, name: "Pie chart", value: "pie_chart"},
  {id: 3, name: "Dot plot", value: "dot_plot"},
  {id: 4, name: "Column plot", value: "column_plot"},
  {id: 5, name: "Box plot", value: "box_plot"},
  {id: 9, name: "Other plot", value: "other_plot"},
  {id: 6, name: "Table", value: "table"},
  {id: 8, name: "ChaTa reference", value: "chata_reference"},
  {id: 10, name: "Image", value: "image"},
  {id: 11, name: "Algorithm", value: "algorithm"},
  {id: 12, name: "Diagram", value: "diagram"}
];

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
