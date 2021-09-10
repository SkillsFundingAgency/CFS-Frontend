import "@testing-library/jest-dom/extend-expect";

import {render, screen, waitFor} from "@testing-library/react";
import {DateTime} from "luxon";
import React from "react";
import {QueryClient, QueryClientProvider} from "react-query";
import * as redux from "react-redux";
import {Provider} from "react-redux";
import {MemoryRouter, Route, Switch} from "react-router";
import {Store,createStore} from "redux";

import * as useCalculationErrorsHook from "../../../hooks/Calculations/useCalculationErrors";
import * as jobSubscriptionHook from "../../../hooks/Jobs/useJobSubscription";
import {AddJobSubscription, JobNotification, JobSubscription} from "../../../hooks/Jobs/useJobSubscription";
import * as latestJobHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as specPermsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {JobObserverState} from "../../../states/JobObserverState";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {
  CalculationError,
  CalculationErrorQueryResult,
  DatasetDataType,
  ObsoleteItemType
} from "../../../types/Calculations/CalculationError";
import {CompletionStatus} from "../../../types/CompletionStatus";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {DatasetRelationship} from "../../../types/DatasetRelationship";
import {FundingConfiguration} from "../../../types/FundingConfiguration";
import {JobType} from "../../../types/jobType";
import {UpdateCoreProviderVersion} from "../../../types/Provider/UpdateCoreProviderVersion";
import {RunningStatus} from "../../../types/RunningStatus";
import {ProviderDataTrackingMode} from "../../../types/Specifications/ProviderDataTrackingMode";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {fullSpecPermissions} from "../../fakes/testFactories";

const store: Store<IStoreState> = createStore(rootReducer);

store.dispatch = jest.fn();

