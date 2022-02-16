import { act, render, screen, within } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import { ViewSpecificationRoute } from "../../../pages/Specifications/ViewSpecification";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { JobNotification } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { PublishStatus } from "../../../types/PublishStatusModel";
import { fakery } from "../../fakes/fakery";
import { hasFullSpecPermissions } from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import {
  jobSubscriptionTestUtils,
  reduxMockingUtils,
  useSpecificationSummaryUtils,
} from "../../testing-utils";
import { useCalculationCircularDependenciesUtils } from "../../testing-utils/useCalculationCircularDependenciesUtils";
import { useGetCalculationErrorsUtils } from "../../testing-utils/useCalculationErrorsUtils";
import { useCalculationSummariesBySpecificationUtils } from "../../testing-utils/useCalculationSummariesBySpecificationUtils";
import { useFindSpecsWithResultsUtils } from "../../testing-utils/useFindSpecificationsWithResultsUtils";
import { useFundingConfigurationUtils } from "../../testing-utils/useFundingConfigurationUtils";
import { useGetFundingStructureUtils } from "../../testing-utils/useFundingStructureUtils";
import { useSpecsSelectedForFundingUtils } from "../../testing-utils/useSpecsSelectedForFundingUtils";

describe("<ViewSpecification />", () => {
  const { setupJobSpy, haveNoJobNotification, haveFailedJobNotification, getNotificationCallback } =
    jobSubscriptionTestUtils();

  describe("failed refresh job", () => {
    let notification: JobNotification;
    beforeEach(async () => {
      hasFullSpecPermissions();
      haveNoJobNotification();
      setupJobSpy();
      useSpecificationSummaryUtils.hasSpecification(spec);
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useFindSpecsWithResultsUtils.hasNoSpecsWithResults();
      useSpecsSelectedForFundingUtils.hasNoSpecsSelectedForFunding();
      useGetCalculationErrorsUtils.hasNoCalculationErrors();
      useCalculationCircularDependenciesUtils.hasNoCalculationCircularDependencies();
      useCalculationSummariesBySpecificationUtils.hasNoCalculations();
      useGetFundingStructureUtils.hasNoFundingStructure();

      await renderPage();

      notification = haveFailedJobNotification({ jobType: JobType.RefreshFundingJob }, {});
      setupJobSpy();
      act(() => {
        getNotificationCallback()(notification);
      });
    });
    afterEach(() => jest.clearAllMocks());

    it("shows error when refresh job fails", async () => {
      const errorNotification = await screen.findByTestId("error-summary");
      expect(errorNotification).toBeInTheDocument();
      expect(
        within(errorNotification as HTMLElement).getByText(/Failed to choose specification for funding/)
      ).toBeInTheDocument();
    });
  });
});

const fundingStream = fakery.makeFundingStream();
const fundingPeriod = fakery.makeFundingPeriod();
const spec = fakery.makeSpecificationSummary({
  fundingStreams: [fundingStream],
  fundingPeriod,
  approvalStatus: PublishStatus.Approved,
  isSelectedForFunding: false,
});
const fundingConfig = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  providerSource: ProviderSource.CFS,
});

const renderPage = async () => {
  const { ViewSpecification } = require("../../../pages/Specifications/ViewSpecification");
  reduxMockingUtils.store.dispatch = jest.fn();
  render(
    <QueryClientProviderTestWrapper>
      <Provider store={reduxMockingUtils.store}>
        <ErrorContextWrapper>
          <MemoryRouter>
            <ViewSpecification
              location={location}
              history={history}
              match={fakery.makeMatch<ViewSpecificationRoute>({
                specificationId: spec.id,
              })}
            />
          </MemoryRouter>
        </ErrorContextWrapper>
      </Provider>
    </QueryClientProviderTestWrapper>
  );
};
