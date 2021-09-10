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
      testData.mockCalculationWithDraftCalculationsService();
      testData.mockPublishService();
      testData.hasNoLatestJob();
      testData.haveNoJobNotification();

      await testData.renderViewApprovedSpecificationPage();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("calls approve all calculations when calculations need approval", async () => {
      const { getCalculationSummaryBySpecificationId } = require("../../../services/calculationService");
      const approveAllCalculationsButton = await screen.findByTestId("approve-calculations");
      userEvent.click(approveAllCalculationsButton);

      const modalContinueButton = (await screen.findByTestId(
        "confirm-modal-continue-button"
      )) as HTMLButtonElement;
      userEvent.click(modalContinueButton);

      await waitFor(() => {
        expect(getCalculationSummaryBySpecificationId).toBeCalledTimes(2);
      });
    });
  });
});
