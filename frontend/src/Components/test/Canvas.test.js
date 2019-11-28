import React from 'react';
import { shallow, configure} from 'enzyme';
import WithMenu from '../Canvas';
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() })
const styles = require('react-contexify/dist/ReactContexify.min.css')

describe('Canvas tests', () => {
    it(' => ', () => {
        //TODO refactor functional-components to enable testing => instance is null
        //https://medium.com/@acesmndr/testing-react-functional-components-with-hooks-using-enzyme-f732124d320a
        //const wrapper = shallow(<WithMenu/>);
        var annotationsList = [
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
        //wrapper.setProps({ annotations: annotationsList });
        //const instance = wrapper.instance();
      });
});