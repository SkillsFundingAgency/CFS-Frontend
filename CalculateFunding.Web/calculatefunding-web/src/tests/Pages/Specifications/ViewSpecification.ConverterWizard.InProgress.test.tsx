import { act, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import { ViewSpecificationRoute } from "../../../pages/Specifications/ViewSpecification";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { JobNotification } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
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

describe("<EditSpecification /> with a converter wizard job in progress", () => {
  const { setupJobSpy, haveJobInProgressNotification, getNotificationCallback } = jobSubscriptionTestUtils();

  describe("with a converter wizard report job successfully completed", () => {
    let notification: JobNotification;
    beforeEach(async () => {
      notification = haveJobInProgressNotification({ jobType: JobType.RunConverterDatasetMergeJob }, {});
      setupJobSpy();
      useSpecificationSummaryUtils.hasSpecification(spec);
      hasFullSpecPermissions();
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useFindSpecsWithResultsUtils.hasNoSpecsWithResults();
      useSpecsSelectedForFundingUtils.hasNoSpecsSelectedForFunding();
      useGetCalculationErrorsUtils.hasNoCalculationErrors();
      useCalculationCircularDependenciesUtils.hasNoCalculationCircularDependencies();
      useGetFundingStructureUtils.hasNoFundingStructure();
      useCalculationSummariesBySpecificationUtils.hasNoCalculations();

      await renderPage();

      act(() => {
        getNotificationCallback()(notification);
      });
    });
    afterEach(() => jest.clearAllMocks());

    it("displays job details / banner", async () => {
      expect(await screen.findByTestId("job-notification-banner")).toBeInTheDocument();
    });
  });
});

const fundingStream = fakery.makeFundingStream();
const fundingPeriod = fakery.makeFundingPeriod();
const spec = fakery.makeSpecificationSummary({
  fundingStreams: [fundingStream],
  fundingPeriod,
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
