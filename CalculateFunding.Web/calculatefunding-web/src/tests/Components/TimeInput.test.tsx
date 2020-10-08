import React from "react";
import {TimeInput} from "../../components/TimeInput";
import {mount} from "enzyme";

function mockCallback() {
    return false;
}

describe('Rendering the <TimeInput> component', () => {
    const wrapper = mount(<TimeInput time={"00:00"} callback={mockCallback} inputName={"TimeInputTest"}/>)

    it(' with the correct heading label', () => {
        expect(wrapper.find("label").at(0).text()).toEqual("Time");
    });

    it(' with the correct hour box label', () => {
        expect(wrapper.find("label").at(1).text()).toEqual("Hour");
    });

    it(' with the correct minute label', () => {
        expect(wrapper.find("label").at(2).text()).toEqual("Minute");
    });

    it(' with the correct input', () => {
        expect(wrapper.find("input#TimeInputTest")).toHaveLength(1);
    });
})
describe('Inputting into the <TimeInput> component', () => {
    const wrapper = mount(<TimeInput time={"00:00"} callback={mockCallback} inputName={"TimeInputTest"}/>);

    it(' does not show an error with the value is time valid', () => {
        const timeInput = wrapper.find('#TimeInputTest');
        timeInput.simulate('click');
        timeInput.simulate('change', {target: {value: "2"}});

        expect(wrapper.find(".govuk-form-group--error").length).toBe(0);
    });
});