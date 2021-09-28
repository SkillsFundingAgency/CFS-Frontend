import { screen } from "@testing-library/react";

import { createDatasetTestSetup } from "./CreateDatasetTestData";

describe("<CreateDatasetFromUpload />", () => {
  describe("when page loads for FDZ provider source", () => {
    const mockHelper = createDatasetTestSetup();
    beforeEach(() => {
      jest.clearAllMocks();
      mockHelper.mockSpecificationHook();
      mockHelper.mockFundingConfigurationHook(
        mockHelper.mockFundingConfigurationQueryResult(mockHelper.mockFdzFundingConfiguration)
      );

      jest.mock("../../../services/datasetService", () => mockHelper.mockDatasetApi());

      mockHelper.renderCreateDatasetPage();
    });

    it("renders Specification name in breadcrumbs", async () => {
      expect(await screen.findByRole("link", { name: mockHelper.testSpec.name })).toHaveClass(
        "govuk-breadcrumbs__link"
      );
    });

    it("does not render loading spinner", async () => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("renders Specification name in the form heading", async () => {
      expect(await screen.findByRole("heading", { name: mockHelper.testSpec.name })).toBeInTheDocument();
    });

    it("does not render Set as provider data for FDZ", async () => {
      expect(await screen.queryByRole("heading", { name: /Set as provider data/ })).not.toBeInTheDocument();
    });

    it("renders data schema selections", async () => {
      expect(await screen.findByText(/Select data schema/)).toBeInTheDocument();
    });

    it("renders dataset name input", async () => {
      expect(await screen.findByText(/Data set name/)).toBeInTheDocument();
    });

    it("renders dataset description input", async () => {
      expect(await screen.findByText(/Description/)).toBeInTheDocument();
    });
  });
});
