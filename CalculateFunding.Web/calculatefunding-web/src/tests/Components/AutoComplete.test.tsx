import React from 'react';
import {AutoComplete} from "../../components/AutoComplete";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

const validData = [
    "Bedfordshire",
    "Hertfordshire",
    "Buckinghamshire",
    "Northamptonshire",
    "Oxfordshire"
];

const callbackFunction = jest.fn();

describe('<AutoComplete />', () => {
    it(' renders a panel', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData}/>);

        let actual = wrapper.find('div.govuk-form-group');

        expect(actual.length).toBe(1);
    });

    it(' shows the dropdown list', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData}/>);

        wrapper.find('input').simulate("click", {
            currentTarget: {
                value: ""
            }
        });

        let actual = wrapper.find('ul.govuk-list');
        expect(actual.length).toBe(1);
        expect(actual.children().length).toBe(validData.length);
    });

    it(' filters the dropdown list with data already entered', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData}/>);

        wrapper.find('input').simulate("click", {
            currentTarget: {
                value: "Buckinghamshire"
            }
        });

        let actual = wrapper.find('ul.govuk-list');
        expect(actual.length).toBe(1);
        expect(actual.children().length).toBe(1);
    });

    it(' filters the dropdown list on change', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData}/>);

        wrapper.find('input').simulate("change", {
            currentTarget: {
                value: "buck"
            }
        });

        let actual = wrapper.find('ul.govuk-list');
        expect(actual.length).toBe(1);
        expect(actual.children().length).toBe(1);
    });

     it(' returns the full list when the input is cleared', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData}/>);

        wrapper.find('input').simulate("change", {
            currentTarget: {
                value: ""
            }
        });

        let actual = wrapper.find('ul.govuk-list');
        expect(actual.length).toBe(1);
        expect(actual.children().length).toBe(validData.length);
    });

    it(' triggers a call back with empty value when the input is cleared', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData}/>);

        wrapper.find('input').simulate("change", {
            currentTarget: {
                value: ""
            }
        });

        expect(callbackFunction).toHaveBeenCalled();
    });

});