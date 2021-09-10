import { render, screen } from "@testing-library/react";
import React from "react";

import ProfilePatternSelector from "../../../components/Funding/ProfilePatternSelector";
import {
  AvailableVariationPointerFundingLine,
  Period,
} from "../../../types/Publishing/AvailableVariationPointerFundingLine";

const mockPointer: AvailableVariationPointerFundingLine = {
  fundingLineCode: "MOCK-001",
  fundingLineName: "MockPeriod",
  selectedPeriod: {
    periodType: "MockPeriodType",
    year: 2000,
    occurrence: 1,
    period: "MockPeriod",
  },
  periods: [],
};

const mockPeriods: Period[] = [
  {
    period: "January",
    year: 2020,
    periodType: "Calendar",
    occurrence: 1,
  },
  {
    period: "February",
    year: 2020,
    periodType: "Calendar",
    occurrence: 2,
  },
  {
    period: "March",
    year: 2020,
    periodType: "Calendar",
    occurrence: 3,
  },
];

describe("<ProfilePatternSelector ", () => {
  it("renders correctly", () => {
    render(
      <ProfilePatternSelector profilePatternList={mockPeriods} pointer={mockPointer} callback={false} />
    );

    expect(
      screen.getByRole("option", {
        name: "January 2020 Installment 1",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", {
        name: "February 2020 Installment 2",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", {
        name: "March 2020 Installment 3",
      })
    ).toBeInTheDocument();
  });
});
