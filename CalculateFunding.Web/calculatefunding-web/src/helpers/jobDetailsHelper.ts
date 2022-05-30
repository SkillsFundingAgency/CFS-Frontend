import * as R from "ramda";
import { compose } from "redux";

import { JobTypeNotificationSetting } from "../components/Jobs/JobNotificationSection";
import { CompletionStatus } from "../types/CompletionStatus";
import { JobDetails, JobFailure, JobOutcomeType, JobResponse } from "../types/jobDetails";
import { JobNotification } from "../types/Jobs/JobSubscriptionModels";
import { JobType } from "../types/jobType";
import { RunningStatus } from "../types/RunningStatus";

export const sortByLatest = R.sort<JobDetails>(R.descend((job) => job?.lastUpdated ?? new Date(0)));

export const getLatestJob = compose<JobDetails | undefined>(R.head, sortByLatest);

export const isJobTypeIn =
  (validJobTypes: JobType[]) =>
  (jobTypeString: string): boolean =>
    validJobTypes.includes(getJobType(jobTypeString));

export const isJobWithTypeIn =
  (validJobTypes: JobType[]) =>
  (job: JobDetails): boolean =>
    !!job?.jobType && isJobTypeIn(validJobTypes)(getJobType(job.jobType));

export const hasJobWithJobTypeIn = (validJobTypes: JobType[]) => (notification: JobNotification) =>
  !!notification.latestJob?.jobType?.length &&
  isJobTypeIn(validJobTypes)(notification.latestJob.jobType as string);

export const isSuccessfulJob = (job: JobDetails | undefined): boolean => !!job?.isSuccessful;

export const isActiveJob = (job: JobDetails | undefined): boolean => !!job?.isActive;

export const hasSuccessfulJob = (notification: JobNotification): boolean =>
  !!notification.latestJob?.isSuccessful;

export const isJobEnabledForNotification = (
  job: JobDetails,
  settings: JobTypeNotificationSetting[] | undefined
): boolean => {
  if (!settings) return true;
  const setting = settings?.find(
    (s) =>
      (s.jobTypes.some((t) => t === job.jobType) || s.jobTypes.length === 0) &&
      ((job.isActive && s.showActive) ||
        (job.isFailed && s.showFailed) ||
        (job.isSuccessful && s.showSuccessful))
  );
  return !!setting;
};

export const firstSuccessfulJob = (jobs: JobDetails[]) => (jobTypes: JobType[]) =>
  R.head(jobs.filter(isJobWithTypeIn(jobTypes)).filter(isSuccessfulJob));

export const firstActiveJob = (jobs: JobDetails[]) => (jobTypes: JobType[]) =>
  R.head(jobs.filter(isJobWithTypeIn(jobTypes)).filter(isActiveJob));

export const firstJobWithType = (jobs: JobDetails[]) => (jobTypes: JobType[]) =>
  jobs.find((job) => isJobTypeIn(jobTypes)(job.jobType as string));

export const findJobWithId = (jobs: JobDetails[]) => (jobId: string) =>
  jobs.find((job) => job.jobId === jobId);

export const extractJobsSortedByLatest = (notifications: JobNotification[]) =>
  sortByLatest(extractJobsFromNotifications(notifications));

export const removeDuplicateJobsById = R.uniqBy<JobDetails, string>((j) => j?.jobId);

export const removeInvalidJobs = R.filter<JobDetails>((a): a is JobDetails => !!a);

export const activeJobs = R.filter<JobDetails>((j) => j.isActive);

export const failedJobs = R.filter<JobDetails>((j) => j.isFailed);

export const successfulJobs = R.filter<JobDetails>((j) => j.isSuccessful);

export const extractJobsFromNotification = (n: JobNotification): JobDetails[] =>
  n.latestJob ? [n.latestJob] : ([] as JobDetails[]);

export const extractJobsFromNotifications = R.chain<JobNotification, JobDetails>(extractJobsFromNotification);

