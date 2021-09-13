import { act, screen, within } from "@testing-library/react";

import { JobNotification } from "../../../hooks/Jobs/useJobSubscription";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const testData = ViewSpecificationTestData();

describe("<ViewSpecification /> ", () => {
  describe("with an Edit Spec job completed in failure", () => {
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

    it("renders error", async () => {
      act(() => {
        const notification: JobNotification = testData.haveEditSpecificationFailedJobNotification();
        testData.getNotificationCallback()(notification);
      });

      expect(screen.queryByTestId("job-notification")).not.toBeInTheDocument();
      expect(screen.getByTestId("error-summary")).toBeInTheDocument();
      expect(
        within(screen.getByTestId("error-summary")).getByText(/EditSpecification failed/)
      ).toBeInTheDocument();
    });
  });
});
