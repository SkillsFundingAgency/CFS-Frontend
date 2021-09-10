import { render, screen } from "@testing-library/react";
import React from "react";

import { CalculationErrors } from "../../../components/Calculations/CalculationErrors";

describe("<CalculationErrors /> ", () => {
  it("renders the tab H2 title correctly", () => {
    render(<CalculationErrors calculationErrors={[]} />);
    expect(screen.getByText(/Calculation errors/i));
  });

  it("should show the detail description", () => {
    render(<CalculationErrors calculationErrors={[]} />);
    expect(screen.getByText(/Errors found in calculations. Each error can contain many calculations./i));
  });
});
