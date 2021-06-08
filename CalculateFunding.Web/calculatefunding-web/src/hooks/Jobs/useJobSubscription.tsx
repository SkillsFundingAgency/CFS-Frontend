import {AxiosError} from "axios";
import {JobMonitoringFilter} from "./useJobMonitor";
import * as React from "react";
import {useEffect} from "react";
import {v4 as uuidv4} from 'uuid';
import {DateTime} from "luxon";
import {JobDetails} from "../../types/jobDetails";
import {JobMonitorMode, useSignalRJobMonitor} from "./useSignalRJobMonitor";
import {getJob, getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {useInterval} from "../useInterval";
import {milliseconds} from "../../helpers/TimeInMs";
import {append} from "ramda";
import {JobType} from "../../types/jobType";

export enum MonitorMode {
    OneOff = 'OneOff',
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
    onNewNotification?: (notification: JobNotification) => void,
    isEnabled?: boolean,
}

// used to monitor multiple jobs, including polling as a fallback, and to stop/start monitoring
// limitation of the polling: only works when we know the jobId as there's no other suitable jobs api endpoint to use
export const useJobSubscription = ({
                                       onError,
                                       onNewNotification,
                                       isEnabled = true
                                   }: JobSubscriptionProps) => {

    const [subs, setSubs] = React.useState<JobSubscription[]>([]);
    const [notifications, setNotifications] = React.useState<JobNotification[]>([]);
    const [jobPollingInterval, setJobPollingInterval] = React.useState<number>(0);
    const [isSignalREnabled, setIsSignalREnabled] = React.useState<boolean>(isEnabled);

    const addSub = (request: AddJobSubscription | AddJobSubscription[]) => {

        if (subs.length === 0) {
            reset();
        }
        
        if (Array.isArray(request)) {
            const newSubs = request.map(x => convert(x))
            setSubs(existing => [...existing, ...newSubs]);
            return newSubs;
        } else {
            const newSub = convert(request);
            setSubs(existing => [...existing, newSub]);
            return newSub;
        }
    };

    const convert = (request: AddJobSubscription): JobSubscription => {
        return {
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
    }

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
        await loadLatestJobUpdatesForPollingSubscriptions();
    };

    const onSignalRReconnecting = () => {
        // try to find any job updates that would otherwise be missed in the interim
        if (anySubscriptionsWithPolling(subs)) {
            setJobPollingInterval(milliseconds.TenSeconds);
        }
    };

    const findSingleSpecificationId = (subs: JobSubscription[]): string | undefined => {
        let specId: string | undefined;
        subs.forEach(({filterBy}) => {
            if (!filterBy.specificationId || filterBy.specificationId === specId) return false;
            specId = filterBy.specificationId;
        });
        return specId;
    }

    const {results: signalRResults} =
        useSignalRJobMonitor({
            onError,
            mode: findSingleSpecificationId(subs) ? JobMonitorMode.WatchSingleSpecification : JobMonitorMode.WatchAllJobs,
            isEnabled: isEnabled && isSignalREnabled && subs.length > 0,
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

    const checkForSpecificationJob = async (specId: string | undefined, jobTypes: JobType[] | undefined):
        Promise<JobDetails[] | undefined> => {
        if (!specId || !jobTypes || jobTypes.length === 0) {
            console.error('Invalid arguments for checkForSpecificationJob');
            return;
        }
        const response = await getJobStatusUpdatesForSpecification(specId, jobTypes);
        const results = response.data.filter(item => item && item.jobId && item.jobId !== "" && item.lastUpdated);
        return results && results.length > 0 ? results.map(r => getJobDetailsFromJobResponse(r) as JobDetails) : undefined;
    }

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
        let updates: JobNotification[] = [];

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
                append(matchingNewOne, updates);
                output = [...output, matchingNewOne];
            });
            return output;
        });
        if (!!onNewNotification) {
            updates.forEach(onNewNotification);
        }
    };

    const loadLatestJobUpdatesForPollingSubscriptions = async () => {
        await loadLatestJobUpdates(findJobSubscriptionsWithPolling(subs));
    };

    // call api to get update on each active subscription
    const loadLatestJobUpdates = async (subscriptions: JobSubscription[]) => {
        subscriptions
            .filter(s => s.isEnabled)
            .map(async (sub) => {
            if (!!sub.filterBy.jobId) {
                await loadLatestJobUpdatesById([sub.filterBy.jobId]);
            } else {
                if (!!sub.filterBy.specificationId) {
                    await loadLatestJobUpdatesBySpec(sub.filterBy);
                } else {
                    // todo: what to do if just looking for job types - no suitable api to call
                }
            }
        })
    };

    const loadLatestJobUpdatesById = async (jobIds: string[]) => {
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

    const loadLatestJobUpdatesBySpec = async (filter: JobMonitoringFilter) => {
        let newNotifications: JobNotification[] = [];
        
        const jobs = await checkForSpecificationJob(filter.specificationId, filter.jobTypes);
        
        if (!jobs) return;
        
        for (const job of jobs) {
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

        await loadLatestJobUpdatesForPollingSubscriptions();
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
        subs,
        results: notifications
    }
}