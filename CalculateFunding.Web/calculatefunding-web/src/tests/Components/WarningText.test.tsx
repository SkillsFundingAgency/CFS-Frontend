import React from 'react';
import {WarningText} from "../../components/WarningText";
import {mount} from "enzyme";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

describe('<WarningText />', () => {
    it(' renders a panel', () => {
        const wrapper = shallow(<WarningText text={"Testing Component"} />);

        const actual = wrapper.find('div.govuk-warning-text');

        expect(actual.length).toBe(1);
    });

    it(' is hidden', () => {
        const wrapper = mount(<WarningText text={"Testing Component"} hidden={true}/>);

        const actual = wrapper.find('div.govuk-warning-text');

        expect(actual.props().hidden).toBeTruthy();
    });

    it(' is visible', () => {
        const wrapper = mount(<WarningText text={"Testing Component"} hidden={false}/>);

        const actual = wrapper.find('div.govuk-warning-text');

        expect(actual.props().hidden).toBeFalsy();
    });

    it(' has the correct text', () => {
        const wrapper = mount(<WarningText text={"Testing Component"} hidden={false}/>);

        const actual = wrapper.find('strong.govuk-warning-text__text>span').at(1);

        expect(actual.text()).toBe("Testing Component");
    });
});