export function getJobDetailsFromJobResponse(job: JobResponse | undefined): JobDetails | undefined {
  if (!job) return undefined;

  const result: JobDetails = {
    jobId: job.jobId,
    jobDescription: buildDescription(job.jobType, job.trigger?.message),
    statusDescription: "",
    outcome: job.outcome ? job.outcome : "",
    failures: [],
    isSuccessful: false,
    isActive: false,
    isComplete: false,
    isFailed: false,
    completionStatus: job.completionStatus,
    runningStatus: job.runningStatus,
    created: job.created,
    lastUpdated: job.lastUpdated,
    invokerUserDisplayName: job.invokerUserDisplayName,
    invokerUserId: job.invokerUserId,
    jobType: job.jobType,
    parentJobId: job.parentJobId,
    specificationId: job.specificationId,
    triggeredByEntityId: job.trigger?.entityId,
    trigger: job.trigger,
  };

  if (job.outcomes?.length) {
    result.failures = job.outcomes
      .filter((j) => !j.isSuccessful && j.type?.length)
      .map<JobFailure>((x) => {
        return {
          description: x.description,
          type: x.type,
          jobType: x.jobType,
          jobDescription: getJobProgressMessage(x.jobType),
        };
      });
    if (result.failures?.length && (!result.outcome || result.outcome.length === 0)) {
      const hasValidationError = result.failures.some((e) => e.type === JobOutcomeType.ValidationError);
      result.outcome =
        result.failures.length === 1 ? "One of the job steps failed" : "Some of the job steps failed";
      if (hasValidationError) {
        result.outcome += " due to validation";
      }
    }
  }

  setStatusFields(result);

  return result;
}

export function getJobType(jobTypeString: string): JobType {
  return JobType[jobTypeString as keyof typeof JobType];
}

function buildDescription(jobType: string, message: string | undefined) {
  const descFromJobType = getJobProgressMessage(jobType).trim();
  const haveDescFromJobType = descFromJobType && descFromJobType.length > 0;
  const descFromServer = message && message.length > 0 ? message.trim().replace(/[\W_]+/g, " ") : "";
  const haveDescFromServer = descFromServer && descFromServer.length > 0;
  const same =
    descFromJobType &&
    descFromServer &&
    (descFromJobType.toLowerCase() == descFromServer.toLowerCase() ||
      descFromServer.includes(descFromJobType));
  return haveDescFromJobType && haveDescFromServer
    ? same
      ? descFromServer
      : `${descFromJobType}: ${descFromServer}`
    : haveDescFromJobType && !haveDescFromServer
    ? descFromJobType
    : !haveDescFromJobType && haveDescFromServer
    ? descFromServer
    : "";
}

function setStatusFields(job: JobDetails) {
  switch (job.runningStatus) {
    case RunningStatus.Queued:
    case RunningStatus.QueuedWithService:
      job.statusDescription = "in queue";
      job.isActive = true;
      break;
    case RunningStatus.InProgress:
      job.statusDescription = "in progress";
      job.isActive = true;
      break;
    case RunningStatus.Completing:
      job.statusDescription = "completing";
      job.isActive = true;
      break;
    default:
      job.isComplete = true;

      switch (job.completionStatus) {
        case CompletionStatus.Succeeded:
          job.statusDescription = "completed successfully";
          job.isSuccessful = true;
          break;
        case CompletionStatus.Superseded:
          job.statusDescription = "superseded";
          job.isSuccessful = true;
          break;
        case CompletionStatus.Cancelled:
          job.statusDescription = "cancelled";
          job.isFailed = true;
          break;
        case CompletionStatus.Failed:
          job.statusDescription = "failed";
          job.isFailed = true;
          break;
        case CompletionStatus.TimedOut:
          job.statusDescription = "timed out";
          job.isFailed = true;
          break;
        default:
          job.statusDescription = "unknown";
          job.isFailed = true;
          break;
      }
      break;
  }

  return job;
}

export const unrecognisedJobTypeDescription = "Unknown";

