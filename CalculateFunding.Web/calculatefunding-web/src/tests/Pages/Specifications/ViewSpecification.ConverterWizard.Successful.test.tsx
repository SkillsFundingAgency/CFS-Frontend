import { act, screen } from "@testing-library/react";

import { JobNotification } from "../../../hooks/Jobs/useJobSubscription";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const testData = ViewSpecificationTestData();

describe("<ViewSpecification /> ", () => {
  describe("with a converter wizard report job successfully completed", () => {
    beforeEach(async () => {
      testData.mockSpecificationPermissions();
      testData.mockSpecificationService();
      testData.mockFundingLineStructureService();
      testData.mockDatasetBySpecificationIdService();
      testData.mockCalculationService();
      testData.mockPublishService();
      testData.fundingConfigurationSpy();
      testData.hasNoCalcErrors();
      testData.hasNoLatestJob();
      await testData.renderViewSpecificationPage();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("does not display job details / banner", async () => {
      act(() => {
        const notification: JobNotification = testData.haveReportJobCompleteNotification();
        testData.getNotificationCallback()(notification);
      });

      expect(screen.queryByTestId("job-notification")).not.toBeInTheDocument();
    });
  });
});
