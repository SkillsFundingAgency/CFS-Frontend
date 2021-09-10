﻿import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { MemoryRouter,match } from "react-router";
import { Store,createStore } from "redux";

import { getJobDetailsFromJobResponse } from "../../../helpers/jobDetailsHelper";
import * as providerErrorsHook from "../../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import * as providerIdsSearchHook from "../../../hooks/FundingApproval/usePublishedProviderIds";
import * as providerSearchHook from "../../../hooks/FundingApproval/usePublishedProviderSearch";
import * as jobHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import { LatestSpecificationJobWithMonitoringResult } from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import { FundingConfigurationQueryResult } from "../../../hooks/useFundingConfiguration";
import * as specHook from "../../../hooks/useSpecificationSummary";
import { SpecificationSummaryQueryResult } from "../../../hooks/useSpecificationSummary";
import { SpecificationFundingApprovalRouteProps } from "../../../pages/FundingApprovals/SpecificationFundingApproval";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { FundingSearchSelectionState } from "../../../states/FundingSearchSelectionState";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { CompletionStatus } from "../../../types/CompletionStatus";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { FundingLineProfile, ProfileTotal } from "../../../types/FundingLineProfile";
import { JobResponse } from "../../../types/jobDetails";
import { JobType } from "../../../types/jobType";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { PublishedProviderResult } from "../../../types/PublishedProvider/PublishedProviderSearchResults";
import { buildInitialPublishedProviderSearchRequest } from "../../../types/publishedProviderSearchRequest";
import { PublishStatus } from "../../../types/PublishStatusModel";
import { RunningStatus } from "../../../types/RunningStatus";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";
import {
  createPublishedProviderErrorSearchQueryResult,
  createPublishedProviderIdsQueryResult,
  createPublishedProviderResult,
  createPublishedProviderSearchQueryResult,
  defaultFacets,
  hasFullSpecPermissions,
  hasSpecPermissions,
} from "../../fakes/testFactories";

