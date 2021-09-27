import { screen } from "@testing-library/react";
import * as redux from "react-redux";

import { FundingApprovalTestData } from "./FundingApprovalTestData";

const useSelectorSpy = jest.spyOn(redux, "useSelector");
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
  afterEach(() => jest.clearAllMocks());

  describe("when job is active", () => {
    beforeEach(async () => {
      useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
      test.hasSpecification();
      test.haveJobInProgressNotification();
      test.hasFundingConfigurationWithApproveAll();
      test.hasFullSpecPermissions();
      test.hasProvidersWithErrors([]);
      test.hasSearchResults([test.provider1]);

      await test.renderPage();
    });

    it("renders Specification details", async () => {
      expect(await screen.findByRole("heading", { name: test.testSpec.name })).toBeInTheDocument();
    });

    it("does not render error section", async () => {
      expect(screen.queryByRole("alert", { name: "job-notification" })).not.toBeInTheDocument();
    });

    it("renders job progress spinner", async () => {
      expect(await screen.findByTestId("loader")).toBeInTheDocument();
      expect(
        screen.getByText(/Job Refresh Funding job is in progress: Refreshing Funding/)
      ).toBeInTheDocument();
    });

    it("does not render filters", async () => {
      expect(screen.queryByRole("radio", { name: "Provider name" })).not.toBeInTheDocument();
    });

    it("does not render results", async () => {
      expect(screen.queryByTestId("published-provider-results")).not.toBeInTheDocument();
    });
  });
});
