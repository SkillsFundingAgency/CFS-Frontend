import {
    AddJobSubscription,
    JobNotification,
    JobSubscription,
    MonitorFallback,
    MonitorMode
} from "../hooks/Jobs/useJobSubscription";
import {v4 as uuidv4} from "uuid";
import {DateTime} from "luxon";
import {JobDetails} from "../types/jobDetails";
import {JobMonitoringFilter} from "../types/Jobs/JobMonitoringFilter";
import {equals, uniq} from "ramda";

const jobSubscriptionUtilities = () => {

    const findExistingSubscription = (subs: JobSubscription[], newSub: AddJobSubscription): 
        JobSubscription | undefined => {
        return subs.find(s => s.isEnabled === newSub.isEnabled &&
            s.fetchPriorNotifications === newSub.fetchPriorNotifications &&
            s.monitorFallback === newSub.monitorFallback &&
            s.monitorMode === newSub.monitorMode &&
            equals(s.filterBy, newSub.filterBy)
        );
    };

    const convert = (request: AddJobSubscription): JobSubscription => {
        return {
            fetchPriorNotifications: request.fetchPriorNotifications,
            filterBy: request.filterBy,
            id: uuidv4(),
            isEnabled: request.isEnabled ?? true,
            monitorFallback: request.monitorFallback ?? MonitorFallback.None,
            monitorMode: request.monitorMode ?? MonitorMode.SignalR,
            onDisconnect: request.onDisconnect,
            onError: request.onError,
            startDate: DateTime.now(),
            lastUpdate: undefined
        };
    }

    // determine whether all subs are looking at the same spec and if so which one
    const findUniqueSpecificationIdInSubscriptions = (subs: JobSubscription[]): string | undefined => {
        const distinctSpecs = uniq(subs.map(s => s.filterBy.specificationId));
        return distinctSpecs.length === 1 && distinctSpecs[0] !== undefined ? distinctSpecs[0] : undefined;
    }

    const findMatchingSubs = (subs: JobSubscription[], job: JobDetails): JobSubscription[] => {
        if (!subs || subs.length === 0) {
            return [];
        }

        const matches = subs.filter(s => s.isEnabled
            && filterJobsByType(job, s.filterBy)
            && filterJobsByTriggeringEntityId(job, s.filterBy)
            && filterJobsByIdOrParent(job, s.filterBy)
            && filterJobsBySpecification(job, s.filterBy));

        return matches ?? [];
    };

    const filterJobsByType = (job: JobDetails, filterBy: JobMonitoringFilter) => {
        return !filterBy.jobTypes || (filterBy.jobTypes.length === 0 || filterBy.jobTypes.find(type => job.jobType === type.toString()));
    };

    const filterJobsByIdOrParent = (job: JobDetails, filterBy: JobMonitoringFilter) => {
        return !filterBy.jobId ||
            (job.jobId === filterBy.jobId || (filterBy.includeChildJobs !== false && job.parentJobId === filterBy.jobId));
    };

    const filterJobsByTriggeringEntityId = (job: JobDetails, filterBy: JobMonitoringFilter) => {
        return !filterBy.triggerByEntityId ||
            job.triggeredByEntityId === filterBy.triggerByEntityId;
    };

    const filterJobsBySpecification = (job: JobDetails, filterBy: JobMonitoringFilter) => {
        return !filterBy.specificationId || job.specificationId === filterBy.specificationId;
    };

    const findSubsWithSignalROrFallbackPolling = (subscriptions: JobSubscription[]) =>
        subscriptions
            .filter(s => s.monitorFallback === MonitorFallback.Polling || s.monitorMode === MonitorMode.SignalR);

    const anySubsWithSignalROrFallbackPolling = (subscriptions: JobSubscription[]): boolean =>
        subscriptions.some(s => s.monitorFallback === MonitorFallback.Polling || s.monitorMode === MonitorMode.SignalR);

    const isJobIdValid = (jobId: string | undefined) => {
        return !!jobId && jobId.length > 1; // to catch edge case of 0 turned to string
    };

    const isJobValid = (job: JobDetails | undefined) => {
        return !!job && isJobIdValid(job.jobId);
    };

    const shouldUpdateNotification = (a: JobNotification | undefined, b: JobNotification) => {
        if (!a?.subscription?.lastUpdate) return true;
        if (!b?.subscription?.lastUpdate) return false;

        return a.subscription.lastUpdate < b.subscription.lastUpdate;
    };
    
    return {
        findExistingSubscription,
        convert,
        findUniqueSpecificationIdInSubscriptions,
        findMatchingSubs,
        findSubsWithSignalROrFallbackPolling,
        anySubsWithSignalROrFallbackPolling,
        isJobIdValid,
        isJobValid,
        shouldUpdateNotification,
    }
}

export default jobSubscriptionUtilities;
