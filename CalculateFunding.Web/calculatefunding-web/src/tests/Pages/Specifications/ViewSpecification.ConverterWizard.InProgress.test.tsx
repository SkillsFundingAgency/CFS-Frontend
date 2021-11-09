import { act, screen } from "@testing-library/react";

import { JobNotification } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const {
  mockSpecificationPermissions,
  mockFundingLineStructureService,
  mockDatasetBySpecificationIdService,
  mockCalculationService,
  mockPublishService,
  fundingConfigurationSpy,
  mockSpecificationService,
  hasNoCalcErrors,
  renderViewSpecificationPage,
} = ViewSpecificationTestData();
const { setupJobSpy, haveJobInProgressNotification, getNotificationCallback } = jobSubscriptionTestHelper({});

describe("<ViewSpecification /> ", () => {
  describe("with a converter wizard job in progress", () => {
    let notification: JobNotification;
    beforeEach(async () => {
      notification = haveJobInProgressNotification({ jobType: JobType.RunConverterDatasetMergeJob }, {});
      setupJobSpy();
      mockSpecificationPermissions();
      mockSpecificationService();
      mockFundingLineStructureService();
      mockDatasetBySpecificationIdService();
      mockCalculationService();
      mockPublishService();
      fundingConfigurationSpy();
      hasNoCalcErrors();

      await renderViewSpecificationPage();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("displays job details / banner", async () => {
      act(() => {
        getNotificationCallback()(notification);
      });

      expect(await screen.findByTestId("job-notification-banner")).toBeInTheDocument();
    });
  });
});
