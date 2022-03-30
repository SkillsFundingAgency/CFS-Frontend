import { DateTime } from "luxon";
import { descend, equals, head, sort, uniq } from "ramda";
import { compose } from "redux";
import { v4 as uuidv4 } from "uuid";

import { AddJobSubscription } from "../hooks/Jobs/useJobSubscription";
import { JobDetails } from "../types/jobDetails";
import { JobMonitoringFilter } from "../types/Jobs/JobMonitoringFilter";
import {
  JobNotification,
  JobSubscription,
  MonitorFallback,
  MonitorMode,
} from "../types/Jobs/JobSubscriptionModels";

export const findExistingSubscription = (
  subs: JobSubscription[],
  newSub: AddJobSubscription
): JobSubscription | undefined => {
  return subs.find(
    (s) =>
      s.isEnabled === newSub.isEnabled &&
      s.fetchPriorNotifications === newSub.fetchPriorNotifications &&
      s.monitorFallback === newSub.monitorFallback &&
      s.monitorMode === newSub.monitorMode &&
      equals(s.filterBy, newSub.filterBy)
  );
};

export const convert = (request: AddJobSubscription): JobSubscription => {
  return {
    fetchPriorNotifications: request.fetchPriorNotifications,
    filterBy: request.filterBy,
    id: uuidv4(),
    isEnabled: request.isEnabled ?? true,
    monitorFallback: request.monitorFallback ?? MonitorFallback.Polling,
    monitorMode: request.monitorMode ?? MonitorMode.SignalR,
    onDisconnect: request.onDisconnect,
    onError: request.onError,
    startDate: DateTime.now(),
    lastUpdate: undefined,
  };
};

// determine whether all subs are looking at the same spec and if so which one
export const findUniqueSpecificationIdInSubscriptions = (subs: JobSubscription[]): string | undefined => {
  const distinctSpecs = uniq(subs.map((s) => s.filterBy.specificationId));
  return distinctSpecs.length === 1 && distinctSpecs[0] !== undefined ? distinctSpecs[0] : undefined;
};

export const findMatchingSubs = (subs: JobSubscription[], job: JobDetails): JobSubscription[] => {
  if (!subs || subs.length === 0) {
    return [];
  }

  const matches = subs.filter(
    (s) =>
      s.isEnabled &&
      filterJobsByType(job, s.filterBy) &&
      filterJobsByTriggeringEntityId(job, s.filterBy) &&
      filterJobsByIdOrParent(job, s.filterBy) &&
      filterJobsBySpecification(job, s.filterBy)
  );

  return matches ?? [];
};

export const filterJobsByType = (job: JobDetails, filterBy: JobMonitoringFilter) => {
  return (
    !filterBy.jobTypes ||
    filterBy.jobTypes.length === 0 ||
    filterBy.jobTypes.find((type) => job.jobType === type.toString())
  );
};

export const filterJobsByIdOrParent = (job: JobDetails, filterBy: JobMonitoringFilter) => {
  return (
    !filterBy.jobId ||
    job.jobId === filterBy.jobId ||
    (filterBy.includeChildJobs !== false && job.parentJobId === filterBy.jobId)
  );
};

export const filterJobsByTriggeringEntityId = (job: JobDetails, filterBy: JobMonitoringFilter) => {
  return !filterBy.triggerByEntityId || job.triggeredByEntityId === filterBy.triggerByEntityId;
};

export const filterJobsBySpecification = (job: JobDetails, filterBy: JobMonitoringFilter) => {
  return !filterBy.specificationId || job.specificationId === filterBy.specificationId;
};

export const findSubsWithSignalROrFallbackPolling = (subscriptions: JobSubscription[]) =>
  subscriptions.filter(
    (s) => s.monitorFallback === MonitorFallback.Polling || s.monitorMode === MonitorMode.SignalR
  );

export const anySubsWithSignalROrFallbackPolling = (subscriptions: JobSubscription[]): boolean =>
  subscriptions.some(
    (s) => s.monitorFallback === MonitorFallback.Polling || s.monitorMode === MonitorMode.SignalR
  );

export const isJobIdValid = (jobId: string | undefined) => {
  return !!jobId && jobId.length > 1; // to catch edge case of 0 turned to string
};

export const isJobValid = (job: JobDetails | undefined) => {
  return !!job && isJobIdValid(job.jobId);
};

export const shouldUpdateNotification = (a: JobNotification | undefined, b: JobNotification): boolean => {
  if (!a?.latestJob?.lastUpdated) return true;
  if (!b?.latestJob?.lastUpdated) return false;

  return a.latestJob.lastUpdated < b.latestJob.lastUpdated;
};

export const sortNotificationsByLatestUpdate = sort<JobNotification>(
  descend((notification) => notification?.latestJob?.lastUpdated ?? new Date(0))
);

export const getNotificationWithLastUpdate = compose<JobNotification | undefined>(head, sortNotificationsByLatestUpdate);