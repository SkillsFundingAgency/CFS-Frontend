import "@testing-library/jest-dom/extend-expect";

import { screen } from "@testing-library/react";
import React from "react";
import * as redux from "react-redux";

import { FundingApprovalTestData } from "./FundingApprovalTestData";

const useSelectorSpy = jest.spyOn(redux, "useSelector");
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
  afterEach(() => jest.clearAllMocks());

  describe("when results with facets", () => {
    beforeEach(async () => {
      useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
      test.hasNoActiveJobsRunning();
      test.hasFullSpecPermissions();
      test.hasSpecification();
      test.hasFundingConfigurationWithApproveAll();
      test.hasProvidersWithErrors([]);
      test.hasSearchResults([test.provider1]);
      await test.loadPage();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("renders filters", async () => {
      expect(screen.getByRole("radio", { name: "Provider name" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "UKPRN" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "UPIN" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "URN" })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "With errors" })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Without errors" })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /East London/ })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /January 2000/ })).toBeInTheDocument();
    });

    it("renders month and year opened filters in correct order", async () => {
      const dates = screen.getAllByTestId("openDate") as HTMLLabelElement[];
      expect(dates[0].textContent).toBe("January 2000 (1)");
      expect(dates[1].textContent).toBe("June 2015 (1)");
      expect(dates[2].textContent).toBe("September 2016 (2)");
    });
  });
});
