import React from 'react';
import { shallow, configure } from 'enzyme';
import DrawingCanvas from '../DrawingCanvas';
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() })

describe('DrawingCanvas tests', () => {
    it('selectedRect => returns rect names for parent and subregion', () => {
        var parent = {pageIndex: 0, annotationIndex: 0, subRegionIndex: null};
        var subRegion = {pageIndex: 0, annotationIndex: 0, subRegionIndex: 0};
        const wrapper = shallow(<DrawingCanvas/>);
        var annotations = [
            {
                subRegions: [{data: 'subregion1'}, {data: 'subregion2'}]
            },
            {
                data: 'sample2'
            }
        ];
        const instance = wrapper.instance();
        instance.availableTypes = [];
        wrapper.setProps({ selectedAnnotations: [parent, subRegion], annotations:  annotations});
        var result = instance.selectedRects();
        expect(result.length).toBe(2);
        expect(result[0]).toBe("rect0");
        expect(result[1]).toBe("rect0.0");
      });

    it('selectedRect => returns empty array if none selected', () => {
        const wrapper = shallow(<DrawingCanvas/>);
        wrapper.setProps({ selectedAnnotations: null });
        const instance = wrapper.instance();
        var result = instance.selectedRects();
        expect(result.length).toBe(0);
    });
      
    it('formatTypes => returned string correct', () => {
        const wrapper = shallow(<DrawingCanvas/>);
        const instance = wrapper.instance();
        instance.availableTypes = 
        [
          {
            name: "Plot", 
            value: "plot",
            subtypes: [
              {name: "Title", value: "title", isTextAnnotation: true},
              {name: "X axis", value: "x_axis", isTextAnnotation: false, orientation: 'horizontal'},
              {name: "Title of x axis", value: "x_axis_title", isTextAnnotation: true},
              {name: "Y axis", value: "y_axis", isTextAnnotation: false, orientation: 'vertical'},
              {name: "Title of y axis", value: "y_axis_title", isTextAnnotation: true},
              {name: "Text annotation", value: "text_annotation", isTextAnnotation: true}
            ]
          },
          {
            name: "Chart", 
            value: "chart",
            parent: "plot"
          },
          {
            name: "Linear plot", 
            value: "linear_plot",
            parent: "plot"
          },
          {
            name: "Pie chart", 
            value: "pie_chart",
            parent: "plot"
          },
          {
            name: "Dot plot", 
            value: "dot_plot",
            parent: "plot"
          },
          {
            name: "Column plot", 
            value: "column_plot",
            parent: "plot"
          },
          {
            name: "Box plot", 
            value: "box_plot",
            parent: "plot"
          },
          {
            name: "Other plot", 
            value: "other_plot",
            parent: "plot"
          },
          {
            name: "Table", 
            value: "table",
            subtypes: [
              {name: "Cell", value: "cell", isTextAnnotation: true},
              {name: "Title", value: "title", isTextAnnotation: true},
              {name: "Row", value: "row", isTextAnnotation: false, orientation: 'horizontal'},
              {name: "Row Title", value: "row_title", isTextAnnotation: true},
              {name: "Column", value: "column", isTextAnnotation: false, orientation: 'vertical'},
              {name: "Column Title", value: "column_title", isTextAnnotation: true},
              {name: "Text annotation", value: "text_annotation", isTextAnnotation: true}
            ]
          },
          {
            name: "ChaTa reference", 
            value: "chata_reference"
          },
          {
            name: "Image", 
            value: "image"
          },
          {
            name: "Algorithm", 
            value: "algorithm"
          },
          {
            name: "Diagram", 
            value: "diagram"
          }
        ];
        var result = instance.formatTypes(['cell', 'chart']);
        expect(result).toBe('Cell,Chart');
    });
});