export function FundingApprovalTestData() {
  jest.mock("../../../components/AdminNav");

  const fundingStream: FundingStream = {
    name: "FS123",
    id: "Wizard Training Scheme",
  };
  const fundingPeriod: FundingPeriod = {
    id: "FP123",
    name: "2019-20",
  };
  const testSpec: SpecificationSummary = {
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: fundingPeriod,
    fundingStreams: [fundingStream],
    id: "ABC123",
    isSelectedForFunding: true,
    providerVersionId: "",
    dataDefinitionRelationshipIds: [],
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    templateIds: {},
  };
  const specResult: SpecificationSummaryQueryResult = {
    clearSpecificationFromCache: () => Promise.resolve(),
    specification: testSpec,
    isLoadingSpecification: false,
    errorCheckingForSpecification: null,
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: true,
  };
  const noJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: false,
    isCheckingForJob: false,
    latestJob: undefined,
    isFetched: true,
    isFetching: false,
  };
  const activeJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
      jobId: "rt56w",
      jobType: JobType.RefreshFundingJob,
      runningStatus: RunningStatus.InProgress,
      invokerUserDisplayName: "testUser",
      created: new Date(),
      lastUpdated: new Date(),
    }),
    isFetched: true,
    isFetching: false,
  };
  const failedJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
      jobId: "sd64",
      jobType: JobType.RefreshFundingJob,
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Failed,
      invokerUserDisplayName: "testUser",
      created: new Date(),
      lastUpdated: new Date(),
    }),
    isFetched: true,
    isFetching: false,
  };
  const successfulCompletedJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
      jobId: "rfgd",
      jobType: JobType.RefreshFundingJob,
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Succeeded,
      invokerUserDisplayName: "testUser",
      created: new Date(),
      lastUpdated: new Date(),
    }),
    isFetched: true,
    isFetching: false,
  };
  const fundingConfigWithApproveAllResult: FundingConfigurationQueryResult = {
    fundingConfiguration: {
      approvalMode: ApprovalMode.All,
      providerSource: ProviderSource.CFS,
      defaultTemplateVersion: "1.1",
      fundingPeriodId: fundingPeriod.id,
      fundingStreamId: fundingStream.id,
      enableConverterDataMerge: false,
      updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
    },
    isLoadingFundingConfiguration: false,
    isErrorLoadingFundingConfiguration: false,
    errorLoadingFundingConfiguration: "",
  };
  const fundingConfigWithBatchApprovalResult: FundingConfigurationQueryResult = {
    fundingConfiguration: {
      approvalMode: ApprovalMode.Batches,
      providerSource: ProviderSource.CFS,
      defaultTemplateVersion: "1.1",
      fundingPeriodId: fundingPeriod.id,
      fundingStreamId: fundingStream.id,
      enableConverterDataMerge: false,
      updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
    },
    isLoadingFundingConfiguration: false,
    isErrorLoadingFundingConfiguration: false,
    errorLoadingFundingConfiguration: "",
  };
  const provider1: PublishedProviderResult = {
    isIndicative: false,
    errors: [],
    fundingPeriodId: fundingPeriod.id,
    fundingStatus: PublishStatus.Updated,
    fundingStreamId: fundingStream.id,
    fundingValue: 3456.43,
    hasErrors: false,
    localAuthority: "East London LA",
    providerName: "East London School",
    providerSubType: "What sup?",
    providerType: "whatever",
    publishedProviderVersionId: "aa123",
    specificationId: testSpec.id,
    ukprn: "23932035",
    upin: "43634",
    urn: "851305"
  };
  const providerWithError1: PublishedProviderResult = {
    isIndicative: false,
    errors: ["Error: Something went wrong"],
    fundingPeriodId: fundingPeriod.id,
    fundingStatus: PublishStatus.Updated,
    fundingStreamId: fundingStream.id,
    fundingValue: 10000,
    hasErrors: true,
    localAuthority: "West London",
    providerName: "West London School",
    providerSubType: "What sup?",
    providerType: "whatever",
    publishedProviderVersionId: "bb123",
    specificationId: testSpec.id,
    ukprn: "9641960",
    upin: "785220",
    urn: "82096"
  };
  const profileTotal: ProfileTotal = {
    distributionPeriodId: "",
    installmentNumber: 0,
    isPaid: false,
    occurrence: 0,
    periodType: "",
    typeValue: "",
    value: 0,
    year: 0,
  };
  const fundingLineProfile1: FundingLineProfile = {
    amountAlreadyPaid: 53450,
    fundingLineCode: "KNIT",
    fundingLineName: "Knitting",
    lastUpdatedUser: { name: "Bob", id: "1" },
    profilePatternDescription: "A nice smooth lined knitting pattern",
    profilePatternKey: "pattern-key",
    profilePatternName: "Stockinette Stitch Pattern",
    profileTotalAmount: 5794330,
    profileTotals: [profileTotal],
    providerId: provider1.publishedProviderVersionId,
    providerName: provider1.providerName,
    fundingLineAmount: 895436.74,
    ukprn: provider1.ukprn,
    errors: [],
  };

  const fundingLineWithError: FundingLineProfile = {
    amountAlreadyPaid: 53450,
    fundingLineCode: "KNIT",
    fundingLineName: "Knitting",
    lastUpdatedUser: { name: "Bob", id: "1" },
    profilePatternDescription: "A nice smooth lined knitting pattern",
    profilePatternKey: "pattern-key",
    profilePatternName: "Stockinette Stitch Pattern",
    profileTotalAmount: 5794330,
    profileTotals: [profileTotal],
    providerId: provider1.publishedProviderVersionId,
    providerName: provider1.providerName,
    fundingLineAmount: 895436.74,
    ukprn: provider1.ukprn,
    errors: [
      {
        detailedErrorMessage: "There is an error with this funding line",
        fundingLine: "Funding line 1",
        fundingLineCode: "ERROR",
        fundingStreamId: "ERR",
        summaryErrorMessage: "Here is a summary of the error",
        type: "Error type",
      },
    ],
  };

  const fundingLineProfileWithMissingTotalAllocation: FundingLineProfile = {
    amountAlreadyPaid: 53450,
    fundingLineCode: "KNIT",
    fundingLineName: "Knitting",
    lastUpdatedUser: { name: "Bob", id: "1" },
    profilePatternDescription: "A nice smooth lined knitting pattern",
    profilePatternKey: "pattern-key",
    profilePatternName: "Stockinette Stitch Pattern",
    profileTotalAmount: undefined,
    profileTotals: [profileTotal],
    providerId: provider1.publishedProviderVersionId,
    providerName: provider1.providerName,
    fundingLineAmount: undefined,
    ukprn: provider1.ukprn,
    errors: [],
  };

  const mockLastRefreshJob: JobResponse = {
    jobId: "",
    jobType: "",
    lastUpdated: new Date(Date.UTC(2021, 1, 9)),
    runningStatus: RunningStatus.Completed,
  };
  const hasLastRefreshJob = () => {
    jest.mock("../../../services/jobService", () => {
      const mockService = jest.requireActual("../../../services/jobService");

      return {
        ...mockService,
        getLatestSuccessfulJob: mockLastRefreshJob,
      };
    });
  };

  const fundingSearchSelectionState: FundingSearchSelectionState = {
    selectedProviderIds: [provider1.publishedProviderVersionId],
    searchCriteria: buildInitialPublishedProviderSearchRequest(
      fundingStream.id,
      fundingPeriod.id,
      testSpec.id
    ),
  };

  const matchMock: match<SpecificationFundingApprovalRouteProps> = {
    params: {
      specificationId: testSpec.id,
      fundingStreamId: fundingStream.id,
      fundingPeriodId: fundingPeriod.id,
    },
    url: "",
    path: "",
    isExact: true,
  };

  const store: Store<IStoreState> = createStore(rootReducer);

  const renderPage = async () => {
    const {
      SpecificationFundingApproval,
    } = require("../../../pages/FundingApprovals/SpecificationFundingApproval");
    store.dispatch = jest.fn();
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <Provider store={store}>
            <SpecificationFundingApproval location={location} history={history} match={matchMock} />
          </Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };
  const loadPage = async () => {
    const {
      SpecificationFundingApproval,
    } = require("../../../pages/FundingApprovals/SpecificationFundingApproval");
    store.dispatch = jest.fn();
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <Provider store={store}>
            <SpecificationFundingApproval location={location} history={history} match={matchMock} />
          </Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByTestId("loader")).not.toBeInTheDocument());
  };

  const hasSpecification = () =>
    jest.spyOn(specHook, "useSpecificationSummary").mockImplementation(() => specResult);
  const hasNoActiveJobsRunning = () =>
    jest.spyOn(jobHook, "useLatestSpecificationJobWithMonitoring").mockImplementation(() => noJob);
  const hasActiveJobRunning = () =>
    jest.spyOn(jobHook, "useLatestSpecificationJobWithMonitoring").mockImplementation(() => activeJob);
  const hasFailedJob = () =>
    jest.spyOn(jobHook, "useLatestSpecificationJobWithMonitoring").mockImplementation(() => failedJob);
  const hasSuccessfulCompletedJob = () =>
    jest
      .spyOn(jobHook, "useLatestSpecificationJobWithMonitoring")
      .mockImplementation(() => successfulCompletedJob);
  const hasFundingConfigurationWithApproveAll = () =>
    jest
      .spyOn(fundingConfigurationHook, "useFundingConfiguration")
      .mockImplementation(() => fundingConfigWithApproveAllResult);
  const hasFundingConfigurationWithBatchApproval = () =>
    jest
      .spyOn(fundingConfigurationHook, "useFundingConfiguration")
      .mockImplementation(() => fundingConfigWithBatchApprovalResult);
  const hasProvidersWithErrors = (errors: string[]) =>
    jest
      .spyOn(providerErrorsHook, "usePublishedProviderErrorSearch")
      .mockImplementation(() => createPublishedProviderErrorSearchQueryResult(errors));
  const hasProviderIds = (ids: string[]) =>
    jest
      .spyOn(providerIdsSearchHook, "usePublishedProviderIds")
      .mockImplementation(() => createPublishedProviderIdsQueryResult(ids));
  const hasSearchResults = (providers: PublishedProviderResult[]) =>
    jest
      .spyOn(providerSearchHook, "usePublishedProviderSearch")
      .mockImplementation(() =>
        createPublishedProviderSearchQueryResult(
          createPublishedProviderResult(providers, true, true, defaultFacets),
          []
        )
      );
  const hasSearchResultsWithProviderIds = (providers: PublishedProviderResult[], ids: string[]) =>
    jest
      .spyOn(providerSearchHook, "usePublishedProviderSearch")
      .mockImplementation(() =>
        createPublishedProviderSearchQueryResult(
          createPublishedProviderResult(providers, true, true, defaultFacets),
          ids
        )
      );

  return {
    matchMock,
    fundingStream,
    fundingPeriod,
    hasFullSpecPermissions,
    hasSpecPermissions,
    testSpec,
    provider1,
    providerWithError1,
    fundingLineProfile1,
    fundingLineWithError,
    fundingLineProfileWithMissingTotalAllocation,
    fundingSearchSelectionState,
    mockLastRefreshJob,
    activeJob,
    failedJob,
    successfulCompletedJob,
    hasSpecification,
    hasLastRefreshJob,
    hasNoActiveJobsRunning,
    hasActiveJobRunning,
    hasFailedJob,
    hasSuccessfulCompletedJob,
    hasFundingConfigurationWithApproveAll,
    hasFundingConfigurationWithBatchApproval,
    hasProvidersWithErrors,
    hasProviderIds,
    hasSearchResults,
    hasSearchResultsWithProviderIds,
    renderPage,
    loadPage,
  };
}
