import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";

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

export interface UseExportToSqlJobsHookResults {
  lastExportAllocationDataJob: JobDetails | undefined;
  lastCalcResultsExportJob: JobDetails | undefined;
  hasRunningSqlJob: boolean;
  hasRunningFundingJobs: boolean;
  isAnotherUserRunningSqlJob: boolean;
  isExportBlockedByJob: boolean;
  isLatestCalcResultsAlreadyExported: boolean;
  isLatestAllocationDataAlreadyExported: boolean;
  latestPublishedDate: LatestPublishedDate | undefined;
  isLoadingLatestPublishedDate: boolean;
  exportJobId: string;
  exportJob: JobDetails | undefined;
  isExporting: boolean;
  isExportingCalcResults: boolean;
  isExportingCurrentResults: boolean;
  isExportingReleasedResults: boolean;
  fundingJobStatusMessage: string;
  exportJobStatusMessage: string;
  triggerCalcResultsExport: () => void;
  triggerCurrentAllocationResultsExport: () => void;
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

  const lastExportAllocationDataJob: JobDetails | undefined = useMemo(
    () => jobNotifications.find((n) => n.latestJob?.jobType === JobType.RunSqlImportJob)?.latestJob,
    [jobNotifications]
  );
  const lastCalcResultsExportJob: JobDetails | undefined = useMemo(
    () =>
      jobNotifications.find((n) => n.latestJob?.jobType === JobType.PopulateCalculationResultsQaDatabaseJob)
        ?.latestJob,
    [jobNotifications]
  );
  const lastCalcEngineRunJob: JobDetails | undefined = useMemo(
    () =>
      jobNotifications.find((n) => n.latestJob?.jobType === JobType.CreateInstructAllocationJob)?.latestJob,
    [jobNotifications]
  );
  console.log("lastCalcEngineRunJob", lastCalcEngineRunJob);

  const hasRunningFundingJobs: boolean = useMemo(
    () =>
      !!jobNotifications.find(
        ({ latestJob: job }) =>
          !!job?.jobType &&
          job.jobType !== JobType.RunSqlImportJob &&
          job.isActive &&
          job.specificationId === specificationId
      ),
    [jobNotifications]
  );
  const hasRunningSqlJob: boolean = useMemo(
    () =>
      !!jobNotifications.find(
        ({ latestJob: job }) =>
          !!job?.jobType &&
          (job.jobType === JobType.RunSqlImportJob ||
            job.jobType === JobType.PopulateCalculationResultsQaDatabaseJob) &&
          job.isActive &&
          job.specificationId === specificationId
      ),
    [jobNotifications]
  );

  function handleJobNotification(notification: JobNotification) {
    if (!notification.latestJob?.jobType) return;
    if (
      notification.latestJob.jobType === JobType.RunSqlImportJob ||
      notification.latestJob.jobType === JobType.PopulateCalculationResultsQaDatabaseJob
    ) {
      handleExportToSqlJob(notification);
    } else {
      handleOtherJobs(notification);
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

  function handleOtherJobs(notification: JobNotification) {
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
        refetchLatestPubDate();
        break;
    }
  }

  async function triggerCalcResultsExport() {
    try {
      setIsExportingCalcResults(true);
      clearErrorMessages();
      const { jobId } = (await sqlExportService.runJobToExportCalcResultsToSql(specificationId)).data;
      if (!jobId || jobId?.length === 0) {
        setIsExportingCalcResults(false);
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
      if (!jobId || jobId?.length === 0) {
        setIsExportingCurrentResults(false);
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

  useEffect(() => {
    // monitor other ACTIVE background jobs
    [
      JobType.ApproveBatchProviderFundingJob,
      JobType.ApproveAllProviderFundingJob,
      JobType.RefreshFundingJob,
      JobType.PublishAllProviderFundingJob,
      JobType.PublishBatchProviderFundingJob,
      JobType.ReIndexPublishedProvidersJob,
    ].map((jobType) => {
      addSub({
        filterBy: {
          specificationId: specificationId,
          jobTypes: [jobType],
        },
        monitorMode: MonitorMode.SignalR,
        monitorFallback: MonitorFallback.Polling,
        onError: (err) =>
          addError({
            error: err,
            description: "An error occurred while monitoring the running jobs",
          }),
      });
    });

    // find other export jobs, whether active or historic
    [
      JobType.RunSqlImportJob,
      JobType.PopulateCalculationResultsQaDatabaseJob,
      JobType.CreateInstructAllocationJob,
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

  const hasPreviousAllocationSqlExport = !!lastExportAllocationDataJob?.lastUpdated;
  const hasPreviousAllocationSqlExportFailure = !!lastExportAllocationDataJob?.isFailed;
  const hasPreviousCalcResultsSqlExport = !!lastCalcResultsExportJob?.lastUpdated;
  const hasPreviousCalcResultsSqlExportFailure = !!lastCalcResultsExportJob?.isFailed;
  const isCalcDataInSqlOutdated =
    !!lastCalcEngineRunJob?.lastUpdated &&
    !!lastCalcResultsExportJob?.lastUpdated &&
    lastCalcEngineRunJob.lastUpdated > lastCalcResultsExportJob?.lastUpdated;
  const isAllocationDataInSqlOutdated =
    !lastExportAllocationDataJob?.lastUpdated ||
    (!!latestPublishedDate?.value && latestPublishedDate.value > lastExportAllocationDataJob.lastUpdated);

  return {
    lastExportAllocationDataJob,
    lastCalcResultsExportJob,
    hasRunningSqlJob,
    hasRunningFundingJobs,
    isAnotherUserRunningSqlJob: hasRunningSqlJob && !isExporting,
    isExportBlockedByJob: isExporting || hasRunningFundingJobs || hasRunningSqlJob,
    isLatestCalcResultsAlreadyExported:
      hasPreviousCalcResultsSqlExport && !hasPreviousCalcResultsSqlExportFailure && !isCalcDataInSqlOutdated,
    isLatestAllocationDataAlreadyExported:
      hasPreviousAllocationSqlExport &&
      !hasPreviousAllocationSqlExportFailure &&
      !isAllocationDataInSqlOutdated,
    latestPublishedDate,
    isLoadingLatestPublishedDate,
    exportJobId,
    exportJob: jobNotifications.find((n) => n.latestJob?.jobId === exportJobId)?.latestJob,
    isExporting,
    isExportingCalcResults,
    isExportingCurrentResults,
    isExportingReleasedResults,
    fundingJobStatusMessage,
    exportJobStatusMessage,
    triggerCalcResultsExport,
    triggerCurrentAllocationResultsExport,
  };
};
