import { AxiosError } from "axios";
import { assoc } from "ramda";
import { useEffect, useState } from "react";

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
  monitorMode?: MonitorMode; // defaults to signal r mode
  monitorFallback?: MonitorFallback; // defaults to polling
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
  const [subs, setSubs] = useState<JobSubscription[]>([]);
  const { notifications, addNotification } = useNotifications({ subs, notify });
  const [jobPollingInterval, setJobPollingInterval] = useState<number>(0);
  const [isSignalREnabled, setIsSignalREnabled] = useState<boolean>(false);

  // overwrite all subscriptions
  const replaceSubs = (request: AddJobSubscription[]): JobSubscription[] => {
    console.log("useJobSubscription.replaceSubs: Replacing existing job subscriptions with new ones");

    reset();

    const newSubs = request.map((x) => convert(x));
    setSubs(newSubs);

    if (newSubs.some((s) => s.isEnabled && s.monitorMode === MonitorMode.SignalR)) {
      console.log("useJobSubscription.replaceSubs: Starting signalR because of new subs");
      setIsSignalREnabled(true);
    }
    return newSubs;
  };

  // add single sub
  const addSub = async (request: AddJobSubscription): Promise<JobSubscription> => {
    const newSub = convert(request);
    const existing = findExistingSubscription(subs, newSub);
    if (!existing) {
      console.log(
        "useJobSubscription.addSub: Subscribing to jobs with " +
          `jobId=[${newSub.filterBy.jobId?.length ? newSub.filterBy.jobId : "any"}], ` +
          `jobTypes=[${newSub.filterBy.jobTypes?.length ? newSub.filterBy.jobTypes.join(",") : "any"}], ` +
          `specificationId=[${
            newSub.filterBy?.specificationId?.length ? newSub.filterBy.specificationId : "any"
          }]`,
        newSub
      );
      setSubs((existing) => [...existing, newSub]);
      if (!isSignalREnabled && newSub.isEnabled && newSub.monitorMode === MonitorMode.SignalR) {
        console.log("useJobSubscription.addSub: triggering startup of signalR because of new sub");
        setIsSignalREnabled(true);
      }
    } else {
      console.log("useJobSubscription.addSub: Subscription already exists", newSub, existing);
      console.log("useJobSubscription.addSub: triggering fetch of previous job results");
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

  const kickstartSignalR = () => {
    console.log("useJobSubscription.kickstartSignalR");
    if (subs.some((s) => s.isEnabled && s.monitorMode === MonitorMode.SignalR)) {
      setIsSignalREnabled(true);
    }
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
      setTimeout(() => kickstartSignalR(), milliseconds.TenSeconds);
    }
  };

  const onSignalRReconnected = async () => {
    console.log("useJobSubscription.onSignalRReconnected: SignalR has reconnected");

    // cancel polling because we now have signalR working again
    if (jobPollingInterval > 0) {
      console.log("useJobSubscription.onSignalRReconnected: Clearing polling");
      setJobPollingInterval(0);
    }

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

  const isSignalRJobMonitorEnabled = isEnabled && isSignalREnabled;
  const { results: signalRResults } = useSignalRJobMonitor({
    onError,
    mode: findUniqueSpecificationIdInSubscriptions(subs)
      ? JobMonitorMode.WatchSingleSpecification
      : JobMonitorMode.WatchAllJobs,
    isEnabled: isSignalRJobMonitorEnabled,
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
      console.log("Looked up job by job id", job);
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
      console.log("Looked up job by job type", job);
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
          `Looked up job by specification [${filter.specificationId}] and triggered entity id [${filter.triggerByEntityId}]`,
          job
        );
        jobs = job ? [job] : [];
      }
    } else {
      jobs = await checkForSpecificationJobByJobTypes(filter.specificationId, filter.jobTypes);
      console.log(
        `Looked up jobs by specification [${filter.specificationId}] and job types [${filter.jobTypes.join(
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
    if (signalRResults?.length) {
      console.log("Notifications update from SignalR", signalRResults);

      // if any results update from signalR then we can cancel polling
      if (jobPollingInterval > 0) {
        console.log("Clearing polling");
        setJobPollingInterval(0);
      }
      addNotification(signalRResults);
    }
  }, [signalRResults]);

  useEffect(() => {
    if ((isSignalRJobMonitorEnabled || jobPollingInterval > 0) && (!subs || subs.length === 0)) {
      // no subs, deactivate signalR and polling
      console.log("No subscriptions yet - therefore disable both signalR and polling");
      setIsSignalREnabled(false);
      setJobPollingInterval(0);
      return;
    }

    console.log("useJobSubscription[subs]: Subscription state change", subs);

    // enable polling?
    if (
      !isSignalRJobMonitorEnabled &&
      jobPollingInterval === 0 &&
      subs.some((s) => s.isEnabled && s.monitorFallback === MonitorFallback.Polling)
    ) {
      // signalR is currently disabled & subs with fallback polling: make sure polling is enabled if applicable
      console.log("useJobSubscription[subs]: SignalR disabled - initiating polling");
      setJobPollingInterval(milliseconds.TenSeconds);
    }

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
