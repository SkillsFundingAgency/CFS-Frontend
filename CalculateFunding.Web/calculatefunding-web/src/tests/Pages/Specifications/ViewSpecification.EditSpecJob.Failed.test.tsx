import { act, screen, within } from "@testing-library/react";

import { JobNotification } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const {
  mockSpec,
  mockSpecificationService,
  mockSpecificationPermissions,
  fundingConfigurationSpy,
  mockFundingLineStructureService,
  mockDatasetBySpecificationIdService,
  mockCalculationService,
  mockPublishService,
  hasNoCalcErrors,
  renderViewSpecificationPage,
} = ViewSpecificationTestData();
const { haveFailedJobNotification, setupJobSpy, getNotificationCallback } = jobSubscriptionTestHelper({
  mockSpecId: mockSpec.id,
});

describe("<ViewSpecification /> ", () => {
  describe("with an Edit Spec job completed in failure", () => {
    let notification: JobNotification;
    beforeEach(async () => {
      notification = haveFailedJobNotification(
        {
          jobType: JobType.EditSpecificationJob,
        },
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

    it("renders error", async () => {
      act(() => {
        getNotificationCallback()(notification);
      });

      expect(screen.queryByTestId("job-notification")).not.toBeInTheDocument();
      expect(screen.getByTestId("error-summary")).toBeInTheDocument();
      expect(within(screen.getByTestId("error-summary")).getByText(/Job failed/)).toBeInTheDocument();
    });
  });
});
