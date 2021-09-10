import "@testing-library/jest-dom/extend-expect";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ProviderSearchBox, SearchFieldOption } from "../../../components/ProviderSearchBox";

const renderComponent = (searchField: SearchFieldOption = { isSelected: false }) => {
  const callback: (value: SearchFieldOption) => void = jest.fn();
  return { ...render(<ProviderSearchBox searchField={searchField} callback={callback} />), callback };
};

describe("<ProviderSearchBox />", () => {
  beforeAll(() => jest.clearAllMocks());

  describe("provider name field tests", () => {
    test("renders the provider name radio button", () => {
      renderComponent();

      const radioButton = screen.getByRole("radio", { name: /Provider name/ });

      expect(radioButton).toBeTruthy();
    });

    test("hides the provider name text box by default", () => {
      renderComponent();

      expect(screen.queryByRole("textbox", { name: /Provider name/ })).not.toBeInTheDocument();
    });

    describe("when clicking on the provider name radio button after different field enabled", () => {
      test("enables provider name option and clears search term", async () => {
        const someOtherField = "urn";
        const { callback } = renderComponent({
          searchField: someOtherField,
          searchTerm: "blah blah",
          isSelected: true,
        });

        const radioButton = screen.getByRole("radio", { name: /Provider name/ }) as HTMLInputElement;
        expect(radioButton).not.toBeChecked();
        expect(screen.queryByRole("textbox", { name: /provider name/ })).not.toBeInTheDocument();

        await userEvent.click(radioButton);

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "providerName", searchTerm: "" });
      });
    });

    describe("when provider name already selected", () => {
      test("renders the provider name text box", async () => {
        renderComponent({ searchField: "providerName", searchTerm: "346326", isSelected: true });

        const textbox = screen.getByRole("textbox", { name: /provider name/i }) as HTMLInputElement;

        expect(textbox).toHaveValue("346326");
      });
    });

    describe("when provider name already selected and user enters text", () => {
      test("raises correct callbacks as user enters provider name", async () => {
        const { callback } = renderComponent({
          searchField: "providerName",
          searchTerm: "",
          isSelected: true,
        });

        const textbox = screen.getByRole("textbox", { name: /Provider name/ }) as HTMLInputElement;

        await userEvent.type(textbox, "1234");

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "providerName", searchTerm: "1" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "providerName", searchTerm: "2" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "providerName", searchTerm: "3" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "providerName", searchTerm: "4" });
        expect(callback).toBeCalledTimes(4);
      });
    });

    describe("when provider name already selected with text and user clears text", () => {
      test("raises correct callbacks as user enters provider name", async () => {
        const { callback } = renderComponent({
          searchField: "providerName",
          searchTerm: "1234",
          isSelected: true,
        });

        const textbox = screen.getByRole("textbox", { name: /Provider name/ }) as HTMLInputElement;

        await userEvent.clear(textbox);

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "providerName", searchTerm: "" });
        expect(callback).toBeCalledTimes(1);
      });
    });
  });

  describe("UKPRN field tests", () => {
    test("renders the UKPRN radio button", () => {
      renderComponent();

      const radioButton = screen.getByRole("radio", { name: /UKPRN/i });

      expect(radioButton).toBeTruthy();
    });

    test("hides the UKPRN text box by default", () => {
      renderComponent();

      expect(screen.queryByRole("textbox", { name: /ukprn/ })).not.toBeInTheDocument();
    });

    describe("when clicking on the UKPRN radio button after different field enabled", () => {
      test("enables UKPRN option and clears search term", async () => {
        const someOtherField = "providerName";
        const { callback } = renderComponent({
          searchField: someOtherField,
          searchTerm: "blah blah",
          isSelected: true,
        });

        const radioButton = screen.getByRole("radio", { name: /UKPRN/i }) as HTMLInputElement;
        expect(radioButton).not.toBeChecked();
        expect(screen.queryByRole("textbox", { name: /UKPRN/i })).not.toBeInTheDocument();

        await userEvent.click(radioButton);

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "ukprn", searchTerm: "" });
      });
    });

    describe("when UKPRN already selected", () => {
      test("renders the UKPRN text box", async () => {
        renderComponent({ searchField: "ukprn", searchTerm: "346326", isSelected: true });

        const textbox = screen.getByRole("textbox", { name: /ukprn/i }) as HTMLInputElement;

        expect(textbox).toHaveValue("346326");
      });
    });

    describe("when UKPRN already selected and user enters text", () => {
      test("raises correct callbacks as user enters UKPRN", async () => {
        const { callback } = renderComponent({ searchField: "ukprn", searchTerm: "", isSelected: true });

        const textbox = screen.getByRole("textbox", { name: /ukprn/i }) as HTMLInputElement;

        await userEvent.type(textbox, "1234");

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "ukprn", searchTerm: "1" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "ukprn", searchTerm: "2" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "ukprn", searchTerm: "3" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "ukprn", searchTerm: "4" });
        expect(callback).toBeCalledTimes(4);
      });
    });
  });

  describe("UPIN field tests", () => {
    test("renders the UPIN radio button", () => {
      renderComponent();

      const radioButton = screen.getByRole("radio", { name: /UPIN/i });

      expect(radioButton).toBeTruthy();
    });

    test("hides the UPIN text box by default", () => {
      renderComponent();

      expect(screen.queryByRole("textbox", { name: /upin/ })).not.toBeInTheDocument();
    });

    describe("when clicking on the UPIN radio button after different field enabled", () => {
      test("enables UPIN option and clears search term", async () => {
        const someOtherField = "providerName";
        const { callback } = renderComponent({
          searchField: someOtherField,
          searchTerm: "blah blah",
          isSelected: true,
        });

        const radioButton = screen.getByRole("radio", { name: /UPIN/i }) as HTMLInputElement;
        expect(radioButton).not.toBeChecked();
        expect(screen.queryByRole("textbox", { name: /UPIN/i })).not.toBeInTheDocument();

        await userEvent.click(radioButton);

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "upin", searchTerm: "" });
      });
    });

    describe("when UPIN already selected", () => {
      test("renders the UPIN text box", async () => {
        renderComponent({ searchField: "upin", searchTerm: "346326", isSelected: true });

        const textbox = screen.getByRole("textbox", { name: /UPIN/i }) as HTMLInputElement;

        expect(textbox).toHaveValue("346326");
      });
    });

    describe("when UPIN already selected and user enters text", () => {
      test("raises correct callbacks as user enters UPIN", async () => {
        const { callback } = renderComponent({ searchField: "upin", searchTerm: "", isSelected: true });

        const textbox = screen.getByRole("textbox", { name: /UPIN/i }) as HTMLInputElement;

        await userEvent.type(textbox, "1234");

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "upin", searchTerm: "1" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "upin", searchTerm: "2" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "upin", searchTerm: "3" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "upin", searchTerm: "4" });
        expect(callback).toBeCalledTimes(4);
      });
    });
  });

  describe("URN field tests", () => {
    test("renders the URN radio button", () => {
      renderComponent();

      const radioButton = screen.getByRole("radio", { name: /URN/i });

      expect(radioButton).toBeTruthy();
    });

    test("hides the URN text box by default", () => {
      renderComponent();

      expect(screen.queryByRole("textbox", { name: /urn/ })).not.toBeInTheDocument();
    });

    describe("when clicking on the URN radio button after different field enabled", () => {
      test("enables URN option and clears search term", async () => {
        const someOtherField = "providerName";
        const { callback } = renderComponent({
          searchField: someOtherField,
          searchTerm: "blah blah",
          isSelected: true,
        });

        const radioButton = screen.getByRole("radio", { name: /URN/ }) as HTMLInputElement;
        expect(radioButton).not.toBeChecked();
        expect(screen.queryByRole("textbox", { name: /urn/ })).not.toBeInTheDocument();

        await userEvent.click(radioButton);

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "urn", searchTerm: "" });
      });
    });

    describe("when URN already selected", () => {
      test("renders the URN text box", async () => {
        renderComponent({ searchField: "urn", searchTerm: "346326", isSelected: true });

        const textbox = screen.getByRole("textbox", { name: /urn/i }) as HTMLInputElement;

        expect(textbox).toHaveValue("346326");
      });
    });

    describe("when URN already selected and user enters text", () => {
      test("raises correct callbacks as user enters URN", async () => {
        const { callback } = renderComponent({ searchField: "urn", searchTerm: "", isSelected: true });

        const textbox = screen.getByRole("textbox", { name: /urn/i }) as HTMLInputElement;

        await userEvent.type(textbox, "1234");

        expect(callback).toBeCalledWith({ isSelected: true, searchField: "urn", searchTerm: "1" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "urn", searchTerm: "2" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "urn", searchTerm: "3" });
        expect(callback).toBeCalledWith({ isSelected: true, searchField: "urn", searchTerm: "4" });
        expect(callback).toBeCalledTimes(4);
      });
    });
  });
});
