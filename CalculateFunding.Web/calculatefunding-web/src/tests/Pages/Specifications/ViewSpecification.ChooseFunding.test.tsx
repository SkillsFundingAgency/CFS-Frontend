import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import { ViewSpecificationRoute } from "../../../pages/Specifications/ViewSpecification";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { PublishStatus } from "../../../types/PublishStatusModel";
import { fakery } from "../../fakes/fakery";
import { mockApiService } from "../../fakes/mockApiServices";
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
  const { setupJobSpy, haveNoJobNotification } = jobSubscriptionTestUtils();
  const refreshSpy = mockApiService.makeRefreshSpecSpy();

  describe("choosing approved specification for funding ", () => {
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
    });
    afterEach(() => jest.clearAllMocks());

    it("it makes all the expected calls to the API", async () => {
      expect(useSpecificationSummaryUtils.spy).toBeCalled();
      expect(useFundingConfigurationUtils.spy).toBeCalled();
      expect(useSpecsSelectedForFundingUtils.spy).toBeCalled();
      expect(useFindSpecsWithResultsUtils.spy).toBeCalled();
      expect(useGetCalculationErrorsUtils.spy).toBeCalled();
      expect(useCalculationCircularDependenciesUtils.spy).toBeCalled();
    });

    it("choosing for funding will trigger a refresh", async () => {
      const chooseForFundingButton = await screen.findByTestId("choose-for-funding");
      userEvent.click(chooseForFundingButton);

      const modalContinueButton = (await screen.findByTestId(
        "confirm-modal-continue-button"
      )) as HTMLButtonElement;
      userEvent.click(modalContinueButton);

      await waitFor(() => expect(refreshSpy).toBeCalledTimes(1));
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
