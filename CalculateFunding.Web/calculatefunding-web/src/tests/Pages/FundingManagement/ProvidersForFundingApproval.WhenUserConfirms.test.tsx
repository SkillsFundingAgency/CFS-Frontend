import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { ProvidersForFundingApprovalProps } from "../../../pages/FundingManagement/Approvals/ProvidersForFundingApproval";
import * as publishService from "../../../services/publishService";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { ValidationErrors } from "../../../types/ErrorMessage";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { buildInitialPublishedProviderSearchRequest } from "../../../types/publishedProviderSearchRequest";
import { fakeAxiosResponse } from "../../fakes/fakeAxios";
import { fakery } from "../../fakes/fakery";
import { mockApiService } from "../../fakes/mockApiServices";
import { hasFullSpecPermissions } from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import {
  jobSubscriptionTestUtils,
  reduxMockingUtils,
  usePublishedProviderErrorSearchUtils,
  usePublishedProviderSearchUtils,
  useSpecificationSummaryUtils,
  waitForLoadingToFinish,
} from "../../testing-utils";
import { useFundingConfigurationUtils } from "../../testing-utils/useFundingConfigurationUtils";
import { useLastSuccessfulJobRunUtils } from "../../testing-utils/useLastSuccessfulJobRunUtils";

describe("<ProvidersForFundingApproval /> when user confirms refresh", () => {
  describe("and there is a validation error", () => {
    let preValidateForRefreshFundingSpy: jest.SpyInstance;
    const mockValidationErrors: ValidationErrors = {
      "error-message": ["stack overflow", "divide by zero"],
      "": ["hello error"],
    };
    const mockValidationError = jest
      .fn()
      .mockRejectedValue(fakeAxiosResponse.error(mockValidationErrors, 400));
    const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});

    beforeEach(async () => {
      hasFullSpecPermissions();
      haveNoJobNotification();
      setupJobSpy();
      const state = reduxMockingUtils.createFundingSearchSelectionState({
        searchCriteria: buildInitialPublishedProviderSearchRequest({
          fundingStreamId: fundingStream.id,
          fundingPeriodId: fundingPeriod.id,
          specificationId: spec.id,
          fundingAction: FundingActionType.Approve,
        }),
      });
      reduxMockingUtils.setupFundingSearchSelectionState(state);
      useSpecificationSummaryUtils.hasSpecification(spec);
      usePublishedProviderSearchUtils.hasSearchResults([provider1, providerWithError1]);
      usePublishedProviderErrorSearchUtils.hasProvidersWithErrors(["Error: missing something"]);
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useLastSuccessfulJobRunUtils.hasNeverHadSuccessfulJobResult();
      preValidateForRefreshFundingSpy = jest.spyOn(publishService, "preValidateForRefreshFundingService");
      preValidateForRefreshFundingSpy.mockImplementation(mockValidationError);
      await renderPage();
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    it("renders error summary", async () => {
      const refreshButton = screen.getByRole("button", { name: /Refresh funding/ });

      userEvent.click(refreshButton);

      await waitFor(() => expect(mockValidationError).toHaveBeenCalledWith(spec.id));

      const errorSummary = await screen.findByTestId("error-summary");
      expect(errorSummary).toBeInTheDocument();
      expect(within(errorSummary).getByText("There is a problem")).toBeInTheDocument();
      expect(within(errorSummary).getByText(/stack overflow/)).toBeInTheDocument();
      expect(within(errorSummary).getByText(/divide by zero/)).toBeInTheDocument();
      expect(within(errorSummary).getByText(/hello error/)).toBeInTheDocument();

      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });
  });
});

