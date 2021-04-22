import {JobType} from "../types/jobType";
import {RunningStatus} from "../types/RunningStatus";
import {CompletionStatus} from "../types/CompletionStatus";
import {JobDetails, JobFailure, JobOutcomeType, JobResponse} from "../types/jobDetails";


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
        trigger: job.trigger

    };

    if (job.outcomes && job.outcomes.length > 0) {
        result.failures = job.outcomes
            .filter(j => !j.isSuccessful)
            .map<JobFailure>(x => {
                return {
                    description: x.description,
                    type: x.type,
                    jobType: x.jobType,
                    jobDescription: x.jobType};
            });
        const hasValidationError = result.failures.some(e => e.type === JobOutcomeType.ValidationError);
        result.outcome = result.failures.length === 1 ? "One of the job steps failed" : "Some of the job steps failed";
        if (hasValidationError) {
            result.outcome += " due to validation"
        }
    }

    setStatusFields(result);

    return result;
}

function getJobType(jobTypeString: string): JobType | undefined {
    return JobType[jobTypeString as keyof typeof JobType];
}

function buildDescription(jobType: string, message: string | undefined) {
    const descFromJobType = getJobProgressMessage(jobType).trim();
    const haveDescFromJobType = descFromJobType && descFromJobType.length > 0;
    const descFromServer = (message && message.length > 0) ? message.trim().replace(/[\W_]+/g, " ") : "";
    const haveDescFromServer = descFromServer && descFromServer.length > 0;
    const same = (descFromJobType && descFromServer &&
        (descFromJobType.toLowerCase() == descFromServer.toLowerCase() || descFromServer.includes(descFromJobType)))
    return haveDescFromJobType && haveDescFromServer ?
        same ? descFromServer : `${descFromJobType}: ${descFromServer}` :
        (haveDescFromJobType && !haveDescFromServer) ? descFromJobType :
            (!haveDescFromJobType && haveDescFromServer) ? descFromServer : "";
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
                    job.statusDescription = job.failures.length > 0 ? "completed with error(s)" : "completed successfully";
                    job.isSuccessful = job.failures.length === 0;
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

function getJobProgressMessage(jobTypeString: string) {
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
        case undefined:
            return "";
        default:
            return jobTypeString ? jobTypeString : "";
    }
}
