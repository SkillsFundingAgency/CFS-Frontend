import React from 'react';
import Pagination from "../../components/Pagination";
import {AccordionPanel} from "../../components/AccordionPanel";
import {Details} from "../../components/Details";
import {mount} from "enzyme";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

describe('<Details />', () => {
    it(' renders a panel', () => {
        const wrapper = mount(<Details body={"Test Body"} title="Test Title"/>);

        const actual = wrapper.find('.govuk-details');

        expect(actual.children().length).toBe(2);
    });

    it(' has the correct title', () => {
        const wrapper = mount(<Details body="Test Body" title="Test Title"/>);

        const actual = wrapper.find('.govuk-details__summary-text');

        expect(actual.text() === "Test Title").toBeTruthy();

    });

    it(' has the correct body text', () => {
        const wrapper = mount(<Details body="Test Body" title="Test Title"/>);

        const actual = wrapper.find('.govuk-details__text');

        expect(actual.contains("Test Body")).toBeTruthy();

    });
});
