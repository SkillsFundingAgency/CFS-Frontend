import { render, screen, waitFor } from "@testing-library/react";
import { DateTime } from "luxon";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { match, MemoryRouter } from "react-router";
import { createStore, Store } from "redux";

import * as providerErrorsHook from "../../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import * as providerIdsSearchHook from "../../../hooks/FundingApproval/usePublishedProviderIds";
import * as providerSearchHook from "../../../hooks/FundingApproval/usePublishedProviderSearch";
import * as jobSubscriptionHook from "../../../hooks/Jobs/useJobSubscription";
import { AddJobSubscription } from "../../../hooks/Jobs/useJobSubscription";
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
import { JobNotification, JobSubscription } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
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
  const fundingConfigWithApproveAllResult: FundingConfigurationQueryResult = {
    fundingConfiguration: {
      approvalMode: ApprovalMode.All,
      providerSource: ProviderSource.CFS,
      defaultTemplateVersion: "1.1",
      fundingPeriodId: fundingPeriod.id,
      fundingStreamId: fundingStream.id,
      enableConverterDataMerge: false,
      updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
      releaseChannels: [],
      enableCarryForward: false,
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
      releaseChannels: [],
      enableCarryForward: false,
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
    urn: "851305",
    majorVersion: 1,
    minorVersion: 1,
    releaseChannels: [],
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
    urn: "82096",
    majorVersion: 1,
    minorVersion: 1,
    releaseChannels: [],
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

  const fundingSearchSelectionState: FundingSearchSelectionState = {
    selectedProviderIds: [provider1.publishedProviderVersionId],
    searchCriteria: buildInitialPublishedProviderSearchRequest({
      fundingStreamId: fundingStream.id,
      fundingPeriodId: fundingPeriod.id,
      specificationId: testSpec.id,
      fundingAction: FundingActionType.Approve,
    }),
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

  let notification: JobNotification | undefined;
  let subscription: JobSubscription = {
    filterBy: {
      jobId: "jobId",
      jobTypes: [],
      specificationId: testSpec.id,
    },
    id: "sertdhw4e5t",
    isEnabled: true,
    onError: () => null,
    startDate: DateTime.local(),
  };

  const haveNoJobNotification = () => {
    notification = undefined;
  };

  const haveRefreshFailedJobNotification = () => {
    const job = {
      jobId: "jobId-generatedByRefresh",
      jobType: JobType.RefreshFundingJob,
      statusDescription: "",
      jobDescription: "",
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Failed,
      failures: [],
      isSuccessful: false,
      isFailed: true,
      isActive: false,
      isComplete: true,
      outcome: "Refresh failed",
    };
    subscription.id = "refresh";
    subscription.filterBy = {
      jobId: job.jobId,
      specificationId: testSpec.id,
      jobTypes: [job.jobType],
    };
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: job,
    };

    return notification;
  };
  const haveRefreshSucceededJobNotification = () => {
    const job = {
      jobId: "jobId-generatedByRefresh",
      jobType: JobType.RefreshFundingJob,
      statusDescription: "",
      jobDescription: "",
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Succeeded,
      failures: [],
      isSuccessful: true,
      isFailed: false,
      isActive: false,
      isComplete: true,
      outcome: "Refresh succeeded",
    };
    subscription.id = "refresh";
    subscription.filterBy = {
      jobId: job.jobId,
      specificationId: testSpec.id,
      jobTypes: [job.jobType],
    };
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: job,
    };

    return notification;
  };

  const haveFailedJobNotification = () => {
    const job = {
      jobId: "jobId-Failed",
      jobType: JobType.RefreshFundingJob,
      statusDescription: "Refreshing funding",
      jobDescription: "",
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Failed,
      failures: [],
      isSuccessful: false,
      isFailed: true,
      isActive: false,
      isComplete: true,
      outcome: "Refresh failed",
    };
    subscription.id = "Failed-sub-id";
    subscription.filterBy = {
      jobId: job.jobId,
      specificationId: testSpec.id,
      jobTypes: [job.jobType],
    };
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: job,
    };

    return notification;
  };

  const haveJobInProgressNotification = () => {
    subscription.id = "Refresh-active";
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: {
        isComplete: false,
        jobId: "123",
        jobType: JobType.RefreshFundingJob,
        statusDescription: "Refresh Funding job is in progress",
        jobDescription: "Refreshing Funding",
        runningStatus: RunningStatus.InProgress,
        failures: [],
        isSuccessful: false,
        isFailed: false,
        isActive: true,
        outcome: "",
      },
    };
    return notification;
  };

  let notificationCallback: (n: JobNotification) => void = () => null;
  let hasNotificationCallback = false;
  const getNotificationCallback = () => {
    return notificationCallback;
  };

  const jobSubscriptionSpy = jest.spyOn(jobSubscriptionHook, "useJobSubscription");
  jobSubscriptionSpy.mockImplementation(({ onNewNotification }) => {
    if (onNewNotification && !hasNotificationCallback) {
      notificationCallback = onNewNotification;
      hasNotificationCallback = true;
    }
    return {
      addSub: (request: AddJobSubscription) => {
        const sub: JobSubscription = {
          filterBy: {
            jobId: request?.filterBy.jobId,
            specificationId: request?.filterBy.specificationId,
            jobTypes: request?.filterBy.jobTypes ? request?.filterBy.jobTypes : undefined,
          },
          isEnabled: true,
          id: "sertdhw4e5t",
          onError: () => request.onError,
          startDate: DateTime.now(),
        };
        subscription = sub;
        return Promise.resolve(sub);
      },
      replaceSubs: () => {
        const sub: JobSubscription = {
          filterBy: {},
          id: "sertdhw4e5t",
          onError: () => null,
          isEnabled: true,
          startDate: DateTime.now(),
        };
        subscription = sub;
        return [sub];
      },
      removeSub: () => null,
      removeAllSubs: () => null,
      subs: [],
      results: notification ? [notification] : [],
    };
  });

  const hasSpecification = () =>
    jest.spyOn(specHook, "useSpecificationSummary").mockImplementation(() => specResult);
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
    hasSpecification,
    notification,
    getNotificationCallback,
    haveNoJobNotification,
    haveFailedJobNotification,
    haveRefreshFailedJobNotification,
    haveRefreshSucceededJobNotification,
    haveJobInProgressNotification,
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
