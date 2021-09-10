import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";

import { getJobDetailsFromJobResponse } from "../../helpers/jobDetailsHelper";
import { milliseconds } from "../../helpers/TimeInMs";
import { JobDetails, JobResponse } from "../../types/jobDetails";
import { JobMonitoringFilter } from "../../types/Jobs/JobMonitoringFilter";
import { JobNotification, JobSubscription, MonitorMode } from "./useJobSubscription";

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
  state: HubConnectionState | undefined;
  isMonitoring: boolean;
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
  const hubRef = useRef<HubConnection>();

  const hasInitialised = () => !!hubConnection;

  const hasDisconnected = () => hubConnection?.state == HubConnectionState.Disconnected;

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

  const stopSignalR = async () => {
    console.log("SignalR: shutting down");
    hubConnection?.stop();

    if (hubRef?.current) {
      await hubRef?.current?.stop();
      hubRef.current = undefined;
    }

    setHubConnection(undefined);
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
    console.log("SignalR: received job", message);
    const job = message as JobResponse;
    if (isThisJobValid(job)) {
      const jobDetails = getJobDetailsFromJobResponse(job);
      if (jobDetails) {
        setNewJob(jobDetails);
      }
    }
  };

  const notifyDisconnection = (error: Error | string | undefined) => {
    console.log("SignalR: disconnected", error);
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
    console.log("SignalR: reconnected");
    onReconnection && onReconnection();
  };

  const notifyReconnecting = (error: Error | string | undefined) => {
    console.log("SignalR: reconnecting", error);
    if (error) console.error(error);
    onReconnecting && onReconnecting();
  };

  const monitorJobNotifications = async () => {
    try {
      if (!hubRef.current) {
        console.log("SignalR: setting up configuration");
        const hubConnect: HubConnection = new HubConnectionBuilder()
          .withUrl("/api/notifications")
          .withAutomaticReconnect([5, 8, 13])
          .configureLogging(LogLevel.Information)
          .build();
        hubConnect.keepAliveIntervalInMilliseconds = milliseconds.ThreeMinutes;
        hubConnect.serverTimeoutInMilliseconds = milliseconds.SixMinutes;
        hubConnect.on("NotificationEvent", processMessage);
        hubConnect.onclose((error) => notifyDisconnection(error));
        hubConnect.onreconnecting((error) => notifyReconnecting(error));
        hubConnect.onreconnected((connectionId) => notifyReconnection());

        console.log("SignalR: connecting");
        await hubConnect.start();

        // if all subs are linked to the SAME spec, then just follow that spec
        const specId = findSingleSpecificationId(subscriptions);
        if (mode === JobMonitorMode.WatchSingleSpecification && specId) {
          await hubConnect.invoke("StartWatchingForSpecificationNotifications", specId);
        } else {
          // otherwise follow everything
          await hubConnect.invoke("StartWatchingForAllNotifications");
        }

        setHubConnection(hubConnect);
      }
    } catch (err: any) {
      console.error("SignalR: error", err);
      await stopSignalR();
      notifyDisconnection(err);
    }
  };

  useEffect(() => {
    if (newJob) {
      const matchingSubscriptions = findMatchingSubs(newJob);
      if (matchingSubscriptions.length > 0) {
        console.log(
          `SignalR: creating ${newJob.completionStatus || ""} ${newJob.runningStatus} job notification`,
          newJob
        );
        const updated = matchingSubscriptions.map((sub) => createJobNotification(newJob, sub));
        setNotifications((existing) => {
          const unchanged = excludeSubscriptionsFromNotifications(existing, subscriptions);
          return [...unchanged, ...updated];
        });
      } else {
        console.log("SignalR: no matching subscription found for this job", newJob, subscriptions);
      }
    }
  }, [newJob]);

  useEffect(() => {
    console.log(
      `SignalR: state change [isEnabled: "${isEnabled?.toString()}", subscriptions: ${
        subscriptions.length
      }, hubConnection.state: "${hubConnection?.state}"]`,
      subscriptions
    );

    const shouldReconnect = isEnabled && hasDisconnected();
    if (shouldReconnect) {
      notifyDisconnection("SignalR has disconnected");
      subscriptions.forEach((s) => s.isEnabled && !!s.onDisconnect && s.onDisconnect());
    } else {
      if (isEnabled && hasEnabledSubscriptions() && !hasInitialised()) {
        console.log("SignalR: criteria for initialisation detected");
        monitorJobNotifications();
      } else {
        if (!isEnabled || (!hasEnabledSubscriptions && hubRef.current)) {
          console.log("SignalR: criteria for shutting down detected");
          stopSignalR();
        } else {
          hubRef.current = hubConnection;
        }
      }
    }
  }, [isEnabled, subscriptions, hubConnection]);

  return {
    results: notifications,
    state: hubRef.current?.state,
    isMonitoring:
      !!hubRef.current &&
      (hubRef.current?.state == HubConnectionState.Connecting ||
        hubRef.current?.state === HubConnectionState.Connected ||
        hubRef.current?.state === HubConnectionState.Reconnecting),
  };
};
