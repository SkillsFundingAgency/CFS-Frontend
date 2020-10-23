import React from 'react';
import {AutoComplete, AutoCompleteMode} from "../../components/AutoComplete";
import {shallow} from 'enzyme';
import {fireEvent, render} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

const validData = [
    "Bedfordshire",
    "Hertfordshire",
    "Buckinghamshire",
    "Northamptonshire",
    "Norfolk",
    "Oxfordshire"
];

const validDataPrefixedIdMode = [
    "__1__Bedfordshire",
    "__2__Hertfordshire",
    "__3__Buckinghamshire",
    "__4__Northamptonshire",
    "__5__Norfolk",
    "__6__Oxfordshire"
];

const callbackFunction = jest.fn();

describe('<AutoComplete />', () => {
    afterEach(() => {
        callbackFunction.mockClear();
    });

    it('renders a panel', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

        let actual = wrapper.find('div.govuk-form-group');

        expect(actual.length).toBe(1);
    });

    it('shows the dropdown list', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

        wrapper.find('input').simulate("click", {
            currentTarget: {
                value: ""
            }
        });

        let actual = wrapper.find('ul.govuk-list');
        expect(actual.length).toBe(1);
        expect(actual.children().length).toBe(validData.length);
    });

    it('filters the dropdown list with data already entered', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

        wrapper.find('input').simulate("click", {
            currentTarget: {
                value: "Buckinghamshire"
            }
        });

        let actual = wrapper.find('ul.govuk-list');
        expect(actual.length).toBe(1);
        expect(actual.children().length).toBe(1);
    });

    it('filters the dropdown list on change', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

        wrapper.find('input').simulate("change", {
            currentTarget: {
                value: "nor"
            }
        });

        let actual = wrapper.find('ul.govuk-list');
        expect(actual.length).toBe(1);
        expect(actual.children().length).toBe(2);
    });

    it('returns the full list when the input is cleared', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

        wrapper.find('input').simulate("change", {
            currentTarget: {
                value: "nor"
            }
        });

        wrapper.find('input').simulate("change", {
            currentTarget: {
                value: ""
            }
        });

        let actual = wrapper.find('ul.govuk-list');
        expect(actual.length).toBe(1);
        expect(actual.children().length).toBe(validData.length);
    });

    it('triggers a call back with empty value when the input is cleared', () => {
        const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

        wrapper.find('input').simulate("change", {
            currentTarget: {
                value: "nor"
            }
        });

        wrapper.find('input').simulate("change", {
            currentTarget: {
                value: ""
            }
        });

        expect(callbackFunction).toHaveBeenCalledTimes(1);
        expect(callbackFunction).toHaveBeenLastCalledWith("");
    });

    it('triggers a call back with id value when mode is PrefixedId', () => {
        const {getByRole, getByTestId} = render(<AutoComplete callback={callbackFunction} suggestions={validDataPrefixedIdMode}
            mode={AutoCompleteMode.PrefixedId} />);

        fireEvent.change(getByRole('textbox'), {target: {value: 'Norfolk'}});
        fireEvent.click(getByTestId("5"), {target: {innerText: 'Norfolk'}});

        expect(callbackFunction).toHaveBeenCalledTimes(1);
        expect(callbackFunction).toHaveBeenLastCalledWith("5");
    });

    it('triggers a call back with value when mode is Standard', () => {
        const {getByRole, getByTestId} = render(<AutoComplete callback={callbackFunction} suggestions={validData} />);

        fireEvent.change(getByRole('textbox'), {target: {value: 'Norfolk'}});
        fireEvent.click(getByTestId("Norfolk"), {target: {innerText: 'Norfolk'}});

        expect(callbackFunction).toHaveBeenCalledTimes(1);
        expect(callbackFunction).toHaveBeenLastCalledWith("Norfolk");
    });
});