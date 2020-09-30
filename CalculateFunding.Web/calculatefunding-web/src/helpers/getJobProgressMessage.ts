import {JobSummary} from "../types/jobSummary";
import {JobType} from "../types/jobType";

export function getJobProgressMessage(job: JobSummary | undefined) {

    if (!job) {
        return "";
    }

    const jobType: JobType | undefined = JobType[job.jobType as keyof typeof JobType];

    switch (jobType) {
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
        case undefined:
        default:
            return job.jobType ? job.jobType : "";
    }
}
