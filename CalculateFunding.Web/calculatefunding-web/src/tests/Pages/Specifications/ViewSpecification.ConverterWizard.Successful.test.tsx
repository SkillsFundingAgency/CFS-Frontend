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
const { setupJobSpy, haveJobSuccessfulNotification, getNotificationCallback } = jobSubscriptionTestHelper({});

describe("<ViewSpecification /> ", () => {
  describe("with a converter wizard report job successfully completed", () => {
    let notification: JobNotification;
    beforeEach(async () => {
      notification = haveJobSuccessfulNotification(
        { jobType: JobType.ConverterWizardActivityCsvGenerationJob },
        {}
      );
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

    it("does not display job details / banner", async () => {
      act(() => {
        getNotificationCallback()(notification);
      });

      expect(screen.queryByTestId("job-notification")).not.toBeInTheDocument();
    });
  });
});
