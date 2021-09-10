import { mount } from "enzyme";
import React from "react";

import { TagEditor } from "../../components/TagEditor";

// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, "error").mockImplementation(() => jest.fn());

describe("<TagEditor />", () => {
  it("renders specified tags without showing error message", async () => {
    const wrapper = mount(
      <TagEditor
        allowDuplicates={false}
        tagValuesCsv={"Option1,Option2,Option2"}
        label="test"
        onAddNewValue={jest.fn()}
        onRemoveValue={jest.fn()}
      />
    );

    const tags = wrapper.find("[data-testid='tag']");

    expect(tags).toHaveLength(3);
    expect(wrapper.find(".govuk-label")).toHaveLength(1);
    expect(wrapper.find("[data-testid='add-tag-button']")).toHaveLength(1);
    expect(wrapper.find("#tag-error")).toHaveLength(0);
  });

  it("renders custom error message when specified", async () => {
    const wrapper = mount(
      <TagEditor
        allowDuplicates={false}
        tagValuesCsv={"Option1,Option2,Option2"}
        label="test"
        showErrorMessageOnRender={"There is an error"}
        onAddNewValue={jest.fn()}
        onRemoveValue={jest.fn()}
      />
    );

    const tags = wrapper.find("[data-testid='tag']");

    expect(tags).toHaveLength(3);
    expect(wrapper.find(".govuk-label")).toHaveLength(1);
    expect(wrapper.find("[data-testid='add-tag-button']")).toHaveLength(1);
    expect(wrapper.find("#tag-error").text()).toEqual("Error: There is an error");
  });

  it("clicking on a tag calls remove callback", async () => {
    const mockRemoveValue = jest.fn();
    const wrapper = mount(
      <TagEditor
        allowDuplicates={false}
        tagValuesCsv={"Option1,Option2"}
        label="test"
        onAddNewValue={jest.fn()}
        onRemoveValue={mockRemoveValue}
      />
    );

    const tags = wrapper.find("[data-testid='tag']");

    expect(tags).toHaveLength(2);

    wrapper.find("[data-testid='tag']").first().simulate("click");

    expect(wrapper.find("#tag-error")).toHaveLength(0);
    expect(mockRemoveValue).toBeCalledTimes(1);
  });

  it("add new tag calls add callback", async () => {
    const mockAddNewValue = jest.fn();
    const wrapper = mount(
      <TagEditor
        allowDuplicates={false}
        tagValuesCsv={""}
        label="test"
        onAddNewValue={mockAddNewValue}
        onRemoveValue={jest.fn()}
      />
    );

    const tags = wrapper.find("[data-testid='tag']");

    expect(tags).toHaveLength(0);

    wrapper.find("#add-tag").simulate("change", { target: { value: "Option1" } });
    wrapper.find("[data-testid='add-tag-button']").simulate("click");

    expect(mockAddNewValue).toBeCalledTimes(1);
  });

  it("ignores empty input when trying to add new tag", async () => {
    const mockAddNewValue = jest.fn();
    const wrapper = mount(
      <TagEditor
        allowDuplicates={false}
        tagValuesCsv={""}
        label="test"
        onAddNewValue={mockAddNewValue}
        onRemoveValue={jest.fn()}
      />
    );

    const tags = wrapper.find("[data-testid='tag']");

    expect(tags).toHaveLength(0);

    wrapper.find("#add-tag").simulate("change", { target: { value: "" } });
    wrapper.find("[data-testid='add-tag-button']").simulate("click");

    expect(mockAddNewValue).toBeCalledTimes(0);
  });

  it("shows error message when trying to add a duplicate and duplicates set to not allowed", async () => {
    const mockAddNewValue = jest.fn();
    const wrapper = mount(
      <TagEditor
        allowDuplicates={false}
        tagValuesCsv={"Option1"}
        label="test"
        duplicateErrorMessage={"No duplicates allowed"}
        onAddNewValue={mockAddNewValue}
        onRemoveValue={jest.fn()}
      />
    );

    const tags = wrapper.find("[data-testid='tag']");

    expect(tags).toHaveLength(1);

    wrapper.find("#add-tag").simulate("change", { target: { value: "Option1" } });
    wrapper.find("[data-testid='add-tag-button']").simulate("click");

    expect(wrapper.find("#tag-error")).toHaveLength(1);
    expect(wrapper.find("#tag-error").text()).toEqual("Error: No duplicates allowed");
    expect(mockAddNewValue).toBeCalledTimes(0);
  });

  it("shows default error message when trying to add a duplicate and duplicates set to not allowed", async () => {
    const mockAddNewValue = jest.fn();
    const wrapper = mount(
      <TagEditor
        allowDuplicates={false}
        tagValuesCsv={"Option1"}
        label="test"
        onAddNewValue={mockAddNewValue}
        onRemoveValue={jest.fn()}
      />
    );

    const tags = wrapper.find("[data-testid='tag']");

    expect(tags).toHaveLength(1);

    wrapper.find("#add-tag").simulate("change", { target: { value: "Option1" } });
    wrapper.find("[data-testid='add-tag-button']").simulate("click");

    expect(wrapper.find("#tag-error")).toHaveLength(1);
    expect(wrapper.find("#tag-error").text()).toEqual("Error: You cannot add the same tag twice");
    expect(mockAddNewValue).toBeCalledTimes(0);
  });

  it("does not show error message when trying to add a duplicate and duplicates are allowed", async () => {
    const mockAddNewValue = jest.fn();
    const wrapper = mount(
      <TagEditor
        allowDuplicates={true}
        tagValuesCsv={"Option1"}
        label="test"
        onAddNewValue={mockAddNewValue}
        onRemoveValue={jest.fn()}
      />
    );

    const tags = wrapper.find("[data-testid='tag']");

    expect(tags).toHaveLength(1);

    wrapper.find("#add-tag").simulate("change", { target: { value: "Option1" } });
    wrapper.find("[data-testid='add-tag-button']").simulate("click");

    expect(wrapper.find("#tag-error")).toHaveLength(0);
    expect(mockAddNewValue).toBeCalledTimes(1);
  });
});