export function getJobProgressMessage(jobTypeString: string) {
  switch (getJobType(jobTypeString)) {
    case JobType.MapDatasetJob:
      return "Mapping dataset";
    case JobType.AssignTemplateCalculationsJob:
      return "Assigning template calculations";
    case JobType.CreateAllocationJob:
      return "Creating allocation";
    case JobType.CreateInstructAllocationJob:
      return "Creating calculations";
    case JobType.GenerateCalculationAggregationsJob:
      return "Generating calculation aggregations";
    case JobType.CreateInstructGenerateAggregationsAllocationJob:
      return "Creating aggregations allocation";
    case JobType.ValidateDatasetJob:
      return "Validating dataset";
    case JobType.MapScopedDatasetJobWithAggregation:
      return "Mapping scoped dataset with aggregation";
    case JobType.MapScopedDatasetJob:
      return "Mapping scoped dataset";
    case JobType.MapFdzDatasetsJob:
      return "Mapping FDZ datasets";
    case JobType.PublishIntegrityCheckJob:
      return "Publish integrity check";
    case JobType.CreateSpecificationJob:
      return "Creating specification";
    case JobType.ProviderSnapshotDataLoadJob:
      return "Provider snapshot data load";
    case JobType.ReIndexPublishedProvidersJob:
      return "Reindexing published providers";
    case JobType.DeleteSpecificationJob:
      return "Deleting specification";
    case JobType.DeleteCalculationResultsJob:
      return "Deleting calculation results";
    case JobType.DeleteCalculationsJob:
      return "Deleting calculations";
    case JobType.DeleteDatasetsJob:
      return "Deleting datasets";
    case JobType.DeleteTestsJob:
      return "Deleting tests";
    case JobType.DeletePublishedProvidersJob:
      return "Deleting published providers";
    case JobType.ReIndexSpecificationCalculationRelationshipsJob:
      return "Reindexing specification calculation relationships";
    case JobType.GenerateGraphAndInstructAllocationJob:
      return "Generating graph and instruct allocation";
    case JobType.GenerateGraphAndInstructGenerateAggregationAllocationJob:
      return "Generating graph and instruct aggregation allocation";
    case JobType.DeleteTestResultsJob:
      return "Deleting test results";
    case JobType.GeneratePublishedFundingCsvJob:
      return "Generating published funding CSV";
    case JobType.GeneratePublishedProviderEstateCsvJob:
      return "Generating published provider estate CSV";
    case JobType.PopulateScopedProvidersJob:
      return "Populating scoped providers";
    case JobType.PublishedFundingUndoJob:
      return "Undoing published funding";
    case JobType.ReIndexTemplatesJob:
      return "Reindexing templates";
    case JobType.ReIndexSpecificationJob:
      return "Reindexing specification";
    case JobType.MergeSpecificationInformationForProviderJob:
      return "Merging specification information for provider";
    case JobType.UpdateCodeContextJob:
      return "Updating code context";
    case JobType.RefreshFundingJob:
      return "Refreshing funding";
    case JobType.ApproveBatchProviderFundingJob:
      return "Approving batch provider funding";
    case JobType.ApproveAllProviderFundingJob:
      return "Approving all provider funding";
    case JobType.PublishAllProviderFundingJob:
      return "Releasing all provider funding";
    case JobType.PublishBatchProviderFundingJob:
      return "Releasing batch provider funding";
    case JobType.SearchIndexWriterJob:
      return "Indexing search";
    case JobType.ApproveAllCalculationsJob:
      return "Approving all calculations";
    case JobType.RunSqlImportJob:
      return "Running SQL import";
    case JobType.GenerateCalcCsvResultsJob:
      return "Generating calculation results file";
    case JobType.BatchPublishedProviderValidationJob:
      return "Validating batch file";
    case JobType.RunConverterDatasetMergeJob:
      return "Running Converter Wizard";
    case JobType.EditSpecificationJob:
      return "Editing specification";
    case JobType.PublishDatasetsDataJob:
      return "Publishing data sets";
    case JobType.QueueConverterDatasetMergeJob:
      return "Running queue converter dataset merge job";
    case JobType.DetectObsoleteFundingLinesJob:
      return "Detecting obsolete funding lines";
    case JobType.ReIndexUsersJob:
      return "Reindexing users";
    case JobType.GenerateFundingStreamPermissionsCsvJob:
      return "Generating Funding Stream permissions CSV";
    case JobType.ConverterWizardActivityCsvGenerationJob:
      return "Generating Converter Wizard Activity CSV";
    case JobType.ReleaseProvidersToChannelsJob:
      return "Releasing providers to channels";
    case JobType.TrackLatestJob:
      return "Tracking latest";
    case JobType.ReleaseManagementDataMigrationJob:
      return "Migrating data for publishing funding";
    case JobType.ReferencedSpecificationReMapJob:
      return "Remapping referenced specification";
    case JobType.ProcessDatasetObsoleteItemsJob:
      return "Processing dataset for obsolete items";
    case JobType.PopulateCalculationResultsQaDatabaseJob:
      return "Exporting calculation results to SQL database";
    case JobType.RunReleasedSqlImportJob:
      return "Exporting released data to SQL";
    case JobType.PublishingReportsJob:
      return "Publishing reports job";
    default:
      return unrecognisedJobTypeDescription;
  }
}
