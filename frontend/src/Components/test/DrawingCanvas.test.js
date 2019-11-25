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
        wrapper.setProps({ selectedAnnotations: [parent, subRegion] });
        const instance = wrapper.instance();
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
        var result = instance.formatTypes(['cell', 'chart']);
        expect(result).toBe('Cell,Chart');
    });
});