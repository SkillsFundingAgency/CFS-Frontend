import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";

import {
  extractJobsSortedByLatest,
  findJobWithId,
  firstActiveJob,
  firstJobWithType,
  firstSuccessfulJob,
  getJobType,
  isJobTypeIn,
} from "../../helpers/jobDetailsHelper";
import { sqlExportService } from "../../services/exportToSqlService";
import { getLatestPublishedDate } from "../../services/publishService";
import { JobDetails } from "../../types/jobDetails";
import { JobNotification, MonitorFallback, MonitorMode } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { LatestPublishedDate } from "../../types/PublishedProvider/LatestPublishedDate";
import { RunningStatus } from "../../types/RunningStatus";
import { useJobSubscription } from "../Jobs/useJobSubscription";
import { ErrorProps } from "../useErrors";

export interface UseExportToSqlJobsHookProps {
  specificationId: string;
  fundingStreamId: string | undefined;
  fundingPeriodId: string | undefined;
  addError: ({ error, description, fieldName, suggestion }: ErrorProps) => void;
  clearErrorMessages: (fieldNames?: string[]) => void;
}

export interface SqlExportActions {
  triggerCalcResultsExport: () => void;
  triggerCurrentAllocationResultsExport: () => void;
  triggerReleasedResultsExport: () => void;
}

export interface SqlExportState {
  isAnotherUserExporting: boolean;
  isExportBlockedByJob: boolean;
  isCurrentAllocationStateBlockedByJob: boolean;
  isLatestAllocationStateBlockedByJob: boolean;
  isLatestCalcResultsAlreadyExported: boolean;
  isLatestAllocationDataAlreadyExported: boolean;
  isLatestReleaseDataAlreadyExported: boolean;
  isExporting: boolean;
  isExportingCalcResults: boolean;
  isExportingCurrentResults: boolean;
  isExportingReleasedResults: boolean;
  fundingJobStatusMessage: string;
  exportJobStatusMessage: string;
}

export interface JobsInfo {
  exportJob: JobDetails | undefined;
  latestExportAllocationDataJob: JobDetails | undefined;
  latestCalcResultsExportJob: JobDetails | undefined;
  latestReleasedAllocationJob: JobDetails | undefined;
  lastSuccessfulFundingChangeJob: JobDetails | undefined;
  latestCalcEngineRunJob: JobDetails | undefined;
  latestReleasedAllocationExportJob: JobDetails | undefined;
  hasRunningSqlJob: boolean;
  hasRunningFundingJobs: boolean;
  hasRunningCalcEngineJob: boolean;
  hasRunningReleasedAllocationSqlImportJob: boolean;
}

export interface UseExportToSqlJobsHookResults {
  jobsInfo: JobsInfo;
  exportState: SqlExportState;
  latestPublishedDate: LatestPublishedDate | undefined;
  isLoadingLatestPublishedDate: boolean;
  exportJobId: string;
  actions: SqlExportActions;
}

