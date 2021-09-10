﻿export enum JobType {
  RefreshFundingJob = "RefreshFundingJob",
  ApproveAllProviderFundingJob = "ApproveAllProviderFundingJob",
  ApproveBatchProviderFundingJob = "ApproveBatchProviderFundingJob",
  PublishBatchProviderFundingJob = "PublishBatchProviderFundingJob",
  PublishAllProviderFundingJob = "PublishAllProviderFundingJob",
  MapDatasetJob = "MapDatasetJob",
  AssignTemplateCalculationsJob = "AssignTemplateCalculationsJob",
  CreateAllocationJob = "CreateAllocationJob",
  CreateInstructAllocationJob = "CreateInstructAllocationJob",
  GenerateCalculationAggregationsJob = "GenerateCalculationAggregationsJob",
  CreateInstructGenerateAggregationsAllocationJob = "CreateInstructGenerateAggregationsAllocationJob",
  ValidateDatasetJob = "ValidateDatasetJob",
  MapScopedDatasetJobWithAggregation = "MapScopedDatasetJobWithAggregation",
  MapScopedDatasetJob = "MapScopedDatasetJob",
  MapFdzDatasetsJob = "MapFdzDatasetsJob",
  PublishIntegrityCheckJob = "PublishIntegrityCheckJob",
  CreateSpecificationJob = "CreateSpecificationJob",
  ProviderSnapshotDataLoadJob = "ProviderSnapshotDataLoadJob",
  ReIndexPublishedProvidersJob = "ReIndexPublishedProvidersJob",
  DeleteSpecificationJob = "DeleteSpecificationJob",
  DeleteCalculationResultsJob = "DeleteCalculationResultsJob",
  DeleteCalculationsJob = "DeleteCalculationsJob",
  DeleteDatasetsJob = "DeleteDatasetsJob",
  DeleteTestsJob = "DeleteTestsJob",
  DeletePublishedProvidersJob = "DeletePublishedProvidersJob",
  ReIndexSpecificationCalculationRelationshipsJob = "ReIndexSpecificationCalculationRelationshipsJob",
  GenerateGraphAndInstructAllocationJob = "GenerateGraphAndInstructAllocationJob",
  GenerateGraphAndInstructGenerateAggregationAllocationJob = "GenerateGraphAndInstructGenerateAggregationAllocationJob",
  DeleteTestResultsJob = "DeleteTestResultsJob",
  GeneratePublishedFundingCsvJob = "GeneratePublishedFundingCsvJob",
  GeneratePublishedProviderEstateCsvJob = "GeneratePublishedProviderEstateCsvJob",
  PopulateScopedProvidersJob = "PopulateScopedProvidersJob",
  PublishedFundingUndoJob = "PublishedFundingUndoJob",
  ReIndexTemplatesJob = "ReIndexTemplatesJob",
  ReIndexSpecificationJob = "ReIndexSpecificationJob",
  MergeSpecificationInformationForProviderJob = "MergeSpecificationInformationForProviderJob",
  UpdateCodeContextJob = "UpdateCodeContextJob",
  SearchIndexWriterJob = "SearchIndexWriterJob",
  ApproveAllCalculationsJob = "ApproveAllCalculationsJob",
  RunSqlImportJob = "RunSqlImportJob",
  GenerateCalcCsvResultsJob = "GenerateCalcCsvResultsJob",
  BatchPublishedProviderValidationJob = "BatchPublishedProviderValidationJob",
  DetectObsoleteFundingLinesJob = "DetectObsoleteFundingLinesJob",
  RunConverterDatasetMergeJob = "RunConverterDatasetMergeJob",
  PublishDatasetsDataJob = "PublishDatasetsDataJob",
  QueueConverterDatasetMergeJob = "QueueConverterDatasetMergeJob",
  ReIndexUsersJob = "ReIndexUsersJob",
  GenerateFundingStreamPermissionsCsvJob = "GenerateFundingStreamPermissionsCsvJob",
  ConverterWizardActivityCsvGenerationJob = "ConverterWizardActivityCsvGenerationJob",
  EditSpecificationJob = "EditSpecificationJob",
  TrackLatestJob = "TrackLatestJob",
  ReferencedSpecificationReMapJob = "ReferencedSpecificationReMapJob",
}
