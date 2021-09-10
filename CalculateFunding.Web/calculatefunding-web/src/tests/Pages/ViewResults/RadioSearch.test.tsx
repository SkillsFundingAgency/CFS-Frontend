import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { CharacterRestrictions } from "../../../types/CharacterRestrictions";

function renderComponent(characterRestrictions: CharacterRestrictions, maxChars?: number) {
  const { RadioSearch } = require("../../../Pages/ViewResults/RadioSearch");
  const mockCallback = jest.fn();
  render(
    <RadioSearch
      text={"Test text"}
      selectedSearchType={"name"}
      timeout={900}
      radioId={"name-id"}
      radioName={"radio-name"}
      searchType={"name"}
      minimumChars={2}
      callback={mockCallback}
      characterRestrictions={characterRestrictions}
      maximumChars={maxChars}
    />
  );
}

describe("<RadioSearch /> ", () => {
  describe("renders correctly", () => {
    it("with the radio input defined", async () => {
      renderComponent(CharacterRestrictions.AlphaNumeric);
      expect(screen.getByLabelText(/Test text/)).toBeDefined();
    });

    it("with the text input defined", async () => {
      renderComponent(CharacterRestrictions.AlphaNumeric);
      fireEvent.click(screen.getByLabelText(/Test text/));
      expect(screen.getByRole(/searchTerm/)).toBeDefined();
    });
  });

  describe("allows ", () => {
    it("a maximum of 5 characters", () => {
      renderComponent(CharacterRestrictions.AlphaNumeric, 5);
      screen.getByLabelText(/Test text/);
      fireEvent.click(screen.getByLabelText(/Test text/));
      const element = screen.getByRole(/searchTerm/) as HTMLInputElement;
      expect(element).toBeDefined();
      fireEvent.change(element, {
        target: {
          value: "12345",
        },
      });
      fireEvent.keyPress(element, {
        key: "6",
        keyCode: "Digit6",
      });
      expect(element.value).toBe("12345");
    });
  });

  describe("shows ", () => {
    it("an error when a numeric-only input has alpha text in it", async () => {
      renderComponent(CharacterRestrictions.NumericOnly, 3);

      const label = screen.getByLabelText(/Test text/);
      expect(label).toBeDefined();

      fireEvent.click(label);

      const element = screen.getByRole(/searchTerm/) as HTMLInputElement;
      expect(element).toBeDefined();

      fireEvent.change(element, {
        target: {
          value: "ABC",
        },
      });

      expect(element.value).toBe("ABC");
      expect(await screen.findByText(/Numeric characters only/)).toBeInTheDocument();
    });

    it("an error when alpha-only input has numeric text in it", async () => {
      renderComponent(CharacterRestrictions.AlphaOnly, 3);

      const label = screen.getByLabelText(/Test text/);
      expect(label).toBeInTheDocument();

      fireEvent.click(label);

      const element = screen.getByRole(/searchTerm/) as HTMLInputElement;
      expect(element).toBeDefined();

      fireEvent.change(element, {
        target: {
          value: "123",
        },
      });
      expect(element.value).toBe("123");
      expect(await screen.findByText(/Alpha characters only/)).toBeInTheDocument();
    });
  });
});
