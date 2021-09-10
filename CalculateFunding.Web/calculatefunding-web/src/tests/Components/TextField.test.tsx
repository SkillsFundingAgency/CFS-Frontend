import { render, screen, within } from "@testing-library/react";
import React from "react";

import { TextField, TextFieldProps } from "../../components/TextField";

const onChangeSpy = jest.fn();

describe("<TextField />", () => {
  beforeEach(() => {
    onChangeSpy.mockReset();
  });

  describe("when loaded normally", () => {
    const args: TextFieldProps = {
      onChange: onChangeSpy,
      errors: undefined,
      hint: "Maybe the name of your cat",
      isLoading: false,
      label: "Type something, anything",
      value: undefined,
      token: "token",
    };

    beforeEach(() => {
      render(<TextField {...args} />);
    });

    it("renders label", () => {
      expect(screen.getByText(args.label)).toBeInTheDocument();
    });

    it("renders hint", () => {
      expect(screen.getByText(args.hint as string)).toBeInTheDocument();
    });

    it("renders test id using token", () => {
      expect(screen.getByTestId(`text-${args.token}`)).toBeInTheDocument();
    });

    it("does not render loader", () => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("does not invoke change callback", () => {
      expect(onChangeSpy).toBeCalledTimes(0);
    });

    it("does show any errors", () => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("when errors passed through", () => {
    const args: TextFieldProps = {
      onChange: onChangeSpy,
      errors: [
        { id: 1, message: "Invalid value" },
        { id: 2, message: "Sort it out mate" },
      ],
      hint: "Maybe the name of your cat",
      isLoading: false,
      label: "Type something, anything",
      value: undefined,
      token: "token",
    };

    beforeEach(() => {
      render(<TextField {...args} />);
    });

    it("renders label", () => {
      expect(screen.getByText(args.label)).toBeInTheDocument();
    });

    it("renders hint", () => {
      expect(screen.getByText(args.hint as string)).toBeInTheDocument();
    });

    it("renders test id using token", () => {
      expect(screen.getByTestId(`text-${args.token}`)).toBeInTheDocument();
    });

    it("does not render loader", () => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("does not invoke change callback", () => {
      expect(onChangeSpy).toBeCalledTimes(0);
    });

    it("renders errors correctly", () => {
      expect(screen.getAllByRole("alert")).toHaveLength(2);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(/Invalid value/);
      expect(screen.getAllByRole("alert")[1]).toHaveTextContent(/Sort it out mate/);
    });
  });

  describe("when loading", () => {
    const args: TextFieldProps = {
      onChange: onChangeSpy,
      errors: undefined,
      hint: "Maybe the name of your cat",
      isLoading: true,
      label: "Type something, anything",
      value: undefined,
      token: "token",
    };

    beforeEach(() => {
      render(<TextField {...args} />);
    });

    it("renders label", () => {
      expect(screen.getByText(args.label)).toBeInTheDocument();
    });

    it("does not render hint", () => {
      expect(screen.queryByText(args.hint as string)).not.toBeInTheDocument();
    });

    it("does not render test id using token", () => {
      expect(screen.queryByTestId(`text-${args.token}`)).not.toBeInTheDocument();
    });

    it("renders loader", () => {
      expect(screen.getByTestId("loader-inline-" + args.token)).toBeInTheDocument();
    });

    it("does not invoke change callback", () => {
      expect(onChangeSpy).toBeCalledTimes(0);
    });

    it("renders loading text", () => {
      expect(screen.getAllByRole("alert")).toHaveLength(1);
      expect(within(screen.getAllByRole("alert")[0]).getByText(/Loading.../)).toBeInTheDocument();
    });
  });
});
