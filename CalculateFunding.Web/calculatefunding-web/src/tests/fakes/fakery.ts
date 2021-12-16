import { ProviderDataTrackingMode } from "../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../types/viewFundingTypes";
import {JobDetails} from "../../types/jobDetails";
import {JobType} from "../../types/jobType";
import {RunningStatus} from "../../types/RunningStatus";
import {CompletionStatus} from "../../types/CompletionStatus";

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
    ...overrides
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
    ...overrides
  };
};

export const fakery = { makeSpecificationSummary, makeFundingStream, makeFundingPeriod, makeSuccessfulJob, makeFailedJob };
