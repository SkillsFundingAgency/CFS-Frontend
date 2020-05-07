import React from 'react';
import {mount} from "enzyme";
import {BackToTop} from "../../components/BackToTop";
import {WarningText} from "../../components/WarningText";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

describe('<BackToTop />', () => {
    it(' renders a panel', () => {
        const wrapper = mount(<BackToTop id={"testId"}/>);

        let actual = wrapper.find('.app-back-to-top');

        expect(actual.children().length).toBe(1);
    });

    it(' has the correct href', () => {
        const wrapper = mount(<BackToTop id={"testId"}/>);

        let actual = wrapper.find('a');

        expect(actual.prop("href")).toBe("#testId");

    });

    it(' has the correct body text', () => {
        const wrapper = mount(<BackToTop id={"testId"}/>);

        let actual = wrapper.find('a');

        expect(actual.text()).toBe("Back to top");

    });

    it(' has the correct body text', () => {
        const wrapper = mount(<BackToTop id={"testId"}/>);

        let actual = wrapper.find('a');

        expect(actual.text()).toBe("Back to top");

    });

    it(' is hidden', () => {
        const wrapper = mount(<BackToTop id={"testId"} hidden={true}/>);

        let actual = wrapper.find('.app-back-to-top');

        expect(actual.props().hidden).toBeTruthy();
    });

    it(' is visible', () => {
        const wrapper = mount(<BackToTop id={"testId"} hidden={false}/>);

        let actual = wrapper.find('.app-back-to-top');

        expect(actual.props().hidden).toBeFalsy();
    });

    it(' is visible when hidden is not used', () => {
        const wrapper = mount(<BackToTop id={"testId"} />);

        let actual = wrapper.find('.app-back-to-top');

        expect(actual.props().hidden).toBeFalsy();
    });

});