export const useExportToSqlJobs = ({
  specificationId,
  fundingStreamId,
  fundingPeriodId,
  addError,
  clearErrorMessages,
}: UseExportToSqlJobsHookProps): UseExportToSqlJobsHookResults => {
  const [isAnotherUserRunningSqlJob, setIsAnotherUserRunningSqlJob] = useState<boolean>(false);
  const [isAnotherUserRunningFundingJob, setIsAnotherUserRunningFundingJob] = useState<boolean>(false);
  const [isExportingCalcResults, setIsExportingCalcResults] = useState<boolean>(false);
  const [isExportingCurrentResults, setIsExportingCurrentResults] = useState<boolean>(false);
  const [isExportingReleasedResults, setIsExportingReleasedResults] = useState<boolean>(false);
  const isExporting = isExportingCalcResults || isExportingCurrentResults || isExportingReleasedResults;
  const [exportJobStatusMessage, setExportJobStatusMessage] = useState<string>("Data push queued");
  const [fundingJobStatusMessage, setFundingJobStatusMessage] = useState<string>("Funding job running");
  const [exportJobId, setExportJobId] = useState<string>("");
  const sqlExportJobTypes = [
    JobType.RunSqlImportJob,
    JobType.PopulateCalculationResultsQaDatabaseJob,
    JobType.RunReleasedSqlImportJob,
  ];
  const approveFundingJobTypes = [
    JobType.ApproveAllProviderFundingJob,
    JobType.ApproveBatchProviderFundingJob,
  ];
  const refreshFundingJobTypes = [JobType.RefreshFundingJob];
  const releaseFundingJobTypes = [
    JobType.ReleaseProvidersToChannelsJob,
    JobType.PublishAllProviderFundingJob,
    JobType.PublishBatchProviderFundingJob,
  ];
  const calcRunJobTypes = [
    JobType.CreateInstructAllocationJob,
    JobType.CreateInstructGenerateAggregationsAllocationJob,
    JobType.GenerateGraphAndInstructAllocationJob,
    JobType.GenerateGraphAndInstructGenerateAggregationAllocationJob,
  ];

  const {
    data: latestPublishedDate,
    isLoading: isLoadingLatestPublishedDate,
    refetch: refetchLatestPubDate,
  } = useQuery<LatestPublishedDate, AxiosError, LatestPublishedDate>(
    `latest-published-date-${fundingStreamId}-${fundingPeriodId}`,
    async () => (await getLatestPublishedDate(fundingStreamId as string, fundingPeriodId as string))?.data,
    {
      onError: (err) => addError({ error: err, description: "Error while loading latest published date." }),
      enabled: !!fundingStreamId && !!fundingPeriodId,
    }
  );

  const {
    addSub,
    removeAllSubs,
    results: jobNotifications,
  } = useJobSubscription({
    isEnabled: !!specificationId && specificationId.length > 0,
    onNewNotification: handleJobNotification,
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring background jobs" }),
  });

  const jobsInfo: JobsInfo = useMemo(() => {
    const jobsSortedByLatest = extractJobsSortedByLatest(jobNotifications);
    const findLatestByJobType = firstJobWithType(jobsSortedByLatest);
    const findLatestSuccessfulByJobType = firstSuccessfulJob(jobsSortedByLatest);
    const findActiveByJobType = firstActiveJob(jobsSortedByLatest);
    const findJobById = findJobWithId(jobsSortedByLatest);
    return {
      latestExportAllocationDataJob: findLatestByJobType([JobType.RunSqlImportJob]),
      latestReleasedAllocationJob: findLatestByJobType(releaseFundingJobTypes),
      latestCalcResultsExportJob: findLatestByJobType([JobType.PopulateCalculationResultsQaDatabaseJob]),
      latestCalcEngineRunJob: findLatestByJobType([JobType.CreateInstructAllocationJob]),
      latestReleasedAllocationExportJob: findLatestByJobType([JobType.RunReleasedSqlImportJob]),
      lastSuccessfulFundingChangeJob: findLatestSuccessfulByJobType([
        ...releaseFundingJobTypes,
        ...approveFundingJobTypes,
        ...refreshFundingJobTypes,
      ]),
      hasRunningCalcEngineJob: !!findActiveByJobType(calcRunJobTypes),
      hasRunningFundingJobs: !!findActiveByJobType([
        ...releaseFundingJobTypes,
        ...approveFundingJobTypes,
        ...refreshFundingJobTypes,
      ]),
      hasRunningSqlJob: !!findActiveByJobType(sqlExportJobTypes),
      hasRunningReleasedAllocationSqlImportJob: !!findActiveByJobType([JobType.RunReleasedSqlImportJob]),
      exportJob: findJobById(exportJobId),
    };
  }, [jobNotifications]);

  async function handleJobNotification(notification: JobNotification) {
    const jobType = getJobType(notification.latestJob?.jobType as string);
    if (!jobType) return;
    if (isJobTypeIn(sqlExportJobTypes)(jobType)) {
      handleExportToSqlJob(notification);
    } else {
      await handleOtherJobs(notification);
    }
  }

  function handleExportToSqlJob(notification: JobNotification) {
    if (!notification.latestJob) return;
    if (exportJobId.length === 0 && !isAnotherUserRunningSqlJob) {
      setIsAnotherUserRunningSqlJob(true);
    }
    console.log(
      `SQL import job with id: ${notification.latestJob.jobId}, status: ${notification.latestJob.statusDescription}, type: ${notification.latestJob.jobType}, invoked by: ${notification.latestJob.invokerUserDisplayName}`
    );
    clearErrorMessages();
    switch (notification.latestJob.runningStatus) {
      case RunningStatus.Queued:
      case RunningStatus.QueuedWithService:
        setExportJobStatusMessage("Data push queued");
        break;
      case RunningStatus.InProgress:
        setExportJobStatusMessage("Data push in progress");
        break;
      case RunningStatus.Completing:
        setExportJobStatusMessage("Data push completing");
        break;
      case RunningStatus.Completed:
        setExportJobStatusMessage("Data push completed");
        setIsAnotherUserRunningSqlJob(false);
        if (!notification.latestJob.isSuccessful) {
          setExportJobStatusMessage("Data push failed");
        }
        if (exportJobId.length > 0 && notification.latestJob.jobId === exportJobId) {
          setIsExportingCalcResults(false);
          setIsExportingCurrentResults(false);
          setIsExportingReleasedResults(false);
          if (!notification.latestJob.isSuccessful) {
            addError({ error: "Export to SQL job failed: " + notification.latestJob.outcome });
          }
          setExportJobId("");
        }
        break;
    }
  }

  async function handleOtherJobs(notification: JobNotification) {
    if (!notification.latestJob) return;
    if (!isAnotherUserRunningFundingJob) {
      setIsAnotherUserRunningFundingJob(true);
    }
    console.log(
      `${notification.latestJob.jobDescription} job with id: ${notification.latestJob.jobId}, status: ${notification.latestJob.statusDescription}, type: ${notification.latestJob.jobType}, invoked by: ${notification.latestJob.invokerUserDisplayName}`
    );
    switch (notification.latestJob.runningStatus) {
      case RunningStatus.Queued:
      case RunningStatus.QueuedWithService:
        setFundingJobStatusMessage("Job queued");
        break;
      case RunningStatus.InProgress:
        setFundingJobStatusMessage("Job in progress");
        break;
      case RunningStatus.Completing:
        setFundingJobStatusMessage("Job completing");
        break;
      case RunningStatus.Completed:
        setFundingJobStatusMessage("Job completed");
        setIsAnotherUserRunningFundingJob(false);
        await refetchLatestPubDate();
        break;
    }
  }

  async function triggerCalcResultsExport() {
    try {
      setIsExportingCalcResults(true);
      clearErrorMessages();
      const { jobId } = (await sqlExportService.runJobToExportCalcResultsToSql(specificationId)).data;
      if (!jobId?.length) {
        throw new Error("No job ID was returned");
      }
      console.log(`Export calc results job queued with id ${jobId}`);
      setExportJobId(jobId);
    } catch (error: any) {
      addError({
        error: error,
        description: "The calculations results export to SQL job could not be started",
      });
      setIsExportingCalcResults(false);
    }
  }

  async function triggerCurrentAllocationResultsExport() {
    try {
      setIsExportingCurrentResults(true);
      clearErrorMessages();
      const { jobId } = (
        await sqlExportService.runJobToExportAllocationDataToSql(specificationId, fundingStreamId as string)
      ).data;
      if (!jobId?.length) {
        throw new Error("No job ID was returned");
      }
      console.log(`Export current allocation data job queued with id ${jobId}`);
      setExportJobId(jobId);
    } catch (error: any) {
      addError({
        error: error,
        description: "The funding allocation data export to SQL job could not be started",
      });
      setIsExportingCurrentResults(false);
    }
  }

  const triggerReleasedResultsExport = async () => {
    try {
      setIsExportingReleasedResults(true);
      clearErrorMessages();
      const { jobId } = (
        await sqlExportService.runJobToExportReleasedDataToSql(specificationId, fundingStreamId as string)
      ).data;
      if (!jobId?.length) {
        throw Error("No job ID was returned");
      } else {
        console.log(`Export released state allocation data job queued with id ${jobId}`);
        setExportJobId(jobId);
      }
    } catch (error: any) {
      setIsExportingReleasedResults(false);
      addError({
        error: error,
        description: "The released results export to SQL job could not be started",
      });
    }
  };

  useEffect(() => {
    [
      ...sqlExportJobTypes,
      ...calcRunJobTypes,
      ...releaseFundingJobTypes,
      ...approveFundingJobTypes,
      ...refreshFundingJobTypes,
    ].map((jobType) => {
      addSub({
        filterBy: {
          specificationId: specificationId,
          jobTypes: [jobType],
        },
        monitorMode: MonitorMode.SignalR,
        monitorFallback: MonitorFallback.Polling,
        fetchPriorNotifications: true,
        onError: (err) =>
          addError({
            error: err,
            description: "An error occurred while monitoring the running jobs",
          }),
      });
    });
  }, [specificationId]);

  useEffect(() => {
    return () => {
      removeAllSubs();
    };
  }, []);

  const isOutdated = (lastExportJob: JobDetails | undefined, lastUpdateJob: JobDetails | undefined) => {
    return (
      !!lastUpdateJob?.lastUpdated &&
      !!lastExportJob?.lastUpdated &&
      lastUpdateJob.lastUpdated > lastExportJob?.lastUpdated
    );
  };

  const state = useMemo(() => {
    const hasPreviousAllocationSqlExport = !!jobsInfo.latestExportAllocationDataJob?.lastUpdated;
    const hasPreviousAllocationSqlExportFailure = !!jobsInfo.latestExportAllocationDataJob?.isFailed;
    const hasPreviousCalcResultsSqlExport = !!jobsInfo.latestCalcResultsExportJob?.lastUpdated;
    const hasPreviousCalcResultsSqlExportFailure = !!jobsInfo.latestCalcResultsExportJob?.isFailed;
    const hasPreviousReleasedAllocationSqlExport = !!jobsInfo.latestReleasedAllocationJob?.lastUpdated;
    const hasPreviousReleasedAllocationSqlExportFailure = !!jobsInfo.latestReleasedAllocationJob?.isFailed;
    const isAllocationDataInSqlOutdated =
      !jobsInfo.latestExportAllocationDataJob?.lastUpdated ||
      (!!latestPublishedDate?.value &&
        latestPublishedDate.value > jobsInfo.latestExportAllocationDataJob.lastUpdated);
    const isCalcDataInSqlOutdated = isOutdated(
      jobsInfo.latestCalcResultsExportJob,
      jobsInfo.latestCalcEngineRunJob
    );
    const isReleasedAllocationDataInSqlOutdated =
      !jobsInfo.latestReleasedAllocationExportJob?.lastUpdated ||
      (!!jobsInfo.latestReleasedAllocationJob?.lastUpdated &&
        (jobsInfo.latestReleasedAllocationExportJob?.lastUpdated !== undefined
          ? jobsInfo.latestReleasedAllocationJob.lastUpdated >
            jobsInfo.latestReleasedAllocationExportJob?.lastUpdated
          : true));
    return {
      isAnotherUserExporting: jobsInfo.hasRunningSqlJob && !isExporting,
      isExportBlockedByJob: isExporting || jobsInfo.hasRunningFundingJobs || jobsInfo.hasRunningSqlJob,
      isCurrentAllocationStateBlockedByJob:
        isExporting || jobsInfo.hasRunningFundingJobs || jobsInfo.hasRunningSqlJob,
      isLatestAllocationStateBlockedByJob:
        isExportingReleasedResults || jobsInfo.hasRunningReleasedAllocationSqlImportJob,
      isLatestCalcResultsAlreadyExported:
        hasPreviousCalcResultsSqlExport &&
        !hasPreviousCalcResultsSqlExportFailure &&
        !isCalcDataInSqlOutdated,
      isLatestAllocationDataAlreadyExported:
        hasPreviousAllocationSqlExport &&
        !hasPreviousAllocationSqlExportFailure &&
        !isAllocationDataInSqlOutdated,
      isLatestReleaseDataAlreadyExported:
        hasPreviousReleasedAllocationSqlExport &&
        !hasPreviousReleasedAllocationSqlExportFailure &&
        !isReleasedAllocationDataInSqlOutdated,
    };
  }, [jobsInfo, isExporting, latestPublishedDate?.value]);

  return {
    jobsInfo,
    exportState: {
      ...state,
      isExporting,
      isExportingCalcResults,
      isExportingCurrentResults,
      isExportingReleasedResults,
      fundingJobStatusMessage,
      exportJobStatusMessage,
    },
    latestPublishedDate,
    isLoadingLatestPublishedDate,
    exportJobId,
    actions: {
      triggerCalcResultsExport,
      triggerCurrentAllocationResultsExport,
      triggerReleasedResultsExport,
    },
  };
};
