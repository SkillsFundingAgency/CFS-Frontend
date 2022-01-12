import { screen } from "@testing-library/react";
import * as redux from "react-redux";

import { FundingApprovalTestData } from "./FundingApprovalTestData";

const useSelectorSpy = jest.spyOn(redux, "useSelector");
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
  afterEach(() => jest.clearAllMocks());

  describe("when job has failed", () => {
    beforeEach(async () => {
      useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
      test.haveFailedJobNotification();
      test.hasSpecification();
      test.hasFundingConfigurationWithApproveAll();
      test.hasFullSpecPermissions();
      test.hasProvidersWithErrors([]);
      test.hasSearchResults([test.provider1]);

      await test.loadPage();
    });

    it("renders Specification details", async () => {
      expect(screen.getByTestId("specName")).toBeInTheDocument();
    });

    it("does not render loading spinner", async () => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("renders error section", async () => {
      expect(await screen.findByTestId("job-notification-banner")).toBeInTheDocument();
    });

    it("renders job error", async () => {
      expect(await screen.findByTestId("job-notification-banner")).toBeInTheDocument();
      expect(screen.getByText(/Job Refreshing funding: Refresh failed/)).toBeInTheDocument();
    });

    it("renders filters", async () => {
      expect(screen.getByRole("radio", { name: "Provider name" })).toBeInTheDocument();
    });

    it("renders results", async () => {
      expect(screen.getByTestId("published-provider-results")).toBeInTheDocument();
    });

    it("renders refresh button", async () => {
      const buttons = screen.getAllByRole("button", { name: /Refresh funding/ });
      expect(buttons).toHaveLength(2);
    });
  });
});
