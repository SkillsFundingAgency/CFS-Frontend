import { render, screen, waitFor } from "@testing-library/react";
import { DateTime } from "luxon";
import React from "react";
import { Provider } from "react-redux";
import * as redux from "react-redux";
import { MemoryRouter, Route, Switch } from "react-router";
import { createStore, Store } from "redux";

import * as jobSubscriptionHook from "../../../hooks/Jobs/useJobSubscription";
import { AddJobSubscription } from "../../../hooks/Jobs/useJobSubscription";
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import { SpecificationPermissionsResult } from "../../../hooks/Permissions/useSpecificationPermissions";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { CompletionStatus } from "../../../types/CompletionStatus";
import { CoreProviderSummary, ProviderSnapshot, ProviderSource } from "../../../types/CoreProviderSummary";
import { FundingStreamPermissions } from "../../../types/FundingStreamPermissions";
import { JobMonitoringFilter } from "../../../types/Jobs/JobMonitoringFilter";
import { JobNotification, JobSubscription } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { Permission } from "../../../types/Permission";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { RunningStatus } from "../../../types/RunningStatus";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { PublishedFundingTemplate } from "../../../types/TemplateBuilderDefinitions";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";
import { buildPermissions } from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";

const store: Store<IStoreState> = createStore(rootReducer);

store.dispatch = jest.fn();