export function ViewSpecificationTestData() {
  const useSelectorSpy = jest.spyOn(redux, "useSelector");

  jest.mock("../../../components/AdminNav");

  jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useSelector: jest.fn(() => ({
      releaseTimetableVisible: false,
    })),
  }));

  const mockFundingStream: FundingStream = {
    id: "f1",
    name: "Fund 1",
  };
  const mockFundingPeriod: FundingPeriod = {
    id: "fp123",
    name: "Funding Period 123",
  };
  const mockSpec: SpecificationSummary = {
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    name: "A Test Spec Name",
    id: "SPEC123",
    approvalStatus: "Draft",
    isSelectedForFunding: false,
    description: "Test Description",
    providerVersionId: "PROVID123",
    fundingStreams: [{ id: mockFundingStream.id, name: mockFundingStream.name }],
    fundingPeriod: {
      id: mockFundingPeriod.id,
      name: mockFundingPeriod.name,
    },
    templateIds: {},
    dataDefinitionRelationshipIds: [],
  };
  const mockSpecApproved: SpecificationSummary = {
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    name: "A Test Spec Name",
    id: "SPEC123",
    approvalStatus: "Approved",
    isSelectedForFunding: false,
    description: "Test Description",
    providerVersionId: "PROVID123",
    fundingStreams: [{ id: mockFundingStream.id, name: mockFundingStream.name }],
    fundingPeriod: {
      id: mockFundingPeriod.id,
      name: mockFundingPeriod.name,
    },
    templateIds: {},
    dataDefinitionRelationshipIds: [],
  };

  const calcErr: CalculationError = {
    datasetDatatype: DatasetDataType.String,
    datasetFieldId: "",
    datasetFieldName: "",
    datasetRelationshipId: "",
    datasetRelationshipName: "",
    fundingLineName: "",
    isReleasedData: false,
    codeReference: "",
    enumValueName: "",
    fundingLineId: undefined,
    fundingStreamId: mockFundingStream.id,
    id: "",
    itemType: ObsoleteItemType.Calculation,
    specificationId: "Spec123",
    additionalCalculations: [],
    templateCalculations: [],
    title: "",
    templateCalculationId: 1
  };
  const calculationErrorsResult: CalculationErrorQueryResult = {
    clearCalculationErrorsFromCache(): Promise<void> {
      return Promise.resolve(undefined);
    },
    errorCheckingForCalculationErrors: null,
    calculationErrors: [calcErr],
    isLoadingCalculationErrors: false,
    haveErrorCheckingForCalculationErrors: false,
    areCalculationErrorsFetched: false,
    isFetchingCalculationErrors: false,
    calculationErrorCount: 1,
  };
  const calculationNoErrorsResult: CalculationErrorQueryResult = {
    clearCalculationErrorsFromCache(): Promise<void> {
      return Promise.resolve(undefined);
    },
    errorCheckingForCalculationErrors: null,
    calculationErrors: [],
    isLoadingCalculationErrors: false,
    haveErrorCheckingForCalculationErrors: false,
    areCalculationErrorsFetched: false,
    isFetchingCalculationErrors: false,
    calculationErrorCount: 0,
  };
  const hasNoCalcErrors = () => {
    jest
      .spyOn(useCalculationErrorsHook, "useCalculationErrors")
      .mockImplementation(() => calculationNoErrorsResult);
  };

  const hasCalcErrors = () => {
    jest
      .spyOn(useCalculationErrorsHook, "useCalculationErrors")
      .mockImplementation(() => calculationErrorsResult);
  };

  let notification: JobNotification | undefined;
  let subscription: JobSubscription = {
    filterBy: {
      jobId: "jobId",
      jobTypes: [],
      specificationId: mockSpec.id,
    },
    id: "sertdhw4e5t",
    isEnabled: true,
    onError: () => {},
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
      specificationId: mockSpec.id,
      jobTypes: [job.jobType],
    };
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: job,
    };

    return notification;
  };
  const haveConverterJobInProgressNotification = () => {
    subscription.id = "converter";
    notification = {
      subscription: subscription as JobSubscription,
      latestJob: {
        isComplete: false,
        jobId: "123",
        jobType: JobType.RunConverterDatasetMergeJob,
        statusDescription: "Converter job is in progress",
        jobDescription: "Converter Job",
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
  const haveReportJobCompleteNotification = () => {
    const job = {
      isComplete: true,
      jobId: "123",
      jobType: JobType.ConverterWizardActivityCsvGenerationJob,
      statusDescription: "Converter report generation job completed successfully",
      jobDescription: "Converter Wizard Report Job",
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Succeeded,
      lastUpdate: new Date(),
      failures: [],
      isSuccessful: true,
      isFailed: false,
      isActive: false,
      outcome: "",
    };
    subscription.id = "report";
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
  jobSubscriptionSpy.mockImplementation(({ onError, onNewNotification, isEnabled }) => {
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
      replaceSubs: (requests: AddJobSubscription[]) => {
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
      removeSub: (request) => {},
      removeAllSubs: () => {},
      subs: [],
      results: notification ? [notification] : [],
    };
  });

  const jobMonitorSpy = jest.spyOn(latestJobHook, "useLatestSpecificationJobWithMonitoring");
  const hasNoLatestJob = () => {
    jobMonitorSpy.mockImplementation(() => {
      return {
        hasJob: false,
        isCheckingForJob: false,
        latestJob: undefined,
        isFetched: true,
        isFetching: false,
        isMonitoring: true,
      };
    });
  };

  function mockSpecificationPermissions(
    expectedSpecificationPermissionsResult?: SpecificationPermissionsResult
  ) {
    jest
      .spyOn(specPermsHook, "useSpecificationPermissions")
      .mockImplementation(() =>
        expectedSpecificationPermissionsResult ? expectedSpecificationPermissionsResult : fullSpecPermissions
      );
  }

  const mockFundingConfiguration: FundingConfiguration = {
    fundingStreamId: mockFundingStream.id,
    fundingPeriodId: mockFundingPeriod.id,
    approvalMode: ApprovalMode.All,
    providerSource: ProviderSource.CFS,
    defaultTemplateVersion: "",
    enableConverterDataMerge: true,
    updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
  };

  function fundingConfigurationSpy() {
    jest.spyOn(fundingConfigurationHook, "useFundingConfiguration").mockImplementation(() => ({
      fundingConfiguration: mockFundingConfiguration,
      isLoadingFundingConfiguration: false,
      isErrorLoadingFundingConfiguration: false,
      errorLoadingFundingConfiguration: "",
    }));
  }

  const renderViewSpecificationPage = async () => {
    const { ViewSpecification } = require("../../../pages/Specifications/ViewSpecification");
    const component = render(
      <MemoryRouter initialEntries={[`/ViewSpecification/${mockSpec.id}`]}>
        <QueryClientProvider client={new QueryClient()}>
          <Provider store={store}>
            <Switch>
              <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
            </Switch>
          </Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: mockSpec.name })).toBeInTheDocument();
    });
    return component;
  };

  const renderViewApprovedSpecificationPage = async () => {
    const { ViewSpecification } = require("../../../pages/Specifications/ViewSpecification");
    const component = render(
      <MemoryRouter initialEntries={[`/ViewSpecification/${mockSpecApproved.id}`]}>
        <QueryClientProvider client={new QueryClient()}>
          <Provider store={store}>
            <Switch>
              <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
            </Switch>
          </Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: mockSpecApproved.name })).toBeInTheDocument();
    });
    return component;
  };

  const mockNoJobObserverState: JobObserverState = {
    jobFilter: undefined,
  };
  const hasNoJobObserverState = () => {
    useSelectorSpy.mockReturnValue(mockNoJobObserverState);
  };

  const mockPublishService = () => {
    jest.mock("../../../services/publishService", () => {
      const service = jest.requireActual("../../../services/publishService");
      return {
        ...service,
        refreshSpecificationFundingService: jest.fn(() =>
          Promise.resolve({
            status: 200,
            data: "jobId-generatedByRefresh",
          })
        ),
      };
    });
  };

  const mockSpecificationService = () => {
    jest.mock("../../../services/specificationService", () => {
      const service = jest.requireActual("../../../services/specificationService");
      return {
        ...service,
        getSpecificationSummaryService: jest.fn(() =>
          Promise.resolve({
            data: mockSpec,
          })
        ),
        getProfileVariationPointersService: jest.fn(() =>
          Promise.resolve({
            data: [
              {
                fundingStreamId: mockFundingStream.id,
                fundingLineId: "test",
                periodType: "test",
                typeValue: "test",
                year: 1,
                occurrence: 1,
              },
            ],
          })
        ),
        getSpecificationsSelectedForFundingByPeriodAndStreamService: jest.fn(() =>
          Promise.resolve({
            data: [],
          })
        ),
        getSpecificationsByFundingPeriodAndStreamIdWithResultsService: jest.fn(() =>
          Promise.resolve({
            data: [{}],
          })
        ),
      };
    });
  };

  const mockApprovedSpecificationService = () => {
    jest.mock("../../../services/specificationService", () => {
      const service = jest.requireActual("../../../services/specificationService");
      return {
        ...service,
        getSpecificationSummaryService: jest.fn(() =>
          Promise.resolve({
            data: mockSpecApproved,
          })
        ),
        getProfileVariationPointersService: jest.fn(() =>
          Promise.resolve({
            data: [
              {
                fundingStreamId: mockFundingStream.id,
                fundingLineId: "test",
                periodType: "test",
                typeValue: "test",
                year: 1,
                occurrence: 1,
              },
            ],
          })
        ),
        getSpecificationsSelectedForFundingByPeriodAndStreamService: jest.fn(() =>
          Promise.resolve({
            data: [],
          })
        ),
      };
    });
  };

  const mockFundingLineStructureService = () => {
    jest.mock("../../../services/fundingStructuresService", () => {
      const fundingLineStructureService = jest.requireActual("../../../services/fundingStructuresService");
      return {
        ...fundingLineStructureService,
        getFundingLineStructureService: jest.fn(() =>
          Promise.resolve({
            data: [
              {
                level: 1,
                name: "",
                calculationId: "",
                calculationPublishStatus: "",
                type: undefined,
                fundingStructureItems: [],
                parentName: "",
                expanded: false,
              },
            ],
          })
        ),
      };
    });
  };

  const mockDatasetBySpecificationIdService = () => {
    jest.mock("../../../services/datasetService", () => {
      const datasetService = jest.requireActual("../../../services/datasetService");
      return {
        ...datasetService,
        getDatasetsBySpecification: jest.fn(() =>
          Promise.resolve([
            {
              definition: {
                description: "",
                id: "",
                name: "definition1",
              },
              relationshipDescription: "",
              isProviderData: false,
              converterEligible: false,
              converterEnabled: false,
              id: "",
              name: "",
            },
            {
              definition: {
                description: "",
                id: "",
                name: "definition2",
              },
              relationshipDescription: "",
              isProviderData: false,
              converterEligible: true,
              converterEnabled: false,
              id: "Con123",
              name: "",
            },
          ] as DatasetRelationship[])
        ),
      };
    });
  };

  const mockCalculationService = () => {
    jest.mock("../../../services/calculationService", () => {
      const calculationService = jest.requireActual("../../../services/calculationService");
      return {
        ...calculationService,
        getCalculationSummaryBySpecificationId: jest.fn(() =>
          Promise.resolve({
            data: [],
          })
        ),
        getCalculationCircularDependencies: jest.fn(() =>
          Promise.resolve({
            data: [],
          })
        ),
      };
    });
  };

  const mockCalculationWithDraftCalculationsService = () => {
    jest.mock("../../../services/calculationService", () => {
      const calculationService = jest.requireActual("../../../services/calculationService");
      return {
        ...calculationService,
        getCalculationSummaryBySpecificationId: jest.fn(() =>
          Promise.resolve({
            data: [
              {
                calculationType: "Additional",
                status: "Draft",
              },
            ],
          })
        ),
        getCalculationCircularDependencies: jest.fn(() =>
          Promise.resolve({
            data: [],
          })
        ),
      };
    });
  };

  return {
    mockSpec,
    notification,
    getNotificationCallback,
    hasCalcErrors,
    haveRefreshFailedJobNotification,
    haveConverterJobInProgressNotification,
    haveReportJobCompleteNotification,
    haveNoJobNotification,
    hasNoCalcErrors,
    hasNoLatestJob,
    fundingConfigurationSpy,
    mockSpecificationPermissions,
    renderViewSpecificationPage,
    renderViewApprovedSpecificationPage,
    mockPublishService,
    mockSpecificationService,
    mockApprovedSpecificationService,
    mockFundingLineStructureService,
    mockDatasetBySpecificationIdService,
    mockCalculationService,
    mockCalculationWithDraftCalculationsService,
    hasNoJobObserverState,
  };
}
