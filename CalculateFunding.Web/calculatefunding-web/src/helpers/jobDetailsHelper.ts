import {JobSummary} from "../types/jobSummary";
import {JobType} from "../types/jobType";
import {RunningStatus} from "../types/RunningStatus";
import {CompletionStatus} from "../types/CompletionStatus";
import {JobMessage} from "../types/jobMessage";


export type JobDetails = {
    jobId: string,
    jobType?: string,
    specificationId?: string,
    statusDescription: string,
    jobDescription: string,
    outcome: string,
    runningStatus: RunningStatus,
    completionStatus?: CompletionStatus | undefined,
    isSuccessful: boolean,
    isFailed: boolean,
    isActive: boolean,
    isComplete: boolean,
    parentJobId?: string,
    invokerUserId?: string,
    invokerUserDisplayName?: string,
    lastUpdated?: Date,
    created?: Date
}

function getJobType(jobTypeString: string | undefined): JobType | undefined {
    return JobType[jobTypeString as keyof typeof JobType];
}

export function getJobDetailsFromJobMessage(job: JobMessage): JobDetails {
    let result: JobDetails = {
        jobId: job.jobId,
        jobDescription: (job.trigger.message && job.trigger.message?.length > 0) ? 
            job.trigger.message : 
            getJobProgressMessage(job.jobType),
        statusDescription: "",
        outcome: job.outcome ? job.outcome : "",
        isSuccessful: false,
        isActive: false,
        isComplete: false,
        isFailed: false,
        completionStatus: job.completionStatus,
        runningStatus: job.runningStatus,
        created: job.jobCreatedDateTime,
        lastUpdated: job.statusDateTime,
        invokerUserDisplayName: job.invokerUserDisplayName,
        invokerUserId: job.invokerUserId,
        jobType: job.jobType,
        parentJobId: job.parentJobId,
        specificationId: job.specificationId
    };

    setStatusFields(result);
    
    return result;
}

export function getJobDetailsFromJobSummary(job: JobSummary): JobDetails {
    let result: JobDetails = {
        jobId: job.jobId,
        jobDescription: (job.message && job.message?.length > 0) ? job.message : getJobProgressMessage(job.jobType),
        statusDescription: "",
        outcome: job.outcome ? job.outcome : "",
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
        specificationId: job.specificationId
    };

    setStatusFields(result);
    
    return result;
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
        default:
            job.isComplete = true;
            switch (job.completionStatus) {
                case CompletionStatus.Succeeded:
                    job.statusDescription = "completed successfully";
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
                    job.statusDescription = job.completionStatus ? job.completionStatus.toString() : "";
                    job.isFailed = true;
                    break;
            }
            break;
    }
    return job;
}

function getJobProgressMessage(jobTypeString: string | undefined) {
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
        case undefined:
            return "";
        default:
            return jobTypeString ? jobTypeString : "";
    }
}
