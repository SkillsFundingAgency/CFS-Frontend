import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";

import { fireEvent, render } from "@testing-library/react";
import { shallow } from "enzyme";
import React from "react";

import { AutoComplete, AutoCompleteMode } from "../../components/AutoComplete";

const validData = [
  "Bedfordshire",
  "Hertfordshire",
  "Buckinghamshire",
  "Northamptonshire",
  "Norfolk",
  "Oxfordshire",
];

const northamptonshireId = "4";
const norfolkId = "5";

const validDataPrefixedIdMode = [
  "__1__Bedfordshire",
  "__2__Hertfordshire",
  "__3__Buckinghamshire",
  `__${northamptonshireId}__Northamptonshire`,
  `__${norfolkId}__Norfolk`,
  "__6__Oxfordshire",
];

const callbackFunction = jest.fn();

describe("<AutoComplete />", () => {
  afterEach(() => {
    callbackFunction.mockClear();
  });

  it("renders a panel", () => {
    const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

    const actual = wrapper.find("div.govuk-form-group");

    expect(actual.length).toBe(1);
  });

  it("shows the dropdown list", () => {
    const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

    wrapper.find("input").simulate("click", {
      currentTarget: {
        value: "",
      },
    });

    const actual = wrapper.find("ul.govuk-list");
    expect(actual.length).toBe(1);
    expect(actual.children().length).toBe(validData.length);
  });

  it("filters the dropdown list with data already entered", () => {
    const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

    wrapper.find("input").simulate("click", {
      currentTarget: {
        value: "Buckinghamshire",
      },
    });

    const actual = wrapper.find("ul.govuk-list");
    expect(actual.length).toBe(1);
    expect(actual.children().length).toBe(1);
  });

  it("filters the dropdown list on change", () => {
    const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

    wrapper.find("input").simulate("change", {
      currentTarget: {
        value: "nor",
      },
    });

    const actual = wrapper.find("ul.govuk-list");
    expect(actual.length).toBe(1);
    expect(actual.children().length).toBe(2);
  });

  it("returns the full list when the input is cleared", () => {
    const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

    wrapper.find("input").simulate("change", {
      currentTarget: {
        value: "nor",
      },
    });

    wrapper.find("input").simulate("change", {
      currentTarget: {
        value: "",
      },
    });

    const actual = wrapper.find("ul.govuk-list");
    expect(actual.length).toBe(1);
    expect(actual.children().length).toBe(validData.length);
  });

  it("triggers a call back with empty value when the input is cleared", () => {
    const wrapper = shallow(<AutoComplete callback={callbackFunction} suggestions={validData} />);

    wrapper.find("input").simulate("change", {
      currentTarget: {
        value: "nor",
      },
    });

    wrapper.find("input").simulate("change", {
      currentTarget: {
        value: "",
      },
    });

    expect(callbackFunction).toHaveBeenCalledTimes(1);
    expect(callbackFunction).toHaveBeenLastCalledWith("");
  });

  it("triggers a call back with id value when mode is PrefixedId", () => {
    const { getByRole, getByTestId } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Norfolk" } });
    fireEvent.click(getByTestId(norfolkId), { target: { innerText: "Norfolk" } });

    expect(callbackFunction).toHaveBeenCalledTimes(1);
    expect(callbackFunction).toHaveBeenLastCalledWith(norfolkId);
  });

  it("triggers a call back with value when mode is Standard", () => {
    const { getByRole, getByTestId } = render(
      <AutoComplete callback={callbackFunction} suggestions={validData} />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Norfolk" } });
    fireEvent.click(getByTestId("Norfolk"), { target: { innerText: "Norfolk" } });

    expect(callbackFunction).toHaveBeenCalledTimes(1);
    expect(callbackFunction).toHaveBeenLastCalledWith("Norfolk");
  });

  it("hides suggestions after suggestion is clicked", () => {
    const { getByRole, getByTestId, queryByTestId } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Nor" } });
    expect(getByTestId(northamptonshireId)).toBeInTheDocument();
    expect(getByTestId(norfolkId)).toBeInTheDocument();
    fireEvent.click(getByTestId(norfolkId), { target: { innerText: "Norfolk" } });

    expect(queryByTestId(northamptonshireId)).not.toBeInTheDocument();
    expect(getByRole("textbox")).toHaveValue("Norfolk");
  });

  it("renders search label and pager when includePager is true", () => {
    const { getByRole, getByText } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        includePager={true}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Norfolk" } });

    expect(getByText("Search")).toBeInTheDocument();
    expect(getByText("1 of 1")).toBeInTheDocument();
  });

  it("does not render pager when includePager is true until user enters value", () => {
    const { queryByTestId } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        includePager={true}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    expect(queryByTestId("forward")).not.toBeInTheDocument();
    expect(queryByTestId("back")).not.toBeInTheDocument();
  });

  it("triggers a call back with correct id value when pager is rendered and user clicks forward", () => {
    const { getByRole, getByTestId, getByText } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        includePager={true}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Nor" } });
    fireEvent.click(getByTestId("forward"));

    expect(getByText("2 of 2")).toBeInTheDocument();
    expect(callbackFunction).toHaveBeenCalledTimes(1);
    expect(callbackFunction).toHaveBeenLastCalledWith(norfolkId);
  });

  it("triggers a call back with correct id value when pager is rendered and user clicks back", () => {
    const { getByRole, getByTestId, getByText } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        includePager={true}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Nor" } });
    fireEvent.click(getByTestId("forward"));
    fireEvent.click(getByTestId("back"));

    expect(getByText("1 of 2")).toBeInTheDocument();
    expect(callbackFunction).toHaveBeenCalledTimes(2);
    expect(callbackFunction).toHaveBeenLastCalledWith(northamptonshireId);
  });

  it("does not trigger a call back when pager is on page 1 and user clicks back", () => {
    const { getByRole, getByTestId, getByText } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        includePager={true}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Nor" } });

    expect(getByText("1 of 2")).toBeInTheDocument();

    fireEvent.click(getByTestId("back"));

    expect(callbackFunction).not.toHaveBeenCalled();
  });

  it("does not trigger a call back when pager is on last page and user clicks forward", () => {
    const { getByRole, getByTestId, getByText } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        includePager={true}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Nor" } });

    expect(getByText("1 of 2")).toBeInTheDocument();
    fireEvent.click(getByTestId("forward"));
    expect(getByText("2 of 2")).toBeInTheDocument();
    fireEvent.click(getByTestId("forward"));

    expect(callbackFunction).toHaveBeenCalledTimes(1);
  });

  it("resets pager after suggestion is clicked", () => {
    const { getByRole, getByTestId, getByText } = render(
      <AutoComplete
        callback={callbackFunction}
        suggestions={validDataPrefixedIdMode}
        includePager={true}
        mode={AutoCompleteMode.PrefixedId}
      />
    );

    fireEvent.change(getByRole("textbox"), { target: { value: "Nor" } });
    expect(getByText("1 of 2")).toBeInTheDocument();
    fireEvent.click(getByTestId(norfolkId), { target: { innerText: "Norfolk" } });

    expect(getByText("1 of 1")).toBeInTheDocument();
  });
});
