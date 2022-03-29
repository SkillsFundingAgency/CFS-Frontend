import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import { getJobDetailsFromJobResponse } from "../../helpers/jobDetailsHelper";
import { milliseconds } from "../../helpers/TimeInMs";
import { JobDetails, JobResponse } from "../../types/jobDetails";
import { JobMonitoringFilter } from "../../types/Jobs/JobMonitoringFilter";
import { JobNotification, JobSubscription, MonitorMode } from "../../types/Jobs/JobSubscriptionModels";

export enum JobMonitorMode {
  WatchSingleSpecification,
  WatchAllJobs,
}

export interface SignalRJobMonitorProps {
  subscriptions: JobSubscription[];
  mode: JobMonitorMode;
  onError: (err: AxiosError | Error | string) => void;
  isEnabled?: boolean;
  onReconnecting?: () => void;
  onReconnection?: () => void;
  onClose?: () => void;
  onFail?: (error: string) => void;
}

export interface SignalRJobMonitorResult {
  results: JobNotification[];
  forceReset: () => void;
}

// N.B.: this is either watching all jobs or just the specification specific jobs
export const useSignalRJobMonitor = ({
  subscriptions,
  mode,
  onError,
  isEnabled,
  onReconnecting,
  onReconnection,
  onFail,
  onClose,
}: SignalRJobMonitorProps): SignalRJobMonitorResult => {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [newJob, setNewJob] = useState<JobDetails>();
  const [hubConnection, setHubConnection] = useState<HubConnection>();
  const [resetCount, setResetCount] = useState<number>(0);
  const previousHubState = useRef<HubConnectionState>(HubConnectionState.Disconnected);
  const previousEnabledState = useRef<boolean>(!!isEnabled);
  const initialisationCount = useRef<number>(0);

  const initialiseHub = () => {
    initialisationCount.current++;
    console.log("useSignalRJobMonitor: initialising hub #" + initialisationCount.current);
    const hub = new HubConnectionBuilder()
      .withUrl("/api/notifications")
      .withAutomaticReconnect([5, 8, 13])
      .configureLogging(LogLevel.Debug)
      .build();
    hub.keepAliveIntervalInMilliseconds = milliseconds.ThreeMinutes;
    hub.serverTimeoutInMilliseconds = milliseconds.SixMinutes;
    setHubConnection(hub);
  };

  const forceReset = useCallback(() => setResetCount((curr) => curr + 1), []);

  const isInSubscriptions = (notification: JobNotification, subs: JobSubscription[]) => {
    return subs.some((s) => s.id === notification.subscription.id);
  };

  const excludeSubscriptionsFromNotifications = (
    notifications: JobNotification[],
    subs: JobSubscription[]
  ) => {
    // given existing notifications, return those not matching the subscriptions provided
    return notifications.filter((n) => !isInSubscriptions(n, subs));
  };

  const createJobNotification = (job: JobDetails, sub: JobSubscription): JobNotification => {
    return {
      latestJob: job,
      subscription: sub,
    };
  };

  const hasEnabledSubscriptions = () => {
    return (
      subscriptions.length > 0 &&
      (isEnabled === undefined || isEnabled) &&
      subscriptions.some((s) => s.isEnabled && s.monitorMode === MonitorMode.SignalR)
    );
  };

  const findSingleSpecificationId = (subs: JobSubscription[]): string | undefined => {
    let specId: string | undefined;
    subs.forEach(({ filterBy }) => {
      if (!filterBy.specificationId || filterBy.specificationId === specId) return false;
      specId = filterBy.specificationId;
    });
    return specId;
  };

  const isThisJobValid = (job: JobResponse) => {
    return job && job.jobId && job.jobId.length > 1; // to catch edge case of 0 turned to string
  };

  useEffect(() => {
    console.log("useSignalRJobMonitor: hubConnection: resetCount #" + resetCount);
    if (!hubConnection || hubConnection.state !== HubConnectionState.Connected) {
      initialiseHub();
    }
  }, [resetCount]);

  const stopSignalR = async () => {
    if (hubConnection) {
      console.log("SignalR: shutting down", hubConnection);
      await hubConnection.stop();
      console.log("SignalR: shut down", hubConnection);
    }
  };

  const startSignalR = async () => {
    if (hubConnection) {
      console.log("SignalR.startSignalR: hub starting", hubConnection);
      await hubConnection.start();
      console.log("SignalR.startSignalR: hub started", hubConnection);
      console.log("SignalR.startSignalR: initiating job monitoring");
      await initJobMonitoring();
    }
  };

  const findMatchingSubs = (job: JobResponse | JobDetails): JobSubscription[] => {
    if (!hasEnabledSubscriptions()) {
      return [];
    }

    const matches = subscriptions.filter(
      (s) =>
        s.isEnabled &&
        s.monitorMode === MonitorMode.SignalR &&
        filterJobsByType(job, s.filterBy) &&
        filterJobsByTriggeringEntityId(job, s.filterBy) &&
        filterJobsByIdOrParent(job, s.filterBy) &&
        filterJobsBySpecification(job, s.filterBy)
    );

    return matches ?? [];
  };

  const filterJobsByType = (job: JobResponse | JobDetails, filterBy: JobMonitoringFilter) => {
    return (
      !filterBy.jobTypes ||
      filterBy.jobTypes.length === 0 ||
      filterBy.jobTypes.find((type) => job.jobType === type.toString())
    );
  };

  const filterJobsByTriggeringEntityId = (job: JobResponse | JobDetails, filterBy: JobMonitoringFilter) => {
    return !filterBy.triggerByEntityId || job.trigger?.entityId === filterBy.triggerByEntityId;
  };

  const filterJobsByIdOrParent = (job: JobResponse | JobDetails, filterBy: JobMonitoringFilter) => {
    return (
      !filterBy.jobId ||
      job.jobId === filterBy.jobId ||
      (filterBy.includeChildJobs !== false && job.parentJobId === filterBy.jobId)
    );
  };

  const filterJobsBySpecification = (job: JobResponse | JobDetails, filterBy: JobMonitoringFilter) => {
    return !filterBy.specificationId || job.specificationId === filterBy.specificationId;
  };

  const processMessage = (message: any) => {
    console.log("useSignalRJobMonitor.processMessage: received job", message);
    const job = message as JobResponse;
    if (isThisJobValid(job)) {
      const jobDetails = getJobDetailsFromJobResponse(job);
      if (jobDetails) {
        setNewJob(jobDetails);
      }
    }
  };

  const notifyDisconnection = (error: Error | string | undefined) => {
    console.log("useSignalRJobMonitor: disconnected", error);
    const realError = error as Error;
    const errorMessage = realError
      ? `Error while monitoring jobs: ${realError.message}`
      : error
      ? (error as string)
      : null;
    if (errorMessage) console.error(errorMessage);
    if (errorMessage && !!onFail) {
      onFail(errorMessage);
    } else if (onClose) {
      onClose();
    } else if (errorMessage && !!onError) {
      onError(errorMessage);
    }
  };

  const notifyReconnection = () => {
    console.log("useSignalRJobMonitor: reconnected");
    onReconnection && onReconnection();
  };

  const notifyReconnecting = (error: Error | string | undefined) => {
    console.log("useSignalRJobMonitor: reconnecting", error);
    if (error) console.error(error);
    onReconnecting && onReconnecting();
  };

  const initSignalR = async () => {
    if (!hubConnection) {
      console.log("useSignalRJobMonitor.initSignalR: Cannot start signalR because hub is undefined");
      return;
    }

    try {
      console.log("useSignalRJobMonitor.initSignalR: setting up configuration");

      hubConnection.on("NotificationEvent", processMessage);
      hubConnection.onclose((error) => notifyDisconnection(error));
      hubConnection.onreconnecting((error) => notifyReconnecting(error));
      hubConnection.onreconnected(notifyReconnection);

      console.log("useSignalRJobMonitor.initSignalR: connecting");
      await startSignalR();
    } catch (err: any) {
      console.error("useSignalRJobMonitor.initSignalR: error", err);
      await stopSignalR();
      notifyDisconnection(err);
    }
  };

  const initJobMonitoring = async () => {
    if (!subscriptions?.length) {
      console.log(
        "useSignalRJobMonitor.initJobMonitoring: Cannot start monitoring because there are no subs"
      );
      return;
    }
    if (!hubConnection || hubConnection.state !== HubConnectionState.Connected) {
      console.log(
        "useSignalRJobMonitor.initJobMonitoring: Cannot start monitoring because hub is not yet connected. Scheduling retry in 10 secs..."
      );
      setTimeout(() => initJobMonitoring(), milliseconds.TenSeconds);
      return;
    }
    try {
      // if all subs are linked to the SAME spec, then just follow that spec
      const specId = findSingleSpecificationId(subscriptions);
      if (mode === JobMonitorMode.WatchSingleSpecification && specId) {
        console.log(
          "useSignalRJobMonitor.initJobMonitoring: invoking StartWatchingForSpecificationNotifications",
          specId
        );
        await hubConnection.invoke("StartWatchingForSpecificationNotifications", specId);
      } else {
        // otherwise follow everything
        console.log("useSignalRJobMonitor.initJobMonitoring: invoking StartWatchingForAllNotifications");
        await hubConnection?.invoke("StartWatchingForAllNotifications");
      }
    } catch (err: any) {
      console.error("useSignalRJobMonitor.initJobMonitoring: error", err);
      await stopSignalR();
      notifyDisconnection(err);
    }
  };

  const stopSignalrIfInactive = () => {
    if (
      !hubConnection ||
      hubConnection.state === HubConnectionState.Disconnected ||
      hubConnection.state === HubConnectionState.Disconnecting
    ) {
      console.log("useSignalRJobMonitor.stopSignalrIfInactive: hub already stopped or stopping");
    }

    if (isEnabled === undefined) {
      // reschedule to when initialised
      console.log("useSignalRJobMonitor.stopSignalrIfInactive: rescheduling for 10 secs");
      setTimeout(() => stopSignalrIfInactive(), milliseconds.TenSeconds);
    }

    // for some reason isEnabled can be false and subscriptions can be empty here even when there are new subscriptions
    if (hasEnabledSubscriptions()) {
      console.log("useSignalRJobMonitor.stopSignalrIfInactive: now active so not stopping");
      return;
    }

    console.log("useSignalRJobMonitor.stopSignalrIfInactive: now stopping", subscriptions);
    stopSignalR();
  };

  useEffect(() => {
    if (newJob) {
      const matchingSubscriptions = findMatchingSubs(newJob);
      if (matchingSubscriptions.length > 0) {
        console.log(
          `useSignalRJobMonitor[newJob]: new job: creating ${newJob.completionStatus || ""} ${
            newJob.runningStatus
          } job notification`,
          newJob
        );
        const updated = matchingSubscriptions.map((sub) => createJobNotification(newJob, sub));
        setNotifications((existing) => {
          const unchanged = excludeSubscriptionsFromNotifications(existing, subscriptions);
          return [...unchanged, ...updated];
        });
      } else {
        // no matching subscription found for this job
      }
    }
  }, [newJob]);

  useEffect(() => {
    if (!hubConnection) {
      console.log("useSignalRJobMonitor[hubConnection?.state]: SignalR hub is undefined", subscriptions);
      return;
    }

    const prevState = previousHubState.current;
    const currState = hubConnection?.state;
    const haveEnabledSubs = hasEnabledSubscriptions();
    console.log(
      `useSignalRJobMonitor[hubConnection?.state]: [isEnabled: "${previousEnabledState.current?.toString()}" -> "${isEnabled?.toString()}", subscriptions: ${
        subscriptions.length
      }, hubConnection.state: "${prevState}" -> "${currState}"]`,
      subscriptions
    );

    // handle hub state change
    if (previousHubState.current !== hubConnection.state) {
      // notify if connection has been lost
      if (
        prevState === HubConnectionState.Connected &&
        (currState === HubConnectionState.Disconnected || currState === HubConnectionState.Disconnecting)
      ) {
        if (haveEnabledSubs) {
          notifyDisconnection("SignalR has disconnected");
          subscriptions.forEach((s) => s.isEnabled && !!s.onDisconnect && s.onDisconnect());
        }
      }

      // restart monitoring?
      if (currState === HubConnectionState.Disconnected && haveEnabledSubs) {
        console.log("useSignalRJobMonitor: criteria for initialisation detected");
        initSignalR();
      }

      if (currState !== HubConnectionState.Disconnected && !haveEnabledSubs) {
        console.log("useSignalRJobMonitor: criteria for shutting down detected");
        setTimeout(() => stopSignalrIfInactive(), milliseconds.TenSeconds);
      }

      if (currState == HubConnectionState.Connected && haveEnabledSubs) {
        console.log("useSignalRJobMonitor: now connected: trigger job monitoring");
        initJobMonitoring();
      }

      previousHubState.current = hubConnection.state;
    }
  }, [hubConnection?.state]);

  useEffect(() => {
    if (!hubConnection) {
      console.log("useSignalRJobMonitor[isEnabled]: SignalR hub is undefined", subscriptions);
      return;
    }

    const prevState = previousHubState.current;
    const currState = hubConnection?.state;
    const haveEnabledSubs = hasEnabledSubscriptions();
    console.log(
      `useSignalRJobMonitor[isEnabled]: [isEnabled: "${previousEnabledState.current?.toString()}" -> "${isEnabled?.toString()}", subscriptions: ${
        subscriptions.length
      }, hubConnection.state: "${prevState}" -> "${currState}"]`,
      subscriptions
    );

    // change in isEnabled
    if (!previousEnabledState.current && isEnabled) {
      // kickstart
      if (currState == HubConnectionState.Connected && haveEnabledSubs) {
        console.log("useSignalRJobMonitor[isEnabled]: now connected: trigger job monitoring");
        initJobMonitoring();
      }
    }

    if (previousEnabledState.current !== !!isEnabled) {
      previousEnabledState.current = !!isEnabled;
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!hubConnection) {
      console.log("useSignalRJobMonitor[subscriptions]: SignalR hub is undefined", subscriptions);
      return;
    }

    const prevState = previousHubState.current;
    const currState = hubConnection?.state;
    const haveEnabledSubs = hasEnabledSubscriptions();
    console.log(
      `useSignalRJobMonitor[subscriptions]: [isEnabled: "${previousEnabledState.current?.toString()}" -> "${isEnabled?.toString()}", subscriptions: ${
        subscriptions.length
      }, hubConnection.state: "${prevState}" -> "${currState}"]`,
      subscriptions
    );

    if (currState === HubConnectionState.Disconnected && haveEnabledSubs) {
      console.log("useSignalRJobMonitor[subscriptions]: criteria for initialisation detected");
      initSignalR();
    }

    if (currState !== HubConnectionState.Disconnected && !haveEnabledSubs) {
      console.log("useSignalRJobMonitor[subscriptions]: criteria for shutting down detected");
      setTimeout(() => stopSignalrIfInactive(), milliseconds.TenSeconds);
    }
  }, [subscriptions]);

  return {
    results: notifications,
    forceReset,
  };
};
