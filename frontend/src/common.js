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

export const availableSubTypes = [
  {id: 15, name: "Cell", value: "cell"},
  {id: 16, name: "Title", value: "title"},
  {id: 17, name: "Row", value: "row"},
  {id: 18, name: "Row Title", value: "row_title"},
  {id: 19, name: "Column", value: "column"},
  {id: 20, name: "Column Title", value: "column_title"},
  {id: 21, name: "Text annotation", value: "text_annotation"},
  {id: 22, name: "X axis", value: "x_axis"},
  {id: 23, name: "Title of x axis", value: "x_axis_title"},
  {id: 24, name: "Y axis", value: "y_axis"},
  {id: 25, name: "Title of y axis", value: "y_axis_title"}
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
