import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JobNotification } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

describe("<ViewSpecification /> ", () => {
  const {
    hasNoJobObserverState,
    mockSpecificationPermissions,
    mockApprovedSpecificationService,
    mockFundingLineStructureService,
    mockDatasetBySpecificationIdService,
    mockCalculationService,
    mockPublishService,
    fundingConfigurationSpy,
    hasNoCalcErrors,
    renderViewApprovedSpecificationPage,
  } = ViewSpecificationTestData();
  const { haveFailedJobNotification, haveNoJobNotification, setupJobSpy, getNotificationCallback } =
    jobSubscriptionTestHelper({});

  describe("choosing approved specification for funding ", () => {
    let notification: JobNotification;

    beforeEach(async () => {
      haveNoJobNotification();
      hasNoJobObserverState();
      setupJobSpy();

      mockSpecificationPermissions();
      mockApprovedSpecificationService();
      mockFundingLineStructureService();
      mockDatasetBySpecificationIdService();
      mockCalculationService();
      mockPublishService();
      fundingConfigurationSpy();
      hasNoCalcErrors();

      await renderViewApprovedSpecificationPage();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("shows error when refresh job fails", async () => {
      const { refreshSpecificationFundingService } = require("../../../services/publishService");
      const chooseForFundingButton = await screen.findByTestId("choose-for-funding");
      userEvent.click(chooseForFundingButton);

      const modalContinueButton = (await screen.findByTestId(
        "confirm-modal-continue-button"
      )) as HTMLButtonElement;
      userEvent.click(modalContinueButton);

      await waitFor(() => expect(refreshSpecificationFundingService).toBeCalledTimes(1));

      notification = haveFailedJobNotification({ jobType: JobType.RefreshFundingJob }, {});
      setupJobSpy();
      act(() => {
        getNotificationCallback()(notification);
      });

      const errorNotification = await screen.findByTestId("error-summary");
      expect(errorNotification).toBeInTheDocument();
      expect(
        within(errorNotification as HTMLElement).getByText(/Failed to choose specification for funding/)
      ).toBeInTheDocument();
    });
  });
});
