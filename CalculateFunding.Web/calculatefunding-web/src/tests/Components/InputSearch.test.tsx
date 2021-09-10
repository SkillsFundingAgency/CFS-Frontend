import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";

import { waitFor } from "@testing-library/dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { InputSearch } from "../../components/InputSearch";

const validData = [
  "Bedfordshire",
  "Hertfordshire",
  "Buckinghamshire",
  "Northamptonshire",
  "Norfolk",
  "Oxfordshire",
];

const callbackFunction = jest.fn();
const inputId = "test-id";

function renderComponent() {
  return render(<InputSearch id={inputId} callback={callbackFunction} suggestions={validData} />);
}

describe("<InputSearch />", () => {
  afterEach(() => {
    callbackFunction.mockClear();
  });

  it("renders the input element", () => {
    const { container } = renderComponent();

    expect(container.querySelector(`input#${inputId}`)).toBeInTheDocument();
  });

  it("renders the dropdown list", async () => {
    const { container } = renderComponent();

    await waitFor(() => expect(container.querySelector("datalist")).toBeInTheDocument());
  });

  it("fires the callback when selecting something from the dropdown list", async () => {
    renderComponent();
    const actual = await screen.findByRole(`${inputId}-input-search`);

    act(() => {
      fireEvent.change(actual, { target: { value: "Buckinghamshire" } });
    });

    await waitFor(() => expect(callbackFunction).toHaveBeenCalledTimes(1));
  });
});