export function CreateSpecificationTestData() {
  const useSelectorSpy = jest.spyOn(redux, "useSelector");

  const renderCreateSpecificationPage = async () => {
    const { CreateSpecification } = require("../../../pages/Specifications/CreateSpecification");
    const component = render(
      <MemoryRouter initialEntries={["/Specifications/CreateSpecification"]}>
        <QueryClientProviderTestWrapper>
          <Provider store={store}>
            <Switch>
              <Route path="/Specifications/CreateSpecification" component={CreateSpecification} />
            </Switch>
          </Provider>
        </QueryClientProviderTestWrapper>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading.../)).not.toBeInTheDocument();
    });
    return component;
  };

  const renderEditSpecificationPage = async (mockSpecId: string) => {
    const { EditSpecification } = require("../../../pages/Specifications/EditSpecification");
    return render(
      <MemoryRouter initialEntries={[`/Specifications/EditSpecification/${mockSpecId}`]}>
        <QueryClientProviderTestWrapper>
          <Provider store={store}>
            <Switch>
              <Route
                path="/Specifications/EditSpecification/:specificationId"
                component={EditSpecification}
              />
            </Switch>
          </Provider>
        </QueryClientProviderTestWrapper>
      </MemoryRouter>
    );
  };

  const renderLoadedEditSpecificationPage = async (mockSpecId: string) => {
    const { EditSpecification } = require("../../../pages/Specifications/EditSpecification");
    const component = render(
      <MemoryRouter initialEntries={[`/Specifications/EditSpecification/${mockSpecId}`]}>
        <QueryClientProviderTestWrapper>
          <Provider store={store}>
            <Switch>
              <Route
                path="/Specifications/EditSpecification/:specificationId"
                component={EditSpecification}
              />
            </Switch>
          </Provider>
        </QueryClientProviderTestWrapper>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });
    return component;
  };

  const mockFundingStream: FundingStream = {
    id: "stream-547",
    name: "Test Stream 547",
  };
  const mockFundingPeriod: FundingPeriod = {
    id: "period-433",
    name: "Test Period 433",
  };
  const mockTemplate1: PublishedFundingTemplate = {
    authorId: "53",
    authorName: "yukl yrtj",
    publishDate: new Date(),
    publishNote: "another publish note",
    schemaVersion: "1.1",
    templateVersion: "3.2",
  };
  const mockTemplate2: PublishedFundingTemplate = {
    authorId: "43",
    authorName: "asdf asdf",
    publishDate: new Date(),
    publishNote: "blah blah publish note",
    schemaVersion: "1.4",
    templateVersion: "9.9",
  };
  const mockGetFundingStreamsCall = jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: mockFundingStream.id,
          name: mockFundingStream.name,
        },
      ],
    })
  );
  const mockGetPublishedTemplatesByStreamAndPeriodCall = jest.fn(() =>
    Promise.resolve({
      data: [mockTemplate1, mockTemplate2],
    })
  );
  const mockGetFundingConfigurationCall = (
    mockProviderSource: ProviderSource,
    mockApprovalMode: ApprovalMode,
    mockUpdateCoreProviderVersion: UpdateCoreProviderVersion
  ) =>
    jest.fn(() =>
      Promise.resolve({
        data: {
          fundingStreamId: mockFundingStream.id,
          fundingPeriodId: mockFundingPeriod.id,
          approvalMode: mockApprovalMode,
          providerSource: mockProviderSource,
          defaultTemplateVersion: mockTemplate2.templateVersion,
          updateCoreProviderVersion: mockUpdateCoreProviderVersion,
        },
      })
    );
  const mockPolicyService = (
    mockProviderSource: ProviderSource,
    mockApprovalMode: ApprovalMode,
    mockUpdateCoreProviderVersion: UpdateCoreProviderVersion
  ) => {
    jest.mock("../../../services/policyService", () => {
      const service = jest.requireActual("../../../services/policyService");

      return {
        ...service,
        getFundingStreamsService: mockGetFundingStreamsCall,
        getPublishedTemplatesByStreamAndPeriod: mockGetPublishedTemplatesByStreamAndPeriodCall,
        getFundingConfiguration: mockGetFundingConfigurationCall(
          mockProviderSource,
          mockApprovalMode,
          mockUpdateCoreProviderVersion
        ),
      };
    });
  };

  const mockCoreProvider1: CoreProviderSummary = {
    providerVersionId: "provider-version-4162",
    versionType: "",
    name: "Provider 4162",
    description: "",
    version: 11,
    targetDate: new Date(),
    fundingStream: mockFundingStream.id,
    created: new Date(),
  };
  const mockCoreProvider2: CoreProviderSummary = {
    providerVersionId: "provider-version-5439",
    versionType: "",
    name: "Provider 5439",
    description: "",
    version: 4,
    targetDate: new Date(),
    fundingStream: mockFundingStream.id,
    created: new Date(),
  };
  const mockProviderSnapshot1: ProviderSnapshot = {
    providerSnapshotId: 2354,
    name: "Provider Snapshot Name 2354",
    description: "Provider Snapshot Description 2354",
    version: 14,
    targetDate: new Date(),
    created: new Date(),
    fundingStreamCode: mockFundingStream.id,
    fundingStreamName: mockFundingStream.name,
  };
  const mockProviderSnapshot2: ProviderSnapshot = {
    providerSnapshotId: 423623,
    name: "Provider Snapshot Name 423623",
    description: "Provider Snapshot Description 423623",
    version: 51,
    targetDate: new Date(),
    created: new Date(),
    fundingStreamCode: mockFundingStream.id,
    fundingStreamName: mockFundingStream.name,
  };
  const mockCfsSpec: SpecificationSummary = {
    name: "Wizard Training",
    approvalStatus: "",
    description: "Lorem ipsum lalala",
    fundingPeriod: mockFundingPeriod,
    fundingStreams: [mockFundingStream],
    id: "CFS457457",
    isSelectedForFunding: true,
    providerVersionId: mockCoreProvider2.providerVersionId,
    dataDefinitionRelationshipIds: [],
    templateIds: { "stream-547": mockTemplate2.templateVersion },
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
  };
  const mockFdzSpecWithTrackingLatest: SpecificationSummary = {
    name: "Wizard Training With Tracking",
    approvalStatus: "",
    description: "Lorem ipsum lalala",
    fundingPeriod: mockFundingPeriod,
    fundingStreams: [mockFundingStream],
    id: "FDZ4683",
    isSelectedForFunding: true,
    providerSnapshotId: undefined,
    dataDefinitionRelationshipIds: [],
    templateIds: { "stream-547": mockTemplate2.templateVersion },
    coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest,
  };
  const mockFdzSpecWithoutTracking: SpecificationSummary = {
    name: "Wizard Training Without Tracking",
    approvalStatus: "",
    description: "Lorem ipsum blablabla",
    fundingPeriod: mockFundingPeriod,
    fundingStreams: [mockFundingStream],
    id: "FDZ9345",
    isSelectedForFunding: true,
    providerSnapshotId: mockProviderSnapshot2.providerSnapshotId,
    dataDefinitionRelationshipIds: [],
    templateIds: { "stream-547": mockTemplate2.templateVersion },
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
  };

  const mockSpecificationServiceWithDuplicateNameResponse = () => {
    jest.mock("../../../services/specificationService", () => {
      const service = jest.requireActual("../../../services/specificationService");
      return {
        ...service,
        getSpecificationSummaryService: jest.fn(() =>
          Promise.resolve({
            data: mockCfsSpec,
          })
        ),
        getFundingPeriodsByFundingStreamIdService: jest.fn(() =>
          Promise.resolve({
            data: [mockFundingPeriod],
          })
        ),
        createSpecificationService: jest.fn(() =>
          Promise.reject({
            status: 400,
            response: { data: { Name: "unique name error" } },
          })
        ),
      };
    });
  };

  const mockSpecificationService = (mockSpec?: SpecificationSummary) => {
    jest.mock("../../../services/specificationService", () => {
      const service = jest.requireActual("../../../services/specificationService");
      return {
        ...service,
        getSpecificationSummaryService: jest.fn(() =>
          Promise.resolve({
            data: mockSpec,
          })
        ),
        getFundingPeriodsByFundingStreamIdService: jest.fn(() =>
          Promise.resolve({
            data: [mockFundingPeriod],
          })
        ),
        updateSpecificationService: jest.fn(() => Promise.resolve({ status: 200 })),
        createSpecificationService: jest.fn(() =>
          Promise.resolve({
            data: {
              name: "",
              id: "35486792350689",
              approvalStatus: "",
              isSelectedForFunding: true,
              description: "",
              providerVersionId: "",
              fundingStreams: [mockFundingStream],
              fundingPeriod: mockFundingPeriod,
              templateIds: {},
              dataDefinitionRelationshipIds: [],
            },
          })
        ),
      };
    });
  };

  const mockProviderVersionService = () => {
    jest.mock("../../../services/providerVersionService", () => {
      const service = jest.requireActual("../../../services/providerVersionService");

      return {
        ...service,
        getCoreProvidersByFundingStream: jest.fn(() =>
          Promise.resolve({
            data: [mockCoreProvider1, mockCoreProvider2],
          })
        ),
      };
    });
  };

  const mockProviderService = () => {
    jest.mock("../../../services/providerService", () => {
      const service = jest.requireActual("../../../services/providerService");

      return {
        ...service,
        getProviderSnapshotsByFundingStream: jest.fn(() =>
          Promise.resolve({
            data: [mockProviderSnapshot1, mockProviderSnapshot2],
          })
        ),
      };
    });
  };

  let notification: JobNotification | undefined;
  let subscription: JobSubscription = {
    filterBy: {
      jobId: "jobId",
      jobTypes: [],
      specificationId: mockCfsSpec.id,
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
      specificationId: mockCfsSpec.id,
      jobTypes: [job.jobType],
    };
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: job,
    };

    return notification;
  };

  const haveEditSpecificationFailedJobNotification = () => {
    const job = {
      jobId: "jobId-EditSpecification",
      jobType: JobType.EditSpecificationJob,
      statusDescription: "Updating specification",
      jobDescription: "",
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Failed,
      failures: [],
      isSuccessful: false,
      isFailed: true,
      isActive: false,
      isComplete: true,
      outcome: "EditSpecification failed",
    };
    subscription.id = "EditSpecification-sub-id";
    subscription.filterBy = {
      jobId: job.jobId,
      specificationId: mockCfsSpec.id,
      jobTypes: [job.jobType],
    };
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: job,
    };

    return notification;
  };

  const haveCreateSpecJobInProgressNotification = () => {
    subscription.id = "new-spec-sub";
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: {
        isComplete: false,
        jobId: "new-spec-job",
        jobType: JobType.CreateSpecificationJob,
        statusDescription: "Create Specification job is in progress",
        jobDescription: "Create Specification Job",
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

  const haveDatasetMergeJobInProgressNotification = () => {
    subscription.id = "DatasetMerge-sub";
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: {
        isComplete: false,
        jobId: "DatasetMerge-job",
        jobType: JobType.RunConverterDatasetMergeJob,
        statusDescription: "Dataset Merge job is in progress",
        jobDescription: "Dataset Merge Job",
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

  const haveCreateSpecJobCompleteNotification = () => {
    const job = {
      isComplete: true,
      jobId: "new-spec-job",
      jobType: JobType.CreateSpecificationJob,
      statusDescription: "Create Specification job completed successfully",
      jobDescription: "Create Specification Job",
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Succeeded,
      lastUpdate: new Date(),
      failures: [],
      isSuccessful: true,
      isFailed: false,
      isActive: false,
      outcome: "",
    };
    subscription.id = "new-spec-sub";
    subscription.filterBy = {
      jobId: job.jobId,
      jobTypes: [job.jobType],
    };
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: job,
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

  const withNoPermissions: FundingStreamPermissions[] = [
    buildPermissions({
      fundingStreamId: mockFundingStream.id,
      fundingStreamName: mockFundingStream.name,
      setAllPermsEnabled: false,
    }),
  ];
  const withCreatePermissions: FundingStreamPermissions[] = [
    buildPermissions({
      fundingStreamId: mockFundingStream.id,
      fundingStreamName: mockFundingStream.name,
      setAllPermsEnabled: false,
      actions: [(p) => (p.canCreateSpecification = true)],
    }),
  ];

  const withoutPermissions: SpecificationPermissionsResult = {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => false,
    hasMissingPermissions: true,
    isPermissionsFetched: true,
    permissionsEnabled: [],
    permissionsDisabled: [Permission.CanEditSpecification],
    missingPermissions: [Permission.CanEditSpecification],
  };
  const withPermissions: SpecificationPermissionsResult = {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => true,
    hasMissingPermissions: false,
    isPermissionsFetched: true,
    permissionsEnabled: [Permission.CanEditSpecification],
    permissionsDisabled: [],
    missingPermissions: [],
  };
  const hasMissingPermissionToEdit = () => {
    jest
      .spyOn(useSpecificationPermissionsHook, "useSpecificationPermissions")
      .mockImplementation(() => withoutPermissions);
  };

  const hasEditPermissions = () => {
    jest
      .spyOn(useSpecificationPermissionsHook, "useSpecificationPermissions")
      .mockImplementation(() => withPermissions);
  };

  const hasReduxState = (mocks: {
    permissions: FundingStreamPermissions[];
    jobMonitorFilter?: JobMonitoringFilter;
  }) => {
    const state: IStoreState = {
      featureFlags: {
        templateBuilderVisible: false,
        releaseTimetableVisible: false,
        enableReactQueryDevTool: false,
        specToSpec: false,
        profilingPatternVisible: undefined,
        enableNewFundingManagement: false,
      },
      fundingSearchSelection: { searchCriteria: undefined, selectedProviderIds: [] },
      userState: {
        isLoggedIn: true,
        userName: "test-user",
        hasConfirmedSkills: true,
        fundingStreamPermissions: mocks.permissions,
      },
      jobObserverState: { jobFilter: mocks.jobMonitorFilter },
    };
    useSelectorSpy.mockImplementation((callback) => {
      return callback(state);
    });
  };

  async function waitForPageToLoad() {
    const { getSpecificationSummaryService } = require("../../../services/specificationService");
    const { getPublishedTemplatesByStreamAndPeriod } = require("../../../services/policyService");
    const { getFundingConfiguration } = require("../../../services/policyService");
    const { getCoreProvidersByFundingStream } = require("../../../services/providerVersionService");

    await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1));
    await waitFor(() => expect(getFundingConfiguration).toBeCalledTimes(1));
    await waitFor(() => expect(getCoreProvidersByFundingStream).toBeCalledTimes(1));
    await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
  }

  return {
    renderCreateSpecificationPage,
    renderEditSpecificationPageWithJobRunning: renderEditSpecificationPage,
    renderEditSpecificationPage: renderLoadedEditSpecificationPage,
    mockPolicyService,
    mockSpecificationService,
    mockSpecificationServiceWithDuplicateNameResponse,
    mockProviderVersionService,
    mockProviderService,
    haveNoJobNotification,
    haveCreateSpecJobCompleteNotification,
    haveCreateSpecJobInProgressNotification,
    haveEditSpecificationFailedJobNotification,
    haveRefreshFailedJobNotification,
    haveDatasetMergeJobInProgressNotification,
    getNotificationCallback,
    specificationCfs: mockCfsSpec,
    specificationFdzWithoutTracking: mockFdzSpecWithoutTracking,
    specificationFdzWithTrackingLatest: mockFdzSpecWithTrackingLatest,
    fundingStream: mockFundingStream,
    fundingPeriod: mockFundingPeriod,
    template1: mockTemplate1,
    template2: mockTemplate2,
    coreProvider1: mockCoreProvider1,
    coreProvider2: mockCoreProvider2,
    providerSnapshot1: mockProviderSnapshot1,
    providerSnapshot2: mockProviderSnapshot2,
    withCreatePermissions,
    hasEditPermissions,
    withNoPermissions,
    hasMissingPermissionToEdit,
    mockGetFundingConfigurationCall,
    mockGetFundingStreamsCall,
    mockGetPublishedTemplatesByStreamAndPeriodCall,
    waitForPageToLoad,
    hasReduxState,
  };
}
