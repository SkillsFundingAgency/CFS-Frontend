import { AxiosError } from "axios";
import { assoc } from "ramda";
import * as React from "react";
import { useEffect } from "react";

import { getJobDetailsFromJobResponse } from "../../helpers/jobDetailsHelper";
import {
  anySubsWithSignalROrFallbackPolling,
  convert,
  findExistingSubscription,
  findMatchingSubs,
  findSubsWithSignalROrFallbackPolling,
  findUniqueSpecificationIdInSubscriptions,
  isJobIdValid,
  isJobValid,
} from "../../helpers/jobSubscriptionUtilities";
import { milliseconds } from "../../helpers/TimeInMs";
import {
  getJob,
  getJobStatusUpdatesForSpecification,
  getLatestJobByEntityId,
  getLatestJobByJobDefinitionId,
} from "../../services/jobService";
import { JobDetails } from "../../types/jobDetails";
import { JobMonitoringFilter } from "../../types/Jobs/JobMonitoringFilter";
import {
  JobNotification,
  JobSubscription,
  MonitorFallback,
  MonitorMode,
} from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { useInterval } from "../useInterval";
import { useNotifications } from "./useNotifications";
import { JobMonitorMode, useSignalRJobMonitor } from "./useSignalRJobMonitor";

export interface AddJobSubscription {
  fetchPriorNotifications?: boolean;
  filterBy: JobMonitoringFilter;
  onError: (err: AxiosError | Error | string) => void;
  isEnabled?: boolean | undefined;
  onDisconnect?: () => void;
  monitorMode?: MonitorMode;
  monitorFallback?: MonitorFallback;
}

export interface JobSubscriptionProps {
  onError: (err: AxiosError | Error | string) => void;
  onNewNotification?: (notification: JobNotification) => void;
  isEnabled?: boolean;
}

export interface JobSubscriptionResult {
  addSub: (request: AddJobSubscription) => Promise<JobSubscription>;
  replaceSubs: (request: AddJobSubscription[]) => JobSubscription[];
  removeSub: (id: string) => void;
  removeAllSubs: () => void;
  subs: JobSubscription[];
  results: JobNotification[];
}