describe("when user confirms refresh", () => {
  describe("and there are no validation errors", () => {
    let preValidateForRefreshFundingSpy: jest.SpyInstance;
    let refreshFundingSpy: jest.SpyInstance;
    let mockJobCreated: jest.Mock = jest.fn();
    const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});

    beforeEach(async () => {
      hasFullSpecPermissions();
      haveNoJobNotification();
      setupJobSpy();
      const state = reduxMockingUtils.createFundingSearchSelectionState({
        searchCriteria: buildInitialPublishedProviderSearchRequest({
          fundingStreamId: fundingStream.id,
          fundingPeriodId: fundingPeriod.id,
          specificationId: spec.id,
          fundingAction: FundingActionType.Approve,
        }),
      });
      reduxMockingUtils.setupFundingSearchSelectionState(state);
      useSpecificationSummaryUtils.hasSpecification(spec);
      usePublishedProviderSearchUtils.hasSearchResults([provider1, providerWithError1]);
      usePublishedProviderErrorSearchUtils.hasProvidersWithErrors(["Error: missing something"]);
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useLastSuccessfulJobRunUtils.hasNeverHadSuccessfulJobResult();
      preValidateForRefreshFundingSpy = mockApiService.makeSuccessfulPreValidateForRefreshFundingSpy();

      mockJobCreated = jest.fn();
      mockJobCreated.mockResolvedValueOnce({
        jobId: "12345",
      });
      refreshFundingSpy = jest.spyOn(publishService, "refreshSpecificationFundingService");
      refreshFundingSpy.mockImplementation(mockJobCreated);
      return renderPage();
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    it("renders refresh link as enabled", async () => {
      const refreshLink = screen.getByRole("link", { name: /Refresh funding/ });
      expect(refreshLink).toBeEnabled();
    });

    it("renders refresh button as enabled", async () => {
      const refreshButton = screen.getByRole("button", { name: /Refresh funding/ });
      expect(refreshButton).toBeEnabled();
    });

    it("renders modal confirmation", async () => {
      const refreshButton = screen.getByRole("button", { name: /Refresh funding/ });

      userEvent.click(refreshButton);
      await waitForLoadingToFinish();

      await waitFor(() => expect(preValidateForRefreshFundingSpy).toHaveBeenCalled());

      expect(await screen.findByTestId("modal-confirmation-placeholder")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Confirm funding refresh/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Cancel/ })).toBeInTheDocument();
      const confirmButton = screen.getByRole("button", { name: /Confirm/ });
      expect(confirmButton).toBeInTheDocument();

      userEvent.click(confirmButton);

      await waitFor(() => expect(mockJobCreated).toHaveBeenCalledWith(spec.id));
    });
  });
});

const fundingStream = fakery.makeFundingStream();
const fundingPeriod = fakery.makeFundingPeriod();
const spec = fakery.makeSpecificationSummary({
  name: "Horse Riding",
  fundingStreams: [fundingStream],
  fundingPeriod,
});
const fundingConfig = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  approvalMode: ApprovalMode.Batches,
});
const provider1 = fakery.makePublishedProviderResult({
  specificationId: spec.id,
  fundingPeriodId: fundingPeriod.id,
  fundingStreamId: fundingStream.id,
});
const providerWithError1 = fakery.makePublishedProviderResult({
  publishedProviderVersionId: "errrr",
  specificationId: spec.id,
  fundingPeriodId: fundingPeriod.id,
  fundingStreamId: fundingStream.id,
  hasErrors: true,
  errors: ["Error: missing something"],
});

const renderPage = () => {
  const {
    ProvidersForFundingApproval,
  } = require("../../../pages/FundingManagement/Approvals/ProvidersForFundingApproval");
  reduxMockingUtils.store.dispatch = jest.fn();
  return render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <Provider store={reduxMockingUtils.store}>
          <ProvidersForFundingApproval
            location={location}
            history={history}
            match={fakery.makeMatch<ProvidersForFundingApprovalProps>({
              specificationId: spec.id,
              fundingStreamId: fundingConfig.fundingStreamId,
              fundingPeriodId: fundingConfig.fundingPeriodId,
            })}
          />
        </Provider>
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
};
