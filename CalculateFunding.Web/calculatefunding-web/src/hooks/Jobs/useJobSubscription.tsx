import {AxiosError} from "axios";
import {JobMonitoringFilter} from "./useJobMonitor";
import * as React from "react";
import {v4 as uuidv4} from 'uuid';
import {DateTime} from "luxon";
import {JobDetails} from "../../types/jobDetails";
import {useSignalRJobMonitor} from "./useSignalRJobMonitor";
import {getJob} from "../../services/jobService";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {useInterval} from "../useInterval";
import {milliseconds} from "../../helpers/TimeInMs";
import {useEffect} from "react";

export enum MonitorMode {
    SignalR = 'SignalR',
    Polling = 'Polling'
}

export enum MonitorFallback {
    None = 'None',
    Polling = 'Polling'
}

export interface AddJobSubscription {
    filterBy: JobMonitoringFilter,
    onError: (err: AxiosError | Error | string) => void,
    isEnabled?: boolean,
    onDisconnect?: () => void,
    monitorMode?: MonitorMode,
    monitorFallback?: MonitorFallback,
}

export interface JobSubscription {
    id: string,
    filterBy: JobMonitoringFilter,
    onError: (err: AxiosError | Error | string) => void,
    isEnabled?: boolean,
    onDisconnect?: () => void,
    monitorMode?: MonitorMode,
    monitorFallback?: MonitorFallback,
    startDate: DateTime,
    lastUpdate?: DateTime
}

export interface JobNotification {
    subscription: JobSubscription,
    latestJob?: JobDetails
}

export interface JobSubscriptionProps {
    onError: (err: AxiosError | Error | string) => void,
    isEnabled?: boolean,
}

