import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {FundingConfigurationQueryResult} from "../../../hooks/useFundingConfiguration";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {BatchUploadResponse} from "../../../types/PublishedProvider/BatchUploadResponse";
import {JobCreatedResponse} from "../../../types/JobCreatedResponse";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {getJobDetailsFromJobSummary} from "../../../helpers/jobDetailsHelper";
import {JobType} from "../../../types/jobType";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";
import * as jobHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";

export const FundingApprovalTestSetup = () => {
    const fundingStream: FundingStream = {
        name: "FS123",
        id: "Wizard Training Scheme"
    };
    const fundingPeriod: FundingPeriod = {
        id: "FP123",
        name: "2019-20"
    };
    const testSpec: SpecificationSummary = {
        name: "Wizard Training",
        approvalStatus: "",
        description: "",
        fundingPeriod: fundingPeriod,
        fundingStreams: [fundingStream],
        id: "ABC123",
        isSelectedForFunding: true,
        providerVersionId: "",
        dataDefinitionRelationshipIds: [],
        templateIds: {}
    };
    const mockFundingConfigWithApprovalBatchMode: FundingConfigurationQueryResult = {
        fundingConfiguration: {
            approvalMode: ApprovalMode.Batches,
            providerSource: ProviderSource.CFS,
            defaultTemplateVersion: "1.1",
            fundingPeriodId: fundingPeriod.id,
            fundingStreamId: fundingStream.id
        },
        isLoadingFundingConfiguration: false,
        isErrorLoadingFundingConfiguration: false,
        errorLoadingFundingConfiguration: "",
    };
    const batchUploadResponse: BatchUploadResponse = {batchId: "asdgasfgwer", url: ""};
    const jobCreatedResponse: JobCreatedResponse = {jobId: "rtyg453645724"};

    const mockUploadFileService = jest.fn(() => Promise.resolve({
        data: batchUploadResponse,
        status: 200
    }));
    const mockCreateValidationJobService = jest.fn(() => Promise.resolve({
        data: jobCreatedResponse,
        status: 200
    }));
    const noJob: LatestSpecificationJobWithMonitoringResult = {
        hasJob: false,
        isCheckingForJob: false,
        latestJob: undefined,
        isFetched: true,
        isFetching: false,
        isMonitoring: true,
    };
    const activeApprovalJob: LatestSpecificationJobWithMonitoringResult = {
        hasJob: true,
        isCheckingForJob: false,
        latestJob: getJobDetailsFromJobSummary({
            jobId: "dfgwer",
            jobType: JobType.ApproveAllProviderFundingJob,
            runningStatus: RunningStatus.InProgress,
            invokerUserDisplayName: "testUser",
            created: new Date(),
            lastUpdated: new Date()
        }),
        isFetched: true,
        isFetching: false,
        isMonitoring: true
    };
    const activeValidationJob: LatestSpecificationJobWithMonitoringResult = {
        hasJob: true,
        isCheckingForJob: false,
        latestJob: getJobDetailsFromJobSummary({
            jobId: jobCreatedResponse.jobId,
            jobType: JobType.BatchPublishedProviderValidationJob,
            runningStatus: RunningStatus.InProgress,
            invokerUserDisplayName: "testUser",
            created: new Date(),
            lastUpdated: new Date()
        }),
        isFetched: true,
        isFetching: false,
        isMonitoring: true
    };
    const successfulValidationJob: LatestSpecificationJobWithMonitoringResult = {
        hasJob: true,
        isCheckingForJob: false,
        latestJob: getJobDetailsFromJobSummary({
            jobId: jobCreatedResponse.jobId,
            jobType: JobType.BatchPublishedProviderValidationJob,
            runningStatus: RunningStatus.Completed,
            completionStatus: CompletionStatus.Succeeded,
            invokerUserDisplayName: "testUser",
            created: new Date(),
            lastUpdated: new Date()
        }),
        isFetched: true,
        isFetching: false,
        isMonitoring: true
    };
    const failedValidationJob: LatestSpecificationJobWithMonitoringResult = {
        hasJob: true,
        isCheckingForJob: false,
        latestJob: getJobDetailsFromJobSummary({
            jobId: jobCreatedResponse.jobId,
            jobType: JobType.BatchPublishedProviderValidationJob,
            runningStatus: RunningStatus.Completed,
            completionStatus: CompletionStatus.Failed,
            outcome: "Validation failed for some reason",
            invokerUserDisplayName: "testUser",
            created: new Date(),
            lastUpdated: new Date()
        }),
        isFetched: true,
        isFetching: false,
        isMonitoring: true
    };
    const mockPublishedProviderService = () => {
        jest.mock("../../../services/publishedProviderService", () => {
            const mockService = jest.requireActual("../../../services/publishedProviderService");

            return {
                ...mockService,
                uploadBatchOfPublishedProviders: mockUploadFileService,
                validatePublishedProvidersByBatch: mockCreateValidationJobService
            }
        });
    }

    const hasNoActiveJobsRunning = () => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (noJob));
    const hasLatestJob = (job: LatestSpecificationJobWithMonitoringResult) => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (job));
    const hasFundingConfigWithApproveBatchMode = () => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration').mockImplementation(() => (mockFundingConfigWithApprovalBatchMode));

    
    return {
        mockPublishedProviderService,
        mockCreateValidationJobService,
        mockUploadFileService,
        mockFundingConfigWithApprovalBatchMode,
        hasNoActiveJobsRunning,
        hasLatestJob,
        hasFundingConfigWithApproveBatchMode,
        failedValidationJob,
        successfulValidationJob,
        activeApprovalJob,
        activeValidationJob,
        testSpec,
        noJob,
        fundingStream,
        fundingPeriod,
    }
}