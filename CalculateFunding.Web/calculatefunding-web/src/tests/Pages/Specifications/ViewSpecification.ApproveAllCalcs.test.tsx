import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { featureFlagsTestHelper,jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const {
  hasNoJobObserverState,
  mockSpecificationPermissions,
  mockApprovedSpecificationService,
    mockSpecificationService,
  mockFundingLineStructureService,
  mockDatasetBySpecificationIdService,
  mockCalculationWithDraftCalculationsService,
  mockPublishService,
  renderViewApprovedSpecificationPage,
} = ViewSpecificationTestData();
const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestHelper({});
const { setupFeatureFlags } = featureFlagsTestHelper();
describe("<ViewSpecification /> ", () => {
  describe("approving all calcs", () => {
    beforeEach(async () => {
      haveNoJobNotification();
      setupJobSpy();
      setupFeatureFlags(false, false, false, false, false, true);
      hasNoJobObserverState();
      mockSpecificationPermissions();
      mockSpecificationService();
      mockFundingLineStructureService();
      mockDatasetBySpecificationIdService();
      mockCalculationWithDraftCalculationsService();
      mockPublishService();

      await renderViewApprovedSpecificationPage();
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
