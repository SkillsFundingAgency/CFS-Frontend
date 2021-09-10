import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const testData = ViewSpecificationTestData();

describe("<ViewSpecification /> ", () => {
  describe("approving all calcs", () => {
    beforeEach(async () => {
      testData.hasNoJobObserverState();
      testData.mockSpecificationPermissions();
      testData.mockApprovedSpecificationService();
      testData.mockFundingLineStructureService();
      testData.mockDatasetBySpecificationIdService();
      testData.mockCalculationService();
      testData.mockPublishService();
      testData.haveNoJobNotification();
      await testData.renderViewApprovedSpecificationPage();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("shows error given all calculations already approved", async () => {
      const { getCalculationSummaryBySpecificationId } = require("../../../services/calculationService");
      const approveAllCalculationsButton = await screen.findByTestId("approve-calculations");
      userEvent.click(approveAllCalculationsButton);

      await waitFor(() => {
        expect(getCalculationSummaryBySpecificationId).toBeCalledTimes(2);
      });

      expect(screen.getByText("All calculations have already been approved")).toBeInTheDocument();
    });
  });
});
