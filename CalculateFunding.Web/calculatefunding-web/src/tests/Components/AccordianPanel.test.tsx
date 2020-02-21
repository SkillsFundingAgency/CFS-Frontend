import React from 'react';
import {AccordianPanel} from "../../components/AccordianPanel";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

describe('<AccordianPanel />', () => {
    it(' renders a panel', () => {
        const wrapper = shallow(<AccordianPanel autoExpand={true} id="testPanel" children={null}
                                                boldSubtitle="Bold Test Subtitle" expanded={false}
                                                subtitle="Test Subtitle" title="Test Title"/>);

        let actual = wrapper.find('#testPanel');

        expect(actual.children().length).toBe(1);
    });

    it(' has an auto expanded panel', () => {
        const wrapper = shallow(<AccordianPanel autoExpand={true} id="testPanel" children={null}
                                                boldSubtitle="Bold Test Subtitle" expanded={true}
                                                subtitle="Test Subtitle" title="Test Title"/>);

        let actual = wrapper.find('#testPanel');

        expect(actual.hasClass('govuk-accordion__section--expanded')).toBeTruthy();
    });

    it(' has a manually expanded panel', () => {
        const wrapper = shallow(<AccordianPanel autoExpand={false} id="testPanel" children={null}
                                                boldSubtitle="Bold Test Subtitle" expanded={true}
                                                subtitle="Test Subtitle" title="Test Title"/>);

        let actual = wrapper.find('#testPanel');

        expect(actual.hasClass('govuk-accordion__section--expanded')).toBeTruthy();

    });

    it(' has the correct title', () => {
        const wrapper = shallow(<AccordianPanel autoExpand={false} id="testPanel" children={null}
                                                boldSubtitle="Bold Test Subtitle" expanded={true}
                                                subtitle="Test Subtitle" title="Test Title"/>);

        let actual = wrapper.find('#accordion-default-heading-testPanel');

        expect(actual.text() === "Test Title").toBeTruthy();

    });

    it(' has the correct sub title', () => {
        const wrapper = shallow(<AccordianPanel autoExpand={false} id="testPanel" children={null}
                                                boldSubtitle="Bold Test Subtitle" expanded={true}
                                                subtitle="Test Subtitle" title="Test Title"/>);

        let actual = wrapper.find('p');

        expect(actual.contains("Test Subtitle")).toBeTruthy();

    });

    it(' has the correct bold sub title', () => {
        const wrapper = shallow(<AccordianPanel autoExpand={false} id="testPanel" children={null}
                                                boldSubtitle="Bold Test Subtitle" expanded={true}
                                                subtitle="Test Subtitle" title="Test Title"/>);

        let actual = wrapper.find('p');

        expect(actual.contains("Bold Test Subtitle")).toBeTruthy();

    });
});