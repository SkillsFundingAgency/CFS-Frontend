import { AxiosError } from "axios";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";

import { getNotificationWithLastUpdate } from "../../helpers/jobSubscriptionUtilities";
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
  lastReleasedAllocationJob: JobDetails | undefined;
  lastCalcEngineRunJob: JobDetails | undefined;
  lastFundingChangeJob: JobDetails | undefined;
  hasRunningSqlJob: boolean;
  hasRunningFundingJobs: boolean;
  isAnotherUserRunningSqlJob: boolean;
  isExportBlockedByJob: boolean;
  isCurrentAllocationStateBlockedByJob: boolean;
  isLatestAllocationStateBlockedByJob: boolean;
  isLatestCalcResultsAlreadyExported: boolean;
  isLatestAllocationDataAlreadyExported: boolean;
  isLatestReleaseDataAlreadyExported: boolean;
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
  triggerReleasedResultsExport: () => void;
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

  const lastFundingChangeJob: JobDetails | undefined = useMemo(
    () =>
      getNotificationWithLastUpdate(
        jobNotifications.filter(
          (n) =>
            [
              JobType.ReleaseProvidersToChannelsJob,
              JobType.PublishAllProviderFundingJob,
              JobType.PublishBatchProviderFundingJob,
              JobType.ReleaseProvidersToChannelsJob,
              JobType.ApproveAllProviderFundingJob,
              JobType.ApproveBatchProviderFundingJob,
              JobType.RefreshFundingJob,
              JobType.ApproveAllCalculationsJob,
              JobType.AssignTemplateCalculationsJob,
            ].includes(n.latestJob?.jobType as JobType) && n.latestJob?.isSuccessful
        )
      )?.latestJob,
    [jobNotifications]
  );

  const lastExportAllocationDataJob: JobDetails | undefined = useMemo(
    () => jobNotifications.find((n) => n.latestJob?.jobType === JobType.RunSqlImportJob)?.latestJob,
    [jobNotifications]
  );

  const lastReleasedAllocationJob: JobDetails | undefined = useMemo(
    () => jobNotifications.find((n) => n.latestJob?.jobType === JobType.RunReleasedSqlImportJob)?.latestJob,
    [jobNotifications]
  );

  const lastReleasedAllocationExportJob: JobDetails | undefined = useMemo(() => {
    const jobs = jobNotifications.filter(
      (n) =>
        [
          JobType.ReleaseProvidersToChannelsJob,
          JobType.PublishAllProviderFundingJob,
          JobType.PublishBatchProviderFundingJob,
          JobType.ReleaseProvidersToChannelsJob,
        ].includes(n.latestJob?.jobType as JobType) && n.latestJob?.isSuccessful
    );

    const job = jobs
      .sort((n) => DateTime.fromJSDate(n.latestJob?.lastUpdated ?? new Date(0)).toMillis())
      .shift();

    return job?.latestJob;
  }, [jobNotifications]);

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

  const hasRunningReleasedAllocationSqlImportJob: boolean = useMemo(
    () =>
      !!jobNotifications.find(
        ({ latestJob: job }) =>
          !!job?.jobType &&
          job.jobType === JobType.RunReleasedSqlImportJob &&
          job.isActive &&
          job.specificationId === specificationId
      ),
    [jobNotifications]
  );

  async function handleJobNotification(notification: JobNotification) {
    if (!notification.latestJob?.jobType) return;
    if (
      notification.latestJob.jobType === JobType.RunSqlImportJob ||
      notification.latestJob.jobType === JobType.PopulateCalculationResultsQaDatabaseJob ||
      notification.latestJob.jobType === JobType.RunReleasedSqlImportJob
    ) {
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
    // monitor funding jobs
    // (as individual subscriptions so they appear as separate banner notifications)
    [
      JobType.ApproveBatchProviderFundingJob,
      JobType.ApproveAllProviderFundingJob,
      JobType.RefreshFundingJob,
      JobType.PublishAllProviderFundingJob,
      JobType.PublishBatchProviderFundingJob,
      JobType.ReleaseProvidersToChannelsJob,
      JobType.ReIndexPublishedProvidersJob,
      JobType.ApproveAllCalculationsJob,
      JobType.AssignTemplateCalculationsJob,
    ].map((jobType) => {
      addSub({
        filterBy: {
          specificationId: specificationId,
          jobTypes: [jobType],
        },
        fetchPriorNotifications: true,
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
      JobType.RunReleasedSqlImportJob,
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

  const hasPreviousReleasedAllocationSqlExport = !!lastReleasedAllocationJob?.lastUpdated;
  const hasPreviousReleasedAllocationSqlExportFailure = !!lastReleasedAllocationJob?.isFailed;

  const isCalcDataInSqlOutdated =
    !!lastCalcEngineRunJob?.lastUpdated &&
    !!lastCalcResultsExportJob?.lastUpdated &&
    lastCalcEngineRunJob.lastUpdated > lastCalcResultsExportJob?.lastUpdated;

  const isAllocationDataInSqlOutdated =
    !lastExportAllocationDataJob?.lastUpdated ||
    (!!latestPublishedDate?.value && latestPublishedDate.value > lastExportAllocationDataJob.lastUpdated);

  const isReleasedAllocationDataInSqlOutdated =
    !lastReleasedAllocationJob?.lastUpdated ||
    (!!latestPublishedDate?.value &&
      (lastReleasedAllocationExportJob?.lastUpdated !== undefined
        ? latestPublishedDate.value > lastReleasedAllocationExportJob?.lastUpdated
        : true));

  return {
    lastExportAllocationDataJob,
    lastCalcResultsExportJob,
    lastReleasedAllocationJob,
    lastCalcEngineRunJob,
    lastFundingChangeJob,
    hasRunningSqlJob,
    hasRunningFundingJobs,
    isAnotherUserRunningSqlJob: hasRunningSqlJob && !isExporting,
    isExportBlockedByJob: isExporting || hasRunningFundingJobs || hasRunningSqlJob,
    isCurrentAllocationStateBlockedByJob: isExporting || hasRunningFundingJobs || hasRunningSqlJob,
    isLatestAllocationStateBlockedByJob:
      isExportingReleasedResults || hasRunningReleasedAllocationSqlImportJob,
    isLatestCalcResultsAlreadyExported:
      hasPreviousCalcResultsSqlExport && !hasPreviousCalcResultsSqlExportFailure && !isCalcDataInSqlOutdated,
    isLatestAllocationDataAlreadyExported:
      hasPreviousAllocationSqlExport &&
      !hasPreviousAllocationSqlExportFailure &&
      !isAllocationDataInSqlOutdated,
    isLatestReleaseDataAlreadyExported:
      hasPreviousReleasedAllocationSqlExport &&
      !hasPreviousReleasedAllocationSqlExportFailure &&
      !isReleasedAllocationDataInSqlOutdated,
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
    triggerReleasedResultsExport,
  };
};
