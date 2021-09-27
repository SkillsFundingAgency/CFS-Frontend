import { AxiosError } from "axios";
import { DateTime } from "luxon";

import { JobDetails } from "../jobDetails";
import { JobMonitoringFilter } from "./JobMonitoringFilter";

export interface JobSubscription {
  id: string;
  fetchPriorNotifications?: boolean;
  filterBy: JobMonitoringFilter;
  onError: (err: AxiosError | Error | string) => void;
  isEnabled: boolean;
  onDisconnect?: () => void;
  monitorMode?: MonitorMode;
  monitorFallback?: MonitorFallback;
  startDate: DateTime;
  lastUpdate?: DateTime;
}

export interface JobNotification {
  subscription: JobSubscription;
  latestJob?: JobDetails;
}

export enum MonitorMode {
  Off = "Off",
  SignalR = "SignalR",
  Polling = "Polling",
}

export enum MonitorFallback {
  None = "None",
  Polling = "Polling",
}

export interface AddJobSubscription {
  fetchPriorNotifications?: boolean;
  filterBy: JobMonitoringFilter;
  onError: (err: AxiosError | Error | string) => void;
  isEnabled?: boolean | undefined;
  onDisconnect?: () => void;
  monitorMode?: MonitorMode;
  monitorFallback?: MonitorFallback;
}
