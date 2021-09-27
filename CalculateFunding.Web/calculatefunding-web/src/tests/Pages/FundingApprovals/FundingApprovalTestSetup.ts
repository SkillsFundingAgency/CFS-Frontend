import { createStore, Store } from "redux";

import { getJobDetailsFromJobResponse } from "../../../helpers/jobDetailsHelper";
import * as jobHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import { LatestSpecificationJobWithMonitoringResult } from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import { FundingConfigurationQueryResult } from "../../../hooks/useFundingConfiguration";
import * as specHook from "../../../hooks/useSpecificationSummary";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { CompletionStatus } from "../../../types/CompletionStatus";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { JobCreatedResponse } from "../../../types/JobCreatedResponse";
import { JobOutcomeType } from "../../../types/jobDetails";
import { JobType } from "../../../types/jobType";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { BatchUploadResponse } from "../../../types/PublishedProvider/BatchUploadResponse";
import { RunningStatus } from "../../../types/RunningStatus";
import { FundingStreamWithSpecificationSelectedForFunding } from "../../../types/SpecificationSelectedForFunding";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";

const store: Store<IStoreState> = createStore(rootReducer);

store.dispatch = jest.fn();

export const FundingApprovalTestSetup = () => {
  jest.mock("../../../components/AdminNav");
  const fundingStream1: FundingStream = {
    name: "WIZZ1",
    id: "Wizard Training Scheme",
  };
  const fundingStream2: FundingStream = {
    name: "DRK1",
    id: "Dark Arts Programme",
  };
  const fundingPeriod1: FundingPeriod = {
    id: "FP123",
    name: "2019-20",
  };
  const fundingPeriod2: FundingPeriod = {
    id: "FP124",
    name: "2020-21",
  };
  const mockSelectionData: FundingStreamWithSpecificationSelectedForFunding[] = [
    {
      id: fundingStream1.id,
      name: "Wizard Funding Stream",
      periods: [
        {
          id: fundingPeriod1.id,
          name: fundingPeriod1.name,
          specifications: [{ id: "ABC123", name: "Wizard Training" }],
        },
      ],
    },
    {
      id: "DRK",
      name: fundingStream2.name,
      periods: [
        {
          id: fundingPeriod2.id,
          name: fundingPeriod2.name,
          specifications: [{ id: "ABC123", name: "Dark Arts" }],
        },
      ],
    },
  ];
  const testSpec1: SpecificationSummary = {
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: fundingPeriod1,
    fundingStreams: [fundingStream1],
    id: "ABC123",
    isSelectedForFunding: true,
    providerVersionId: "",
    dataDefinitionRelationshipIds: [],
    templateIds: {},
    coreProviderVersionUpdates: undefined,
    providerSnapshotId: 34,
  };
  const testSpec2: SpecificationSummary = {
    name: "Dark Arts",
    approvalStatus: "",
    description: "",
    fundingPeriod: fundingPeriod2,
    fundingStreams: [fundingStream2],
    id: "XYZ123",
    isSelectedForFunding: true,
    providerVersionId: "",
    dataDefinitionRelationshipIds: [],
    templateIds: {},
    coreProviderVersionUpdates: undefined,
    providerSnapshotId: 42,
  };
  const mockFundingConfigWithApprovalBatchMode: FundingConfigurationQueryResult = {
    fundingConfiguration: {
      approvalMode: ApprovalMode.Batches,
      providerSource: ProviderSource.CFS,
      defaultTemplateVersion: "1.1",
      fundingPeriodId: fundingPeriod2.id,
      fundingStreamId: fundingStream2.id,
      enableConverterDataMerge: false,
      updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
    },
    isLoadingFundingConfiguration: false,
    isErrorLoadingFundingConfiguration: false,
    errorLoadingFundingConfiguration: "",
  };
  const mockFundingConfigWithApprovalAllMode: FundingConfigurationQueryResult = {
    fundingConfiguration: {
      approvalMode: ApprovalMode.All,
      providerSource: ProviderSource.CFS,
      defaultTemplateVersion: "1.1",
      fundingPeriodId: fundingPeriod1.id,
      fundingStreamId: fundingStream1.id,
      enableConverterDataMerge: false,
      updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
    },
    isLoadingFundingConfiguration: false,
    isErrorLoadingFundingConfiguration: false,
    errorLoadingFundingConfiguration: "",
  };
  const batchUploadResponse: BatchUploadResponse = { batchId: "asdgasfgwer", url: "" };
  const jobCreatedResponse: JobCreatedResponse = { jobId: "rtyg453645724" };
  const getPublishedProvidersByBatchResponse: string[] = ["provider123"];

  const mockUploadFileService = jest.fn(() =>
    Promise.resolve({
      data: batchUploadResponse,
      status: 200,
    })
  );
  const mockCreateValidationJobService = jest.fn(() =>
    Promise.resolve({
      data: jobCreatedResponse,
      status: 200,
    })
  );
  const mockGetPublishedProvidersByBatchService = jest.fn(() =>
    Promise.resolve({
      data: getPublishedProvidersByBatchResponse,
      status: 200,
    })
  );
  const noJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: false,
    isCheckingForJob: false,
    latestJob: undefined,
    isFetched: true,
    isFetching: false,
  };
  const activeApprovalJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
      jobId: "dfgwer",
      jobType: JobType.ApproveAllProviderFundingJob,
      runningStatus: RunningStatus.InProgress,
      invokerUserDisplayName: "testUser",
      created: new Date(),
      lastUpdated: new Date(),
      trigger: {
        message: "",
        entityId: "",
        entityType: "",
      },
      outcomes: [],
    }),
    isFetched: true,
    isFetching: false,
  };
  const activeValidationJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
      jobId: jobCreatedResponse.jobId,
      jobType: JobType.BatchPublishedProviderValidationJob,
      runningStatus: RunningStatus.InProgress,
      outcome: "xxx",
      invokerUserDisplayName: "testUser",
      created: new Date(),
      lastUpdated: new Date(),
      trigger: {
        message: "",
        entityId: "",
        entityType: "",
      },
      outcomes: [],
    }),
    isFetched: true,
    isFetching: false,
  };
  const successfulValidationJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
      jobId: jobCreatedResponse.jobId,
      jobType: JobType.BatchPublishedProviderValidationJob,
      outcome: "Succeeded successfully",
      outcomes: [],
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Succeeded,
      invokerUserDisplayName: "testUser",
      created: new Date(),
      lastUpdated: new Date(),
      trigger: {
        message: "",
        entityId: "",
        entityType: "",
      },
    }),
    isFetched: true,
    isFetching: false,
  };
  const failedValidationJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobResponse({
      jobId: jobCreatedResponse.jobId,
      jobType: JobType.BatchPublishedProviderValidationJob,
      runningStatus: RunningStatus.Completed,
      completionStatus: CompletionStatus.Failed,
      outcome: "xxx",
      outcomes: [
        {
          description: "Missing name field",
          isSuccessful: false,
          jobType: JobType.CreateInstructAllocationJob,
          type: JobOutcomeType.Failed,
        },
      ],
      invokerUserDisplayName: "testUser",
      created: new Date(),
      lastUpdated: new Date(),
      trigger: {
        message: "",
        entityId: "",
        entityType: "",
      },
    }),
    isFetched: true,
    isFetching: false,
  };

  const mockPublishedProviderService = () => {
    jest.mock("../../../services/publishedProviderService", () => {
      const mockService = jest.requireActual("../../../services/publishedProviderService");

      return {
        ...mockService,
        uploadBatchOfPublishedProviders: mockUploadFileService,
        validatePublishedProvidersByBatch: mockCreateValidationJobService,
        getPublishedProvidersByBatch: mockGetPublishedProvidersByBatchService,
      };
    });
  };

  const hasNoActiveJobsRunning = () =>
    jest.spyOn(jobHook, "useLatestSpecificationJobWithMonitoring").mockImplementation(() => noJob);
  const hasLatestJob = (job: LatestSpecificationJobWithMonitoringResult) =>
    jest.spyOn(jobHook, "useLatestSpecificationJobWithMonitoring").mockImplementation(() => job);
  const hasFundingConfigWithApproveBatchMode = () =>
    jest
      .spyOn(fundingConfigurationHook, "useFundingConfiguration")
      .mockImplementation(() => mockFundingConfigWithApprovalBatchMode);
  const hasFundingConfigWithApproveAllMode = () =>
    jest
      .spyOn(fundingConfigurationHook, "useFundingConfiguration")
      .mockImplementation(() => mockFundingConfigWithApprovalAllMode);
  const testSpec: SpecificationSummary = {
    name: "test spec name",
    id: "3567357",
    approvalStatus: "Cal",
    isSelectedForFunding: true,
    description: "sgdsg",
    providerVersionId: "sgds",
    fundingStreams: [],
    fundingPeriod: { id: "", name: "" },
    dataDefinitionRelationshipIds: [],
    templateIds: {},
    coreProviderVersionUpdates: undefined,
    providerSnapshotId: undefined,
  };
  const hasSpecification = () =>
    jest.spyOn(specHook, "useSpecificationSummary").mockImplementation(() => ({
      specification: testSpec,
      isLoadingSpecification: false,
      errorCheckingForSpecification: null,
      haveErrorCheckingForSpecification: false,
      isFetchingSpecification: false,
      isSpecificationFetched: true,
      clearSpecificationFromCache: () => Promise.resolve(),
    }));

  return {
    mockPublishedProviderService,
    mockCreateValidationJobService,
    mockUploadFileService,
    mockFundingConfigWithApprovalBatchMode,
    mockFundingConfigWithApprovalAllMode,
    mockSelectionData,
    mockGetPublishedProvidersByBatchService,
    hasNoActiveJobsRunning,
    hasLatestJob,
    hasFundingConfigWithApproveBatchMode,
    hasFundingConfigWithApproveAllMode,
    hasSpecification,
    failedValidationJob,
    successfulValidationJob,
    activeApprovalJob,
    activeValidationJob,
    testSpec1,
    testSpec2,
    noJob,
    fundingStream1,
    fundingPeriod1,
    fundingStream2,
    fundingPeriod2,
  };
};
