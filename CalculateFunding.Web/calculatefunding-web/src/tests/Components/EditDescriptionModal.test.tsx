import React from 'react';
import { EditDescriptionModal } from "../../components/EditDescriptionModal";
import { mount } from 'enzyme';
import { waitFor } from "@testing-library/react";

it("is visible when showModal is true", () => {
    const originalDescription = "This is a description";
    const toggleModalMock = jest.fn();
    const saveDescriptionMock = jest.fn();

    const wrapper = mount(<EditDescriptionModal
        originalDescription={originalDescription}
        showModal={true}
        toggleModal={toggleModalMock}
        saveDescription={saveDescriptionMock} />);

    let actual = wrapper.find('#edit-desc-modal');

    expect(actual.prop('style')).toHaveProperty('display', 'block');
});

it("renders renders original description", () => {
    const originalDescription = "This is a description";
    const toggleModalMock = jest.fn();
    const saveDescriptionMock = jest.fn();

    const wrapper = mount(<EditDescriptionModal
        originalDescription={originalDescription}
        showModal={true}
        toggleModal={toggleModalMock}
        saveDescription={saveDescriptionMock} />);

    let actual = wrapper.find('#original-description');

    expect(actual.text()).toBe(originalDescription);
});

it("hides itself when showModal is false", () => {
    const originalDescription = "This is a description";
    const toggleModalMock = jest.fn();
    const saveDescriptionMock = jest.fn();

    const wrapper = mount(<EditDescriptionModal
        originalDescription={originalDescription}
        showModal={false}
        toggleModal={toggleModalMock}
        saveDescription={saveDescriptionMock} />);

    let actual = wrapper.find('#edit-desc-modal');

    expect(actual.prop('style')).toHaveProperty('display', 'none');
});

it("toggles modal visibility when closed button called", () => {
    const originalDescription = "This is a description";
    const toggleModalMock = jest.fn();
    const saveDescriptionMock = jest.fn();

    const wrapper = mount(<EditDescriptionModal
        originalDescription={originalDescription}
        showModal={true}
        toggleModal={toggleModalMock}
        saveDescription={saveDescriptionMock} />);

    let actual = wrapper.find('#close').simulate('click');

    expect(toggleModalMock).toHaveBeenCalledTimes(1);
});

it("toggles modal visibility when save button called", async () => {
    const originalDescription = "This is a description";
    const toggleModalMock = jest.fn();
    const saveDescriptionMock = jest.fn().mockResolvedValue(Promise.resolve(true));

    const wrapper = mount(<EditDescriptionModal
        originalDescription={originalDescription}
        showModal={true}
        toggleModal={toggleModalMock}
        saveDescription={saveDescriptionMock} />);

    wrapper.find('#save').simulate('click');

    await waitFor(() => {
        expect(saveDescriptionMock).toHaveBeenCalledTimes(1);
        expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
});