// used to monitor multiple jobs, including polling as a fallback, and to stop/start monitoring
export const useJobSubscription = ({
  onError,
  onNewNotification,
  isEnabled = true,
}: JobSubscriptionProps): JobSubscriptionResult => {
  const [subs, setSubs] = React.useState<JobSubscription[]>([]);
  const { notifications, addNotification } = useNotifications({ subs, notify });
  const [jobPollingInterval, setJobPollingInterval] = React.useState<number>(0);
  const [isSignalREnabled, setIsSignalREnabled] = React.useState<boolean>(isEnabled);

  const replaceSubs = (request: AddJobSubscription[]): JobSubscription[] => {
    console.log("Replacing existing job subscriptions with new ones");
    reset();

    const newSubs = request.map((x) => convert(x));
    setSubs(newSubs);
    if (newSubs.some((s) => s.isEnabled && s.monitorMode === MonitorMode.SignalR)) {
      setIsSignalREnabled(true);
    }
    return newSubs;
  };

  const addSub = async (request: AddJobSubscription): Promise<JobSubscription> => {
    console.log("Adding job subscription", request);
    const newSub = convert(request);
    const existing = findExistingSubscription(subs, newSub);
    if (!existing) {
      console.log(
        "Subscribing to jobs with " +
          `jobId=[${newSub.filterBy.jobId?.length ? newSub.filterBy.jobId : "any"}], ` +
          `jobTypes=[${newSub.filterBy.jobTypes?.length ? newSub.filterBy.jobTypes.join(",") : "any"}], ` +
          `specificationId=[${
            newSub.filterBy?.specificationId?.length ? newSub.filterBy.specificationId : "any"
          }]`,
        newSub
      );
      setSubs((existing) => [...existing, newSub]);
      if (newSub.isEnabled && newSub.monitorMode === MonitorMode.SignalR) {
        setIsSignalREnabled(true);
      }
    } else {
      console.log("Subscription already exists", newSub, existing);
    }
    if (newSub.fetchPriorNotifications) {
      console.log("Fetching previous job results");
      await loadLatestJobUpdate(newSub);
    }
    
    return newSub;
  };

  const reset = () => {
    console.log("Resetting job notifications");
    setIsSignalREnabled(true);
    setJobPollingInterval(0);
  };

  const removeSub = (id: string) => {
    console.log("Removing job subscription with id " + id);
    setSubs((existing) => existing.filter((x) => x.id !== id));
  };

  const removeAllSubs = () => {
    console.log("Removing all job subscriptions");
    setSubs([]);
  };

  const onSignalRCloseOrFail = () => {
    // trigger signalR shutdown
    setIsSignalREnabled(false);

    if (subs.length === 0) return;

    if (jobPollingInterval <= 0 && anySubsWithSignalROrFallbackPolling(subs)) {
      console.log("Initiating polling");
      setJobPollingInterval(milliseconds.TenSeconds);
    }

    if (subs.some((s) => s.isEnabled && s.monitorMode === MonitorMode.SignalR)) {
      // try to kickstart signalR
      console.log("Setting up timer to kickstart signalR");
      setInterval(() => setIsSignalREnabled(true), milliseconds.TenSeconds);
    }
  };

  const onSignalRReconnected = async () => {
    console.log("SignalR has reconnected");

    // cancel polling because we now have signalR working again
    console.log("Clearing polling");
    setJobPollingInterval(0);

    // try to find any job updates that were missed in the interim
    await loadLatestJobUpdatesForPollingSubscriptions();
  };

  const onSignalRReconnecting = () => {
    // try to find any job updates that would otherwise be missed in the interim
    if (jobPollingInterval <= 0 && anySubsWithSignalROrFallbackPolling(subs)) {
      console.log("Initiating polling");
      setJobPollingInterval(milliseconds.TenSeconds);
    }
  };

  const { results: signalRResults } = useSignalRJobMonitor({
    onError,
    mode: findUniqueSpecificationIdInSubscriptions(subs)
      ? JobMonitorMode.WatchSingleSpecification
      : JobMonitorMode.WatchAllJobs,
    isEnabled: isEnabled && isSignalREnabled && subs.length > 0,
    subscriptions: subs,
    onReconnecting: onSignalRReconnecting,
    onReconnection: onSignalRReconnected,
    onClose: () => {
      console.log("SignalR has closed");
      onSignalRCloseOrFail();
    },
    onFail: (error) => {
      console.log("SignalR has failed", error);
      onSignalRCloseOrFail();
    },
  });

  const checkForJobByJobId = async (jobId: string): Promise<JobDetails | undefined> => {
    if (!isJobIdValid(jobId)) return;
    const response = await getJob(jobId);
    if (!response.data) return undefined;
    return getJobDetailsFromJobResponse(response.data);
  };

  const checkForJobByJobType = async (jobType: JobType): Promise<JobDetails | undefined> => {
    if (!isJobIdValid(jobType)) return;
    const response = await getLatestJobByJobDefinitionId(jobType);
    if (!response.data) return undefined;
    return getJobDetailsFromJobResponse(response.data);
  };

  const checkForSpecificationJobByJobTypes = async (
    specId: string | undefined,
    jobTypes: JobType[] | undefined
  ): Promise<JobDetails[] | undefined> => {
    if (!specId || !jobTypes || jobTypes.length === 0) {
      console.error("Invalid arguments for checkForSpecificationJobByJobTypes");
      return;
    }
    const response = await getJobStatusUpdatesForSpecification(specId, jobTypes);
    const results = response.data.filter(
      (item) => item && item.jobId && item.jobId !== "" && item.lastUpdated
    );
    return results && results.length > 0
      ? results.map((r) => getJobDetailsFromJobResponse(r) as JobDetails)
      : undefined;
  };

  const checkForSpecificationJobTriggeredByEntity = async (
    specId: string | undefined,
    triggeredByEntityId: string | undefined
  ): Promise<JobDetails | undefined> => {
    if (!specId || !triggeredByEntityId || triggeredByEntityId.length === 0) {
      console.error("Invalid arguments for checkForSpecificationJobTriggeredByEntity");
      return;
    }
    const { data: result } = await getLatestJobByEntityId(specId, triggeredByEntityId);
    return result && result.jobId ? getJobDetailsFromJobResponse(result) : undefined;
  };

  function notify(input: JobNotification | JobNotification[]) {
    if (!onNewNotification) return;

    if (Array.isArray(input)) {
      input.forEach((n) => onNewNotification(n));
    } else {
      onNewNotification(input);
    }
  }

  const loadLatestJobUpdatesForPollingSubscriptions = async () => {
    await loadLatestJobUpdates(findSubsWithSignalROrFallbackPolling(subs));
  };

  // call api to get update on each active subscription
  const loadLatestJobUpdates = async (subscriptions: JobSubscription[]) => {
    subscriptions.forEach((s) => loadLatestJobUpdate(s));
  };

  const loadLatestJobUpdate = async (sub: JobSubscription) => {
    if (sub.isEnabled) {
      if (sub.filterBy.jobId) {
        await loadLatestJobUpdatesById([sub.filterBy.jobId]);
      } else if (sub.filterBy.specificationId) {
        await loadLatestJobUpdatesBySpec(sub.filterBy);
      } else if (sub.filterBy.jobTypes) {
        await loadLatestJobUpdatesByJobTypes(sub.filterBy.jobTypes);
      } else {
        console.error("Oops! Looking for jobs but no suitable api endpoint to call");
      }
    }
  };

  const loadLatestJobUpdatesById = async (jobIds: string[]) => {
    let newNotifications: JobNotification[] = [];
    for (const jobId of jobIds) {
      const job = await checkForJobByJobId(jobId);
      console.log("Polled for job by job id", job);
      if (isJobValid(job)) {
        const subsToNotify = findMatchingSubs(subs, job as JobDetails);
        subsToNotify.forEach((s) => {
          newNotifications = [
            ...newNotifications,
            {
              latestJob: job,
              subscription: s,
            },
          ];
        });
      }
    }
    addNotification(newNotifications);
  };

  const loadLatestJobUpdatesByJobTypes = async (jobTypes: JobType[]) => {
    let newNotifications: JobNotification[] = [];
    for (const jobType of jobTypes) {
      const job = await checkForJobByJobType(jobType);
      console.log("Polled for job by job type", job);
      if (isJobValid(job)) {
        const subsToNotify = findMatchingSubs(subs, job as JobDetails);
        subsToNotify.forEach((s) => {
          newNotifications = [
            ...newNotifications,
            {
              latestJob: job,
              subscription: s,
            },
          ];
        });
      }
    }
    addNotification(newNotifications);
  };

  const loadLatestJobUpdatesBySpec = async (filter: JobMonitoringFilter) => {
    let newNotifications: JobNotification[] = [];
    let jobs: JobDetails[] | undefined = undefined;

    if (!filter.jobTypes || filter.jobTypes.length == 0) {
      if (filter.specificationId && filter.triggerByEntityId) {
        const job = await checkForSpecificationJobTriggeredByEntity(
          filter.specificationId,
          filter.triggerByEntityId
        );
        console.log(
          `Polled for job by specification [${filter.specificationId}] and triggered entity id [${filter.triggerByEntityId}]`,
          job
        );
        jobs = job ? [job] : [];
      }
    } else {
      jobs = await checkForSpecificationJobByJobTypes(filter.specificationId, filter.jobTypes);
      console.log(
        `Polled for jobs by specification [${filter.specificationId}] and job types [${filter.jobTypes.join(
          ","
        )}]`,
        jobs
      );
    }

    if (!jobs || jobs.length === 0) return;

    for (const job of jobs) {
      if (isJobValid(job)) {
        const subsToNotify = findMatchingSubs(subs, job as JobDetails);
        subsToNotify.forEach((s) => {
          newNotifications = [
            ...newNotifications,
            {
              latestJob: job,
              subscription: s,
            },
          ];
        });
      }
    }
    addNotification(newNotifications);
  };

  const clearOneOffFetch = assoc("fetchPriorNotifications", false);

  useInterval(async () => {
    if (jobPollingInterval <= 0) {
      reset();
      return;
    }

    await loadLatestJobUpdatesForPollingSubscriptions();
  }, jobPollingInterval);

  useEffect(() => {
    console.log("SignalR: job update received", signalRResults);

    // if any new results from signalR then we can cancel polling
    setJobPollingInterval(0);

    addNotification(signalRResults);
  }, [signalRResults]);

  useEffect(() => {
    console.log("Subscription state change", subs);
    if (!subs || subs.length === 0) {
      // no subs, deactivate signalR and polling
      console.log("No subscriptions - therefore deactivate signalR and polling");
      setIsSignalREnabled(false);
      setJobPollingInterval(0);
    } else if (!isSignalREnabled && subs.some((s) => s.monitorFallback === MonitorFallback.Polling)) {
      // signalR is currently disabled & subs with fallback polling: make sure polling is enabled if applicable
      console.log("SignalR disabled - initiating polling");
      setJobPollingInterval(milliseconds.TenSeconds);
    } else {
      // do one off fetches and then clear flag
      const oneOffs = subs.filter((s) => s.fetchPriorNotifications);
      if (oneOffs.length) {
        oneOffs.forEach(async (sub) => {
          await loadLatestJobUpdate(sub);
        });
        setSubs((existing) => [
          ...existing.filter((s) => !oneOffs.some((o) => o.id === s.id)),
          ...oneOffs.map(clearOneOffFetch),
        ]);
      }
    }
  }, [subs]);

  return {
    addSub,
    replaceSubs,
    removeSub,
    removeAllSubs,
    subs,
    results: notifications,
  };
};
