import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const {
  hasNoJobObserverState,
  mockSpecificationPermissions,
    mockSpecificationService,
  mockFundingLineStructureService,
  mockDatasetBySpecificationIdService,
  mockCalculationService,
  mockPublishService,
  renderViewApprovedSpecificationPage,
} = ViewSpecificationTestData();
const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestHelper({});

describe("<ViewSpecification /> ", () => {
  describe("approving all calcs", () => {
    beforeEach(async () => {
      hasNoJobObserverState();
      haveNoJobNotification();
      setupJobSpy();
      mockSpecificationPermissions();
      mockSpecificationService();
      mockFundingLineStructureService();
      mockDatasetBySpecificationIdService();
      mockCalculationService();
      mockPublishService();
      await renderViewApprovedSpecificationPage();
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
