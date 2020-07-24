import React from 'react';
import {CalculationResultsLink} from "../../../components/Calculations/CalculationResultsLink";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

describe('<CalculationResultsLink />', () => {
    it(' renders a link', () => {
        const wrapper = shallow(<CalculationResultsLink calculationId="1234" />);

        let actual = wrapper.find('Link');

        expect(actual.children().length).toBe(1);
    });
});