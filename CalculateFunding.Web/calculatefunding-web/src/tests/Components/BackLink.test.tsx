﻿import "@testing-library/jest-dom/extend-expect";

import { waitFor } from "@testing-library/dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Switch } from "react-router";

import { BackLink, BackLinkProps } from "../../components/BackLink";

const renderComponent = (props: BackLinkProps) => {
  return render(
    <MemoryRouter initialEntries={["/Something"]}>
      <Switch>
        <Route path="/Something">
          <BackLink {...props} />
        </Route>
      </Switch>
    </MemoryRouter>
  );
};
const mockHistoryBack = jest.fn();
const mockHistoryPush = jest.fn();
const mockCallback = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    goBack: mockHistoryBack,
    push: mockHistoryPush,
  }),
}));

describe("<BackLink />", () => {
  describe("with just a to address", () => {
    it("renders correctly", async () => {
      const inputs: BackLinkProps = {
        to: "/test/blah",
      };
      renderComponent(inputs);

      const link = screen.getByRole("link", { name: /Back/i }) as HTMLAnchorElement;

      expect(link).toBeInTheDocument();
      expect(link).toHaveClass("govuk-back-link");

      userEvent.click(link);

      expect(mockHistoryBack).not.toBeCalled();
      expect(mockHistoryPush).toBeCalled();
    });
  });

  describe("when there is a to address and user clicks", () => {
    it("click event handled correctly", () => {
      const inputs: BackLinkProps = {
        to: "/test/blah",
      };
      renderComponent(inputs);

      const link = screen.getByRole("link", { name: /Back/i }) as HTMLAnchorElement;

      expect(link).toBeInTheDocument();
      expect(link).toHaveClass("govuk-back-link");
      userEvent.click(link);
      expect(mockHistoryPush).toBeCalled();
    });
  });

  describe("when there is a callback and user clicks", () => {
    it("click event handled correctly", () => {
      const inputs: BackLinkProps = {
        handleOnClick: mockCallback,
      };
      renderComponent(inputs);

      const link = screen.getByRole("link", { name: /Back/i }) as HTMLAnchorElement;

      expect(link).toBeInTheDocument();
      expect(link).toHaveClass("govuk-back-link");
      userEvent.click(link);
      expect(mockCallback).toBeCalled();
    });
  });

  describe("with extra class name", () => {
    it("renders correctly", () => {
      const inputs: BackLinkProps = {
        to: "/test/blah",
        className: "govuk-whatever",
      };
      renderComponent(inputs);

      const link = screen.getByRole("link", { name: /Back/i }) as HTMLAnchorElement;

      expect(link).toHaveClass("govuk-back-link");
      expect(link).toHaveClass("govuk-whatever");
    });
  });

  describe("with children", () => {
    it("renders child node instead of Back", () => {
      const inputs: BackLinkProps = {
        to: "/test/blah",
        children: <span>hello test</span>,
      };
      renderComponent(inputs);

      expect(screen.queryByRole("link", { name: /Back/i })).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: /hello test/i })).toBeInTheDocument();
    });
  });

  describe("with undefined to address", () => {
    it("click goes back", async () => {
      const inputs: BackLinkProps = {
        to: undefined,
      };
      renderComponent(inputs);

      const link = screen.getByRole("link", { name: /Back/i }) as HTMLAnchorElement;

      userEvent.click(link);

      await waitFor(() => expect(mockHistoryBack).toHaveBeenCalled());
    });
  });
});
