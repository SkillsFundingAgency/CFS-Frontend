import { CompletionStatus } from "../../types/CompletionStatus";
import { JobDetails } from "../../types/jobDetails";
import { JobType } from "../../types/jobType";
import { FundingStreamPeriodProfilePattern } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { ProviderTransactionSummary } from "../../types/ProviderSummary";
import { RunningStatus } from "../../types/RunningStatus";
import { ProviderDataTrackingMode } from "../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../types/viewFundingTypes";

const makeSpecificationSummary = (overrides: Partial<SpecificationSummary> = {}): SpecificationSummary => {
  return {
    id: "WIZ111",
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    name: "Wizard Training",
    approvalStatus: "Draft",
    description: "Training in potions, spells, dark arts, card tricks and Quidditch",
    fundingPeriod: {
      id: "FP-111",
      name: "2019-20",
    },
    fundingStreams: [
      {
        name: "FS-111",
        id: "Wizard Training Scheme",
      },
    ],
    isSelectedForFunding: true,
    providerVersionId: "",
    templateIds: {},
    dataDefinitionRelationshipIds: [],
    ...overrides,
  };
};

const makeFundingStream = (overrides: Partial<FundingStream>): FundingStream => {
  return {
    name: "Stream-111",
    id: "Wizard Training Scheme",
    ...overrides,
  };
};

const makeFundingPeriod = (overrides: Partial<FundingPeriod>): FundingPeriod => {
  return {
    name: "Period-111",
    id: "2020-2047",
    ...overrides,
  };
};

const makeSuccessfulJob = (overrides: Partial<JobDetails>): JobDetails => {
  return {
    jobId: "successful-job-id",
    jobType: JobType.RunConverterDatasetMergeJob,
    statusDescription: "Create Specification job completed successfully",
    jobDescription: "Create Specification Job",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Succeeded,
    lastUpdated: new Date(),
    failures: [],
    isComplete: true,
    isSuccessful: true,
    isFailed: false,
    isActive: false,
    outcome: "Job succeeded",
    ...overrides,
  };
};
const makeFailedJob = (overrides: Partial<JobDetails>): JobDetails => {
  return {
    jobId: "failed-job-id",
    jobType: JobType.RunConverterDatasetMergeJob,
    statusDescription: "Job description",
    jobDescription: "",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Failed,
    failures: [],
    isSuccessful: false,
    isFailed: true,
    isActive: false,
    isComplete: true,
    outcome: "Job failed",
    ...overrides,
  };
};

const makeFundingStreamPeriodProfilePattern = (
  overrides: Partial<FundingStreamPeriodProfilePattern>
): FundingStreamPeriodProfilePattern => {
  return {
    id: "Period-111-Stream-111-Line-111-Key-111",
    fundingPeriodId: "Period-111",
    fundingStreamId: "Stream-111",
    fundingLineId: "Line-111",
    profilePatternKey: "Key-111",
    profilePatternDisplayName: "Period-111 funding",
    profilePatternDescription: "description-111",
    roundingStrategy: "rounding",
    fundingStreamPeriodStartDate: new Date(),
    fundingStreamPeriodEndDate: new Date(),
    profilePattern: [],
    providerTypeSubTypes: [],
    reProfilePastPeriods: false,
    calculateBalancingPayment: false,
    allowUserToEditProfilePattern: false,
    ...overrides,
  };
};

const makeProviderTransactionSummary = (
  overrides: Partial<ProviderTransactionSummary>
): ProviderTransactionSummary => {
  return {
    status: 2,
    results: [
      {
        providerId: "provider-id",
        status: "Approved",
        majorVersion: 0,
        minorVersion: 1,
        totalFunding: "123",
        channelCode: "",
        channelName: "Channel",
        dateChanged: new Date().toLocaleDateString(),
        author: "author",
        variationReasons: ["variation-reason-1"],
      },
    ],
    fundingTotal: "123,000",
    latestStatus: "Approved",
    ...overrides,
  };
};

export const fakery = {
  makeSpecificationSummary,
  makeFundingStream,
  makeFundingPeriod,
  makeSuccessfulJob,
  makeFailedJob,
  makeFundingStreamPeriodProfilePattern,
  makeProviderTransactionSummary,
};
