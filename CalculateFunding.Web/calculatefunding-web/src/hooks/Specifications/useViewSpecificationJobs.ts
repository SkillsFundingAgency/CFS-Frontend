import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as action from "../../actions/jobObserverActions";
import { IStoreState } from "../../reducers/rootReducer";
import { JobObserverState } from "../../states/JobObserverState";
import { JobDetails } from "../../types/jobDetails";
import {
  JobNotification,
  JobSubscription,
  MonitorFallback,
  MonitorMode,
} from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { useJobSubscription } from "../Jobs/useJobSubscription";
import { ErrorProps } from "../useErrors";

export interface ViewSpecificationJobsHookProps {
  specificationId: string;
  addError: ({ error, description, fieldName, suggestion }: ErrorProps) => void;
  onSuccessfulRefreshFunding: () => void;
}

export const useViewSpecificationJobs = ({
  specificationId,
  addError,
  onSuccessfulRefreshFunding,
}: ViewSpecificationJobsHookProps) => {
  const jobObserverState: JobObserverState = useSelector<IStoreState, JobObserverState>(
    (state) => state.jobObserverState
  );
  const [observedJobSubscription, setObservedJobSubscription] = useState<JobSubscription>();
  const [converterWizardJob, setConverterWizardJob] = useState<JobDetails>();
  const [lastConverterWizardReportDate, setLastConverterWizardReportDate] = useState<Date | undefined>(
    undefined
  );
  const [approveAllCalculationsJob, setApproveAllCalcsJob] = useState<JobDetails>();
  const { addSub, removeSub, removeAllSubs, subs, results } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring the running jobs" }),
    onNewNotification: handleJobNotification,
  });

  const isRefreshJobMonitoring = useMemo(
    () => !!subs.find((s) => s.filterBy.jobTypes?.includes(JobType.RefreshFundingJob)),
    [subs]
  );
  const isApproveCalcsJobMonitoring = useMemo(
    () => !!subs.find((s) => s.filterBy.jobTypes?.includes(JobType.ApproveAllCalculationsJob)),
    [subs]
  );
  const isApproveCalcsJobRunning = useMemo(
    () => !!results.find((n) => n.latestJob?.jobType === JobType.ApproveAllCalculationsJob),
    [subs]
  );
  const dispatch = useDispatch();

  async function handleJobNotification(notification: JobNotification) {
    if (!notification?.latestJob) return;

    switch (notification.latestJob.jobType) {
      case JobType.ConverterWizardActivityCsvGenerationJob:
        return await handleConverterWizardReportJob(notification);
      case JobType.RefreshFundingJob:
        return await handleRefreshFundingJobNotification(notification);
      case JobType.ApproveAllCalculationsJob:
        return await handleApproveAllCalculationsJob(notification);
      case JobType.RunConverterDatasetMergeJob:
        return await handleConverterWizardJob(notification);
      case JobType.EditSpecificationJob:
        return await handleEditSpecificationJob(notification);
    }
  }

  async function handleObservedJobNotification(notification: JobNotification) {
    if (
      !observedJobSubscription ||
      !notification?.latestJob ||
      notification.subscription.id !== observedJobSubscription.id
    )
      return;

    const observedJob = notification.latestJob;
    if (!observedJob || observedJob.isActive) return;
    if (observedJob.isComplete) {
      if (observedJob.isFailed) {
        addError({
          error: observedJob.outcome ?? "An unknown error occurred",
          description: "A background job failed",
        });
      }
      dispatch(action.clearJobObserverState());
      removeSub(observedJobSubscription.id);
      setObservedJobSubscription(undefined);
    }
  }

  async function handleRefreshFundingJobNotification(notification: JobNotification) {
    if (notification?.latestJob?.jobType !== JobType.RefreshFundingJob) return;

    const job = notification.latestJob;
    if (job.isComplete) {
      removeSub(notification.subscription.id);

      if (job.isSuccessful) {
        onSuccessfulRefreshFunding();
      } else {
        addError({
          error: job.outcome || job.statusDescription,
          description: "Failed to choose specification for funding",
        });
      }
    }
  }

  async function handleApproveAllCalculationsJob(notification: JobNotification) {
    if (notification.latestJob?.jobType !== JobType.ApproveAllCalculationsJob) return;

    if (observedJobSubscription && notification.subscription.id === observedJobSubscription.id) {
      await handleObservedJobNotification(notification);
    }

    const job = notification.latestJob;
    setApproveAllCalcsJob(job);
    if (job.isComplete) {
      removeSub(notification.subscription.id);
    }
  }

  async function handleConverterWizardJob(notification: JobNotification) {
    if (notification.latestJob?.jobType !== JobType.RunConverterDatasetMergeJob) return;

    if (observedJobSubscription && notification.subscription.id === observedJobSubscription.id) {
      await handleObservedJobNotification(notification);
    }

    const job = notification.latestJob;
    if (job.isActive) {
      setConverterWizardJob(job);
    } else {
      // we don't do anything with success or fail
      setConverterWizardJob(undefined);
    }
  }

  async function handleEditSpecificationJob(notification: JobNotification) {
    if (notification.latestJob?.jobType !== JobType.EditSpecificationJob) {
      return;
    }

    if (observedJobSubscription && notification.subscription.id === observedJobSubscription.id) {
      return await handleObservedJobNotification(notification);
    }

    const job = notification.latestJob;
    if (job.isFailed) {
      addError({
        error: job.outcome as string,
        description: "There has been a problem updating this specification",
      });
    }
  }

  async function handleConverterWizardReportJob(notification: JobNotification) {
    if (notification.latestJob?.jobType !== JobType.ConverterWizardActivityCsvGenerationJob) return;

    if (observedJobSubscription && notification.subscription.id === observedJobSubscription.id) {
      setLastConverterWizardReportDate(undefined);
      return await handleObservedJobNotification(notification);
    }

    const job = notification.latestJob;
    if (job.isComplete) {
      if (job.isSuccessful) {
        setLastConverterWizardReportDate(job.lastUpdated);
        return;
      } else {
        addError({
          description: "Converter wizard report failed",
          error: job.outcome || job.statusDescription,
        });
      }
    }
    setLastConverterWizardReportDate(undefined);
  }

  const monitorApproveAllCalculationsJob = async (jobId: string) => {
    await addSub({
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      fetchPriorNotifications: true,
      filterBy: {
        specificationId: specificationId,
        jobTypes: [JobType.ApproveAllCalculationsJob],
        jobId: jobId,
      },
      onError: (e) =>
        addError({ error: e, description: "Error while checking for approve all calculation job" }),
    });
  };

  const monitorAssignTemplateCalculationsJob = async () => {
    await addSub({
      filterBy: {
        specificationId: specificationId,
        jobTypes: [JobType.AssignTemplateCalculationsJob],
      },
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      onError: (err) => addError({ error: err, description: "Error while checking for background jobs" }),
    });
  };

  const monitorRefreshFundingJob = async (jobId: string) => {
    await addSub({
      monitorMode: MonitorMode.SignalR,
      filterBy: {
        specificationId: specificationId,
        jobTypes: [JobType.RefreshFundingJob],
        jobId: jobId,
      },
      onError: (e) => addError({ error: e, description: "Error while checking for refresh funding job" }),
    });
  };

  const monitorConverterWizardJob = async () => {
    await addSub({
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      filterBy: {
        specificationId: specificationId,
        jobTypes: [
          JobType.RunConverterDatasetMergeJob,
          JobType.ConverterWizardActivityCsvGenerationJob,
          JobType.EditSpecificationJob,
        ],
      },
      onError: (e) => addError({ error: e, description: "Error while checking for converter wizard job" }),
    });
  };

  useEffect(() => {
    if (jobObserverState?.jobFilter) {
      addSub({
        filterBy: jobObserverState.jobFilter,
        monitorMode: MonitorMode.SignalR,
        onError: (e) => addError({ error: e, description: "Error while trying to monitor background jobs" }),
      }).then((sub) => setObservedJobSubscription(sub as JobSubscription));
    }
  }, [jobObserverState]);

  useEffect(() => {
    return () => {
      removeAllSubs();
    };
  }, []);

  return {
    lastConverterWizardReportDate,
    isRefreshJobMonitoring,
    isApproveCalcsJobMonitoring,
    isApproveCalcsJobRunning,
    converterWizardJob,
    approveAllCalculationsJob,
    monitorApproveAllCalculationsJob,
    monitorConverterWizardJob,
    monitorRefreshFundingJob,
    monitorAssignTemplateCalculationsJob,
  };
};
