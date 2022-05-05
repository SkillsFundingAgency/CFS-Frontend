import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import { ProvidersForFundingApprovalProps } from "../../../pages/FundingManagement/Approvals/ProvidersForFundingApproval";
import { ApprovalMode } from "../../../types/ApprovalMode";
import {
  FundingActionType,
  PublishedProviderFundingCount,
} from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { buildInitialPublishedProviderSearchRequest } from "../../../types/publishedProviderSearchRequest";
import { fakery } from "../../fakes/fakery";
import { mockApiService } from "../../fakes/mockApiServices";
import { hasFullSpecPermissions } from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import { jobSubscriptionTestUtils, reduxMockingUtils, waitForLoadingToFinish } from "../../testing-utils";
import { useFundingConfirmationUtils } from "../../testing-utils/useFundingConfirmationUtils";

jest.mock("../../../components/Funding/CsvDownloadPublishedProviders"); // mocked out because this caused rendering issues with tests

describe("<ConfirmApprovalOfFunding /> tests", () => {
  const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});
  const { spy, withFundingConfirmationResult } = useFundingConfirmationUtils;

  beforeEach(async () => {
    hasFullSpecPermissions();
    haveNoJobNotification();
    setupJobSpy();
    mockApiService.makeGenerateCsvForApprovalAllSpy();
    const state = reduxMockingUtils.createFundingSearchSelectionState({
      searchCriteria: buildInitialPublishedProviderSearchRequest({
        fundingStreamId: fundingStream.id,
        fundingPeriodId: fundingPeriod.id,
        specificationId: spec.id,
        fundingAction: FundingActionType.Approve,
      }),
    });
    reduxMockingUtils.setupFundingSearchSelectionState(state);
    withFundingConfirmationResult({
      specification: spec,
      fundingConfiguration: fundingConfig,
      fundingSummary: fundingSummary,
    });
    await renderPage();
  });

  afterEach(() => jest.resetAllMocks());

  it("renders warning message and funding summary section", async () => {
    await waitForLoadingToFinish();
    expect(spy).toBeCalled();
    expect(screen.getByText("The provider amount shown might not be up to date")).toBeVisible();
    expect(
      screen.getByText(
        /Selected providers may not appear in the provider count due to provider records missing from funding data, providers currently in error state, or providers already set as approved or released/
      )
    ).toBeVisible();
  });

  it("renders funding summary section", async () => {
    expect(spy).toBeCalled();
    expect(await screen.findByRole("table", { name: "funding-summary-table" })).toBeVisible();
  });

  it("clicking the approve button after acknowledging triggers an approval action", async () => {
    expect(spy).toBeCalled();
    const approveSpy = mockApiService.makeApproveSpecificationFundingServiceSpy();

    const checkbox = screen.getByRole("checkbox", {
      name: /I acknowledge that the total provider amount shown may not be up to date/i,
    });
    expect(checkbox).toBeEnabled();

    checkbox.click();

    const approveButton = screen.getByRole("button", { name: /Confirm approval/ });
    expect(approveButton).toBeEnabled();

    approveButton.click();

    expect(screen.getByRole("button", { name: /Confirm approval/ })).toBeDisabled();
    expect(screen.getByText(/Updating/)).toBeVisible();
    expect(approveSpy).toBeCalled();
  });

  it("clicking the approve button without acknowledging results in an error message", async () => {
    expect(spy).toBeCalled();
    expect(screen.getByText("The provider amount shown might not be up to date")).toBeVisible();
    expect(
      screen.getByText(
        /Selected providers may not appear in the provider count due to provider records missing from funding data, providers currently in error state, or providers already set as approved or released/
      )
    ).toBeVisible();

    const approveButton = screen.getByRole("button", { name: /Confirm approval/ });
    expect(approveButton).toBeEnabled();

    approveButton.click();

    expect(
      screen.getByText(
        /You must acknowledge that you understand the provider amount shown might not be up to date/
      )
    ).toBeVisible();
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
  approvalMode: ApprovalMode.All,
});
const fundingSummary: PublishedProviderFundingCount = {
  fundingStreamsFundings: [{ fundingStreamId: "DSK", totalFunding: 536 }],
  localAuthorities: [],
  count: 2,
  indicativeProviderTotalFunding: 4565,
  indicativeProviderCount: 1,
  paidProviderCount: 1,
  paidProvidersTotalFunding: 4362,
  localAuthoritiesCount: 0,
  providerTypesCount: 0,
  providerTypes: [],
  totalFunding: 89432,
};

const renderPage = async () => {
  const {
    ConfirmApprovalOfFunding,
  } = require("../../../pages/FundingManagement/Approvals/ConfirmApprovalOfFunding");
  reduxMockingUtils.store.dispatch = jest.fn();

  render(
    <MemoryRouter
      initialEntries={["/FundingManagement/Approve/Confirm/PSG/AY-5/9e958b8d-793c-45da-b323-37bbe7424273"]}
    >
      <ErrorContextWrapper>
        <QueryClientProviderTestWrapper>
          <Provider store={reduxMockingUtils.store}>
            <ConfirmApprovalOfFunding
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
      </ErrorContextWrapper>
    </MemoryRouter>
  );
  await waitForLoadingToFinish();
};
