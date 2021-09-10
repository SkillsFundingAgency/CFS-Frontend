import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";

import { render, screen, within } from "@testing-library/react";
import React from "react";

import { SelectionField, SelectionFieldOption, SelectionFieldProps } from "../../components/SelectionField";

const onSelectionSpy = jest.fn();

describe("<SelectionField />", () => {
  beforeEach(() => {
    onSelectionSpy.mockReset();
  });

  describe("when loaded normally", () => {
    const options: SelectionFieldOption[] = [
      { id: "id1", displayValue: "option 1" },
      { id: "id2", displayValue: "option 2" },
    ];
    const args: SelectionFieldProps = {
      changeSelection: onSelectionSpy,
      errors: undefined,
      hint: "Hint... read the label",
      isLoading: false,
      label: "Select an option",
      options: options,
      selectedValue: undefined,
      token: "token",
    };

    beforeEach(() => {
      render(<SelectionField {...args} />);
    });

    it("renders label", () => {
      expect(screen.getByText(args.label)).toBeInTheDocument();
    });

    it("renders hint", () => {
      expect(screen.getByText(args.hint as string)).toBeInTheDocument();
    });

    it("renders test id using token", () => {
      expect(screen.getByTestId(`select-${args.token}`)).toBeInTheDocument();
    });

    it("does not render loader", () => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("does not invoke change callback", () => {
      expect(onSelectionSpy).toBeCalledTimes(0);
    });

    it("does show any errors", () => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("when errors passed through", () => {
    const options: SelectionFieldOption[] = [
      { id: "id1", displayValue: "option 1" },
      { id: "id2", displayValue: "option 2" },
    ];
    const args: SelectionFieldProps = {
      changeSelection: onSelectionSpy,
      errors: [
        { id: 1, message: "Invalid selection" },
        { id: 2, message: "Sort it out mate" },
      ],
      hint: "Hint... read the label",
      isLoading: false,
      label: "Select an option",
      options: options,
      selectedValue: undefined,
      token: "token",
    };

    beforeEach(() => {
      render(<SelectionField {...args} />);
    });

    it("renders label", () => {
      expect(screen.getByText(args.label)).toBeInTheDocument();
    });

    it("renders hint", () => {
      expect(screen.getByText(args.hint as string)).toBeInTheDocument();
    });

    it("renders test id using token", () => {
      expect(screen.getByTestId(`select-${args.token}`)).toBeInTheDocument();
    });

    it("does not render loader", () => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("does not invoke change callback", () => {
      expect(onSelectionSpy).toBeCalledTimes(0);
    });

    it("renders errors correctly", () => {
      expect(screen.getAllByRole("alert")).toHaveLength(2);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(/Invalid selection/);
      expect(screen.getAllByRole("alert")[1]).toHaveTextContent(/Sort it out mate/);
    });
  });

  describe("when loading", () => {
    const args: SelectionFieldProps = {
      changeSelection: onSelectionSpy,
      errors: [],
      hint: "Hint... read the label",
      isLoading: true,
      label: "Select an option",
      options: undefined,
      selectedValue: undefined,
      token: "token",
    };

    beforeEach(() => {
      render(<SelectionField {...args} />);
    });

    it("renders label", () => {
      expect(screen.getByText(args.label)).toBeInTheDocument();
    });

    it("does not render hint", () => {
      expect(screen.queryByText(args.hint as string)).not.toBeInTheDocument();
    });

    it("does not render test id using token", () => {
      expect(screen.queryByTestId(`select-${args.token}`)).not.toBeInTheDocument();
    });

    it("renders loader", () => {
      expect(screen.getByTestId("loader-inline-" + args.token)).toBeInTheDocument();
    });

    it("does not invoke change callback", () => {
      expect(onSelectionSpy).toBeCalledTimes(0);
    });

    it("renders loading text", () => {
      expect(screen.getAllByRole("alert")).toHaveLength(1);
      expect(within(screen.getAllByRole("alert")[0]).getByText(/Loading.../)).toBeInTheDocument();
    });
  });
});
