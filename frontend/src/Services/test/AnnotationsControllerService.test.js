import AnnotationsControllerService from '../AnnotationsControllerService';
import _ from 'lodash';

describe('Testing AnnotationsControllerService', () => {
  it("selectAnnotation => correct idexes and prev selection removed", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    annotationServiceController.selectedAnnotations = [{pageIndex: 0, annotationIndex: 0, subRegionIndex: 0}, {pageIndex: 0, annotationIndex: 1, subRegionIndex: 0}];
    annotationServiceController.selectAnnotation(1,2,3);
    var selected = annotationServiceController.selectedAnnotations;
    expect(selected.length).toEqual(1);
    expect(selected[0].pageIndex).toEqual(1);
    expect(selected[0].annotationIndex).toEqual(2);
    expect(selected[0].subRegionIndex).toEqual(3);
  });

  it("isAnnotationSelected => parent and subregion selected", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [parent, subRegion];
    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(parentSelected && subRegionSelected).toBeTruthy();
  });

  it("isAnnotationSelected => only parent selected", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [parent];
    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(parentSelected).toBeTruthy();
    expect(subRegionSelected).toBeFalsy();
  });

  it("isAnnotationSelected => only subregion selected", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [subRegion];
    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(subRegionSelected).toBeTruthy();
    expect(parentSelected).toBeFalsy();
  });

  it("toggleAnnotationSelection => parent and subregion selected, toogle parent", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [parent, subRegion];
    annotationServiceController.toggleAnnotationSelection(0,0,null);
    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(subRegionSelected).toBeTruthy();
    expect(parentSelected).toBeFalsy();
  });

  it("toggleAnnotationSelection => parent and subregion selected, toogle subregion", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [parent, subRegion];
    annotationServiceController.toggleAnnotationSelection(0,0,0);
    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(parentSelected).toBeTruthy();
    expect(subRegionSelected).toBeFalsy();
  });

  it("toggleAnnotationSelection => parent selected, toogle subregion", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [parent];
    annotationServiceController.toggleAnnotationSelection(0,0,0);
    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(parentSelected).toBeTruthy();
    expect(subRegionSelected).toBeTruthy();
  });

  it("toggleAnnotationSelection => subregion selected, toogle parent", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [subRegion];
    annotationServiceController.toggleAnnotationSelection(0,0,null);
    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(parentSelected).toBeTruthy();
    expect(subRegionSelected).toBeTruthy();
  });

  it("addAnnotationToPage => new annotation was added", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var pageIndex = 1;
    var newAnnotation = {data: 'sample3'};
    annotationServiceController.annotations = [[{data: 'sample1'}],[{data: 'sample2'}]];

    await annotationServiceController.addAnnotationToPage(pageIndex, newAnnotation, false);
    
    expect(annotationServiceController.annotations[pageIndex].length).toEqual(2);
  });

  it("deleteSelectedAnnotations => delete subregion", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [subRegion];
    annotationServiceController.annotations = [
        [
            {
                data: {subRegions: [{data: 'subregion1'}, {data: 'subregion2'}]}
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];

    annotationServiceController.deleteSelectedAnnotations();

    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(subRegionSelected).toBeFalsy();
    expect(parentSelected).toBeFalsy();
    expect(annotationServiceController.annotations.length).toEqual(2);
    expect(annotationServiceController.annotations[0].length).toEqual(2);
    expect(annotationServiceController.annotations[0][0].data.subRegions.length).toEqual(1);
  });

  it("deleteSelectedAnnotations => delete parent", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [parent];
    annotationServiceController.annotations = [
        [
            {
                data: {subRegions: [{data: 'subregion1'}, {data: 'subregion2'}]}
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];

    annotationServiceController.deleteSelectedAnnotations();

    var parentSelected = annotationServiceController.isAnnotationSelected(0,0,null);
    var subRegionSelected = annotationServiceController.isAnnotationSelected(0,0,0);
    expect(subRegionSelected).toBeFalsy();
    expect(parentSelected).toBeFalsy();
    expect(annotationServiceController.annotations.length).toEqual(2);
    expect(annotationServiceController.annotations[0].length).toEqual(1);
  });

  it("deleteSubRegionsWhenTypeChanges => deleted when table changes to another type", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var annotations = [
        [
            {
                data: {
                    type: 'table',
                    subRegions: [{data: 'subregion1'}, {data: 'subregion2'}]
                }
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];
    annotationServiceController.annotations = annotations;
    var newAnnotations = _.cloneDeep(annotations);;
    newAnnotations[0][0].data.type = 'x_axis';

    var array = annotationServiceController.deleteSubRegionsWhenTypeChanges(newAnnotations, 0, 0);

    expect(array[0][0].data.subRegions.length).toEqual(0);
  });

  it("deleteSubRegionsWhenTypeChanges => deleted when plot changes to another type", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var annotations = [
        [
            {
                data: {
                    type: 'linear_plot',
                    subRegions: [{data: 'subregion1'}, {data: 'subregion2'}]
                }
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];
    annotationServiceController.annotations = annotations;
    var newAnnotations = _.cloneDeep(annotations);;
    newAnnotations[0][0].data.type = 'x_axis';

    var array = annotationServiceController.deleteSubRegionsWhenTypeChanges(newAnnotations, 0, 0);

    expect(array[0][0].data.subRegions.length).toEqual(0);
  });

  it("deleteSubRegionsWhenTypeChanges => subRegions not deleted when type does not change", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var annotations = [
        [
            {
                data: {
                    type: 'linear_plot',
                    subRegions: [{data: 'subregion1'}, {data: 'subregion2'}]
                }
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];
    annotationServiceController.annotations = annotations;
    var newAnnotations = _.cloneDeep(annotations);;
    newAnnotations[0][0].data.type = 'linear_plot';

    var array = annotationServiceController.deleteSubRegionsWhenTypeChanges(newAnnotations, 0, 0);

    expect(array[0][0].data.subRegions.length).toEqual(2);
  });

  it("checkIfChart => false for another", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var type = 'TabLe';
    var result = annotationServiceController.checkIfChart(type);
    expect(result).toBeFalsy();
  });

  it("checkIfChart => true for correct", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var type = 'CHArt';
    var result = annotationServiceController.checkIfChart(type);
    expect(result).toBeTruthy();
  });
  
  it("checkIfTable => false for another", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var type = 'PLOt';
    var result = annotationServiceController.checkIfTable(type);
    expect(result).toBeFalsy();
  });
  
  it("checkIfTable => true for correct", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var type = 'tabLE';
    var result = annotationServiceController.checkIfTable(type);
    expect(result).toBeTruthy();
  });

  it("copySelectedAnnotations => parent selected: subregions and annotation copied with offset", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [parent];
    annotationServiceController.annotations = [
        [
            {
                data: {
                  x1: 0.2,
                  x2: 0.25,
                  y1: 0.5,
                  y2: 0.55,
                  subRegions: [
                    {x1: 0.21, x2: 0.22, y1: 0.51, y2: 0.55}, 
                    {x1: 0.22, x2: 0.23, y1: 0.53, y2: 0.54}
                  ]
                }
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];

    var copyOffset = 0.02;
    annotationServiceController.copySelectedAnnotations(copyOffset);

    //check if lenght correct of the lists
    expect(annotationServiceController.annotations[0].length).toEqual(3);
    expect(annotationServiceController.annotations[1].length).toEqual(1);

    //check if original annotation remained without changes
    expect(annotationServiceController.annotations[0][0].data.x1).toEqual(0.2);
    expect(annotationServiceController.annotations[0][0].data.x2).toEqual(0.25);
    expect(annotationServiceController.annotations[0][0].data.y1).toEqual(0.5);
    expect(annotationServiceController.annotations[0][0].data.y2).toEqual(0.55);
    expect(annotationServiceController.annotations[0][0].data.subRegions[0].x1).toEqual(0.21);
    expect(annotationServiceController.annotations[0][0].data.subRegions[1].y1).toEqual(0.53);

    //check if copied with offset
    expect(annotationServiceController.annotations[0][2].data.x1).toEqual(0.2 + copyOffset);
    expect(annotationServiceController.annotations[0][2].data.x2).toEqual(0.25 + copyOffset);
    expect(annotationServiceController.annotations[0][2].data.y1).toEqual(0.5 + copyOffset);
    expect(annotationServiceController.annotations[0][2].data.y2).toEqual(0.55 + copyOffset);
    expect(annotationServiceController.annotations[0][2].data.subRegions[0].x1).toEqual(0.21 + copyOffset);
    expect(annotationServiceController.annotations[0][2].data.subRegions[1].y1).toEqual(0.53 + copyOffset);
  });

  it("copySelectedAnnotations => subRegion selected: subregion attached to parent and copied with offset", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.selectedAnnotations = [subRegion];
    annotationServiceController.annotations = [
        [
            {
                data: {
                  x1: 0.2,
                  x2: 0.25,
                  y1: 0.5,
                  y2: 0.55,
                  subRegions: [
                    {x1: 0.21, x2: 0.22, y1: 0.51, y2: 0.55}, 
                    {x1: 0.22, x2: 0.23, y1: 0.53, y2: 0.54}
                  ]
                }
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];

    var copyOffset = 0.02;
    annotationServiceController.copySelectedAnnotations(copyOffset);

    //check if lenght correct of the lists
    expect(annotationServiceController.annotations[0].length).toEqual(2);
    expect(annotationServiceController.annotations[1].length).toEqual(1);
    expect(annotationServiceController.annotations[0][0].data.subRegions.length).toEqual(3);

    //check if original annotation remained without changes
    expect(annotationServiceController.annotations[0][0].data.x1).toEqual(0.2);
    expect(annotationServiceController.annotations[0][0].data.x2).toEqual(0.25);
    expect(annotationServiceController.annotations[0][0].data.y1).toEqual(0.5);
    expect(annotationServiceController.annotations[0][0].data.y2).toEqual(0.55);
    expect(annotationServiceController.annotations[0][0].data.subRegions[0].x1).toEqual(0.21);
    expect(annotationServiceController.annotations[0][0].data.subRegions[1].y1).toEqual(0.53);

    //check if copied with offset
    expect(annotationServiceController.annotations[0][0].data.subRegions[2].x1).toEqual(0.21 + copyOffset/2);
    expect(annotationServiceController.annotations[0][0].data.subRegions[2].y1).toEqual(0.51 + copyOffset/2);
    expect(annotationServiceController.annotations[0][0].data.subRegions[2].x2).toEqual(0.22 + copyOffset/2);
    expect(annotationServiceController.annotations[0][0].data.subRegions[2].y2).toEqual(0.55 + copyOffset/2);
  });

  it("transformAnnotations => subRegion correctly tranformed", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.annotations = [
        [
            {
                data: {
                  x1: 0.2,
                  x2: 0.25,
                  y1: 0.5,
                  y2: 0.55,
                  subRegions: [
                    {x1: 0.21, x2: 0.22, y1: 0.51, y2: 0.55}, 
                    {x1: 0.22, x2: 0.23, y1: 0.53, y2: 0.54}
                  ]
                }
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];

    var newDataFields = {x1: 0.1, x2: 0.2, y1: 0.9, y2: 0.91};
    annotationServiceController.transformAnnotation(subRegion.pageIndex, subRegion.annotationIndex, subRegion.subRegionIndex, newDataFields);

    //check if parent remained without changes
    expect(annotationServiceController.annotations[0][0].data.x1).toEqual(0.2);
    expect(annotationServiceController.annotations[0][0].data.x2).toEqual(0.25);
    expect(annotationServiceController.annotations[0][0].data.y1).toEqual(0.5);
    expect(annotationServiceController.annotations[0][0].data.y2).toEqual(0.55);

    //check if subregion tranformed
    expect(annotationServiceController.annotations[0][0].data.subRegions[0].x1).toEqual(0.1);
    expect(annotationServiceController.annotations[0][0].data.subRegions[0].y1).toEqual(0.9);
    expect(annotationServiceController.annotations[0][0].data.subRegions[0].x2).toEqual(0.2);
    expect(annotationServiceController.annotations[0][0].data.subRegions[0].y2).toEqual(0.91);
  });

  it("transformAnnotations => subRegion correctly tranformed", async () => {
    var annotationServiceController = new AnnotationsControllerService(null);
    var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
    var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
    annotationServiceController.annotations = [
        [
            {
                data: {
                  x1: 0.2,
                  x2: 0.25,
                  y1: 0.5,
                  y2: 0.55,
                  subRegions: [
                    {x1: 0.21, x2: 0.22, y1: 0.51, y2: 0.55}, 
                    {x1: 0.22, x2: 0.23, y1: 0.53, y2: 0.54}
                  ]
                }
            },
            {
                data: 'sample1.2'
            }
        ],
        [
            {
                data: 'sample2'
            }
        ]
    ];

    var newDataFields = {x1: 0.1, x2: 0.2, y1: 0.9, y2: 0.91};
    annotationServiceController.transformAnnotation(parent.pageIndex, parent.annotationIndex, parent.subRegionIndex, newDataFields);

    //check if tranformed
    expect(annotationServiceController.annotations[0][0].data.x1).toEqual(0.1);
    expect(annotationServiceController.annotations[0][0].data.y1).toEqual(0.9);
    expect(annotationServiceController.annotations[0][0].data.x2).toEqual(0.2);
    expect(annotationServiceController.annotations[0][0].data.y2).toEqual(0.91);
  });
})
