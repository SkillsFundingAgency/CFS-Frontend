import React from 'react';
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import {ErrorSummary} from "../../components/ErrorSummary";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

describe('<ErrorSummary />', () => {
    it(' renders a panel', () => {
        const wrapper = shallow(<ErrorSummary title="Test title" error="Error message"
                                              suggestion="Suggestion to user"/>);

        const actual = wrapper.find('div.govuk-error-summary');

        expect(actual.children().length).toBe(2);
    });

    it(' hides the error summary when no title is provided', () => {
        const wrapper = shallow(<ErrorSummary title="" error="Error message"
                                              suggestion="Suggestion to user"/>);

        const actual = wrapper.find('div.govuk-error-summary');

        expect(actual.props('hidden')).toBeTruthy();
    });
});