// used to monitor multiple jobs, including polling as a fallback, and to stop/start monitoring
// limitation of the polling: only works when we know the jobId as there's no other suitable jobs api endpoint to use
export const useJobSubscription = ({
                                       onError,
                                       isEnabled = true
                                   }: JobSubscriptionProps) => {

    const [subs, setSubs] = React.useState<JobSubscription[]>([]);
    const [notifications, setNotifications] = React.useState<JobNotification[]>([]);
    const [jobPollingInterval, setJobPollingInterval] = React.useState<number>(0);
    const [isSignalREnabled, setIsSignalREnabled] = React.useState<boolean>(isEnabled);

    const addSub = (request: AddJobSubscription) => {
        const newSub: JobSubscription = {
            filterBy: request.filterBy,
            id: uuidv4(),
            isEnabled: isEnabled === true && (request.isEnabled ?? true),
            monitorFallback: request.monitorFallback ?? MonitorFallback.None,
            monitorMode: request.monitorMode ?? MonitorMode.SignalR,
            onDisconnect: request.onDisconnect,
            onError: request.onError ?? onError,
            startDate: DateTime.now(),
            lastUpdate: undefined
        };

        if (subs.length === 0) {
            reset();
        }

        setSubs(existing => [...existing, newSub]);

        return newSub;
    };

    const reset = () => {
        setIsSignalREnabled(true);
        setNotifications([]);
        setJobPollingInterval(0);
    };

    const removeSub = (id: string) => {
        setSubs(existing => existing.filter(x => x.id !== id));
        setNotifications(existing => existing.filter(n => n.subscription.id === id));
    };

    const removeAllSubs = () => {
        setSubs([]);
        setNotifications([]);
    };

    const onSignalRFail = (error: string) => {
        if (error && error.length > 0) console.error(error);
        
        // signalR has failed, so get the hook to stop signalR
        setIsSignalREnabled(false);
        
        if (subs.length === 0) return;
        
        if (anySubscriptionsWithPolling(subs)) {
            setJobPollingInterval(milliseconds.TenSeconds);
        }
        
        // try to kickstart signalR after a second
        setInterval(() => setIsSignalREnabled(true), 1000);
    };

    const onSignalRClose = () => {
        // trigger signalR shutdown
        setIsSignalREnabled(false);
    };

    const onSignalRReconnected = async () => {
        // cancel polling because we now have signalR working again
        setJobPollingInterval(0);
        
        // try to find any job updates that were missed in the interim
        await fetchLatestJobUpdatesForPollingSubscriptions();
    };

    const onSignalRReconnecting = () => {
        // try to find any job updates that would otherwise be missed in the interim
        if (anySubscriptionsWithPolling(subs)) {
            setJobPollingInterval(milliseconds.TenSeconds);
        }
    };

    const {results: signalRResults} =
        useSignalRJobMonitor({
            onError,
            isEnabled: isEnabled && isSignalREnabled,
            subscriptions: subs,
            onReconnecting: onSignalRReconnecting,
            onReconnection: onSignalRReconnected,
            onClose: onSignalRClose,
            onFail: onSignalRFail
        });

    const checkForJobByJobId = async (jobId: string): Promise<JobDetails | undefined> => {
        if (!isJobIdValid(jobId)) return;
        const response = await getJob(jobId);
        if (!response.data) return undefined;
        return getJobDetailsFromJobResponse(response.data);
    };

    const findMatchingSubs = (job: JobDetails): JobSubscription[] => {
        if (!subs || subs.length === 0) {
            return [];
        }

        const matches = subs.filter(s => s.isEnabled
            && s.monitorFallback === MonitorFallback.Polling
            && filterJobsByType(job, s.filterBy)
            && filterJobsByIdOrParent(job, s.filterBy)
            && filterJobsBySpecification(job, s.filterBy));

        return matches ?? [];
    };

    const filterJobsByType = (job: JobDetails, filterBy: JobMonitoringFilter) => {
        return !filterBy.jobTypes || (filterBy.jobTypes.length === 0 || filterBy.jobTypes.find(type => job.jobType === type.toString()));
    };
    
    const filterJobsByIdOrParent = (job: JobDetails, filterBy: JobMonitoringFilter) => {
        return !filterBy.jobId || (job.jobId === filterBy.jobId || (filterBy.includeChildJobs !== false && job.parentJobId === filterBy.jobId));
    };

    const filterJobsBySpecification = (job: JobDetails, filterBy: JobMonitoringFilter) => {
        return !filterBy.specificationId || job.specificationId === filterBy.specificationId;
    };
    
    const findJobSubscriptionsWithPolling = (subscriptions: JobSubscription[]) => 
        subscriptions
            .filter(s => s.monitorFallback === MonitorFallback.Polling || s.monitorMode === MonitorMode.SignalR);

    const anySubscriptionsWithPolling = (subscriptions: JobSubscription[]): boolean =>
        subscriptions.some(s => s.monitorFallback === MonitorFallback.Polling || s.monitorMode === MonitorMode.SignalR);
    
    const extractJobIds = (subscriptions: JobSubscription[]): string[] => {
        return subscriptions
            .filter(s => isJobIdValid(s?.filterBy?.jobId))
            .map(s => s.filterBy.jobId) as string[];
    };

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

    const mergeNotifications = (newNotifications: JobNotification[]) => {
        if (newNotifications.length === 0) return;

        setNotifications(existingOnes => {
            const existingNotificationSubIds = existingOnes.map(n => n.subscription.id);
            const matchingNewOnes = newNotifications.filter(n => existingNotificationSubIds.includes(n.subscription.id));
            const nonMatchingNewOnes = newNotifications.filter(n => !existingNotificationSubIds.includes(n.subscription.id));
            const nonMatchingExistingOnes = existingOnes.filter(n => !matchingNewOnes.some(x => x.subscription.id === n.subscription.id));
            let output: JobNotification[] = [...nonMatchingExistingOnes, ...nonMatchingNewOnes];
            matchingNewOnes.forEach((matchingNewOne) => {
                const existingOne = existingOnes.find(n => n.subscription.id === matchingNewOne.subscription.id);
                if (!!existingOne && shouldUpdateNotification(existingOne, matchingNewOne)) {
                    output = output.filter(n => n.subscription.id === existingOne.subscription.id);
                }
                output = [...output, matchingNewOne];
            });
            return output;
        })
    };

    const fetchLatestJobUpdatesForPollingSubscriptions = async () => {
        await fetchLatestJobUpdates(findJobSubscriptionsWithPolling(subs));
    };

    const fetchLatestJobUpdates = async (subscriptions: JobSubscription[]) => {
        // TODO: extend to cover when we don't know the job id, once the jobs api has been extended
        const jobIds = extractJobIds(subscriptions);
        if (jobIds && jobIds.length > 0) {
            await fetchLatestJobUpdatesById(jobIds);
        }
    };

    const fetchLatestJobUpdatesById = async (jobIds: string[]) => {
        let newNotifications: JobNotification[] = [];
        for (const jobId of jobIds) {
            const job = await checkForJobByJobId(jobId);
            if (isJobValid(job)) {
                const subsToNotify = findMatchingSubs(job as JobDetails);
                subsToNotify.forEach(s => {
                    newNotifications = [...notifications, {
                        latestJob: job,
                        subscription: s
                    }];
                });
            }
        }
        mergeNotifications(newNotifications);
    };

    useInterval(async () => {
        if (jobPollingInterval <= 0) {
            reset();
            return;
        }

        await fetchLatestJobUpdatesForPollingSubscriptions();
    }, jobPollingInterval);

    useEffect(() => {
        mergeNotifications(signalRResults);
    }, [signalRResults]);

    useEffect(() => {
        if (!subs || subs.length === 0) {
            setIsSignalREnabled(false);
            setJobPollingInterval(0);
        } else {
            if (!isSignalREnabled && subs.some(s => s.monitorFallback === MonitorFallback.Polling)) {
                setJobPollingInterval(milliseconds.TenSeconds);
            }
        }
    }, [subs]);

    return {
        addSub,
        removeSub,
        removeAllSubs,
        results: notifications
    }
}