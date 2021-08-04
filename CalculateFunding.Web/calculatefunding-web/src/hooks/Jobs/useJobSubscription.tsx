import {AxiosError} from "axios";
import * as React from "react";
import {useEffect, useMemo} from "react";
import {DateTime} from "luxon";
import {JobDetails} from "../../types/jobDetails";
import {JobMonitorMode, useSignalRJobMonitor} from "./useSignalRJobMonitor";
import {getJob, getJobStatusUpdatesForSpecification, getLatestJobByEntityId} from "../../services/jobService";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {useInterval} from "../useInterval";
import {milliseconds} from "../../helpers/TimeInMs";
import {JobType} from "../../types/jobType";
import {JobMonitoringFilter} from "../../types/Jobs/JobMonitoringFilter";
import jobSubscriptionUtilities from "../../helpers/jobSubscriptionUtilities";
import {apply, assoc, identity, memoizeWith} from "ramda";

export enum MonitorMode {
    Off = 'Off',
    SignalR = 'SignalR',
    Polling = 'Polling'
}

export enum MonitorFallback {
    None = 'None',
    Polling = 'Polling'
}

export interface AddJobSubscription {
    fetchPriorNotifications?: boolean,
    filterBy: JobMonitoringFilter,
    onError: (err: AxiosError | Error | string) => void,
    isEnabled?: boolean,
    onDisconnect?: () => void,
    monitorMode?: MonitorMode,
    monitorFallback?: MonitorFallback,
}

export interface JobSubscription {
    id: string,
    fetchPriorNotifications?: boolean,
    filterBy: JobMonitoringFilter,
    onError: (err: AxiosError | Error | string) => void,
    isEnabled: boolean,
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
    const util = useMemo(jobSubscriptionUtilities, []);

    const replaceSubs = (request: AddJobSubscription[]): JobSubscription[] => {
        reset();

        const newSubs = request.map(x => util.convert(x))
        setSubs(newSubs);
        return newSubs;
    };

    const addSub = async (request: AddJobSubscription): Promise<JobSubscription> => {
        const newSub = util.convert(request);
        const existing = util.findExistingSubscription(subs, newSub);
        if (!existing) {
            console.log(`Subscribing to jobs with jobId=[${newSub.filterBy.jobId}], jobTypes=[${newSub.filterBy.jobTypes?.join(',')}], specificationId=[${newSub.filterBy.specificationId}], `)
            setSubs(existing => [...existing, newSub]);
        }
        if (!!newSub.fetchPriorNotifications) {
            await loadLatestJobUpdate(newSub);
        }
        return newSub;
    };

    const reset = () => {
        setIsSignalREnabled(true);
        setNotifications([]);
        setJobPollingInterval(0);
    };

    const removeSub = (id: string) => {
        setSubs(existing => existing.filter(x => x.id !== id));
    };

    const removeAllSubs = () => {
        setSubs([]);
    };

    const onSignalRFail = (error: string) => {
        // signalR has failed, so get the hook to stop signalR
        setIsSignalREnabled(false);

        if (subs.length === 0) return;

        if (util.anySubsWithSignalROrFallbackPolling(subs)) {
            setJobPollingInterval(milliseconds.TenSeconds);
        }

        // try to kickstart signalR
        setInterval(() => setIsSignalREnabled(true), milliseconds.TenSeconds);
    };

    const onSignalRClose = () => {
        // trigger signalR shutdown
        setIsSignalREnabled(false);

        if (subs.length === 0) return;

        if (util.anySubsWithSignalROrFallbackPolling(subs)) {
            setJobPollingInterval(milliseconds.TenSeconds);
        }

        // try to kickstart signalR
        setInterval(() => setIsSignalREnabled(true), milliseconds.TenSeconds);
    };

    const onSignalRReconnected = async () => {
        // cancel polling because we now have signalR working again
        setJobPollingInterval(0);

        // try to find any job updates that were missed in the interim
        await loadLatestJobUpdatesForPollingSubscriptions();
    };

    const onSignalRReconnecting = () => {
        // try to find any job updates that would otherwise be missed in the interim
        if (util.anySubsWithSignalROrFallbackPolling(subs)) {
            setJobPollingInterval(milliseconds.TenSeconds);
        }
    };

    const {results: signalRResults} =
        useSignalRJobMonitor({
            onError,
            mode: util.findUniqueSpecificationIdInSubscriptions(subs) ? JobMonitorMode.WatchSingleSpecification : JobMonitorMode.WatchAllJobs,
            isEnabled: isEnabled && isSignalREnabled && subs.length > 0,
            subscriptions: subs,
            onReconnecting: onSignalRReconnecting,
            onReconnection: onSignalRReconnected,
            onClose: onSignalRClose,
            onFail: onSignalRFail
        });

    const checkForJobByJobId = async (jobId: string): Promise<JobDetails | undefined> => {
        if (!util.isJobIdValid(jobId)) return;
        const response = await getJob(jobId);
        if (!response.data) return undefined;
        return getJobDetailsFromJobResponse(response.data);
    };

    const checkForSpecificationJobByJobTypes = async (specId: string | undefined, jobTypes: JobType[] | undefined):
        Promise<JobDetails[] | undefined> => {
        if (!specId || !jobTypes || jobTypes.length === 0) {
            console.error('Invalid arguments for checkForSpecificationJobByJobTypes');
            return;
        }
        const response = await getJobStatusUpdatesForSpecification(specId, jobTypes);
        const results = response.data.filter(item => item && item.jobId && item.jobId !== "" && item.lastUpdated);
        return results && results.length > 0 ? results
            .map(r => getJobDetailsFromJobResponse(r) as JobDetails) : undefined;
    }

    const checkForSpecificationJobTriggeredByEntity = async (specId: string | undefined, triggeredByEntityId: string | undefined):
        Promise<JobDetails | undefined> => {
        if (!specId || !triggeredByEntityId || triggeredByEntityId.length === 0) {
            console.error('Invalid arguments for checkForSpecificationJobTriggeredByEntity');
            return;
        }
        const {data: result} = await getLatestJobByEntityId(specId, triggeredByEntityId);
        return result && result.jobId ? getJobDetailsFromJobResponse(result) : undefined;
    }

    const notify = (input: JobNotification | JobNotification[]) => {
        if (!onNewNotification) return;

        if (Array.isArray(input)) {
            input.forEach(n => onNewNotification(n));
        } else {
            onNewNotification(input);
        }
    }

    const mergeNotifications = (newNotifications: JobNotification[]) => {
        if (newNotifications.length === 0) return;

        setNotifications(existingOnes => {
            const existingNotificationSubIds = existingOnes.map(n => n.subscription.id);
            const matchingNewOnes = newNotifications.filter(n => existingNotificationSubIds.includes(n.subscription.id));
            const nonMatchingNewOnes = newNotifications.filter(n => !existingNotificationSubIds.includes(n.subscription.id));
            notify(nonMatchingNewOnes);
            const nonMatchingExistingOnes = existingOnes.filter(n => !matchingNewOnes.some(x => x.subscription.id === n.subscription.id));
            let output: JobNotification[] = [...nonMatchingExistingOnes, ...nonMatchingNewOnes];
            matchingNewOnes.forEach((matchingNewOne) => {
                const existingOne = existingOnes.find(n => n.subscription.id === matchingNewOne.subscription.id);
                if (!!existingOne && util.shouldUpdateNotification(existingOne, matchingNewOne)) {
                    output = output.filter(n => n.subscription.id === existingOne.subscription.id);
                    notify(matchingNewOne);
                }
                output = [...output, matchingNewOne];
            });


            return output;
        });
    };

    const loadLatestJobUpdatesForPollingSubscriptions = async () => {
        await loadLatestJobUpdates(util.findSubsWithSignalROrFallbackPolling(subs));
    };

    // call api to get update on each active subscription
    const loadLatestJobUpdates = async (subscriptions: JobSubscription[]) => {
        subscriptions.forEach(s => loadLatestJobUpdate(s));
    };

    const loadLatestJobUpdate = async (sub: JobSubscription) => {
        if (sub.isEnabled) {
            if (!!sub.filterBy.jobId) {
                await loadLatestJobUpdatesById([sub.filterBy.jobId]);
            } else if (!!sub.filterBy.specificationId) {
                await loadLatestJobUpdatesBySpec(sub.filterBy);
            } else {
                // todo: what to do if just looking for job types - no suitable api to call
            }
        }
    };

    const loadLatestJobUpdatesById = async (jobIds: string[]) => {
        let newNotifications: JobNotification[] = [];
        for (const jobId of jobIds) {
            const job = await checkForJobByJobId(jobId);
            if (util.isJobValid(job)) {
                const subsToNotify = util.findMatchingSubs(subs, job as JobDetails);
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
        let jobs: JobDetails[] | undefined = undefined;

        if (!filter.jobTypes || filter.jobTypes.length == 0) {
            if (filter.specificationId && filter.triggerByEntityId) {
                const job = await checkForSpecificationJobTriggeredByEntity(filter.specificationId, filter.triggerByEntityId);
                jobs = job ? [job] : [];
            }
        } else {
            jobs = await checkForSpecificationJobByJobTypes(filter.specificationId, filter.jobTypes);
        }

        if (!jobs || jobs.length === 0) return;

        for (const job of jobs) {
            if (util.isJobValid(job)) {
                const subsToNotify = util.findMatchingSubs(subs, job as JobDetails);
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

    const clearOneOffFetch = assoc('fetchPriorNotifications', false);

    useInterval(async () => {
        if (jobPollingInterval <= 0) {
            reset();
            return;
        }

        await loadLatestJobUpdatesForPollingSubscriptions();
    }, jobPollingInterval);

    useEffect(() => {
        // if any new results from signalR then we can cancel polling
        setJobPollingInterval(0);

        mergeNotifications(signalRResults);
    }, [signalRResults]);

    useEffect(() => {
        if (!subs || subs.length === 0) {
            // no subs, deactivate signalR and polling
            setIsSignalREnabled(false);
            setJobPollingInterval(0);
        } else if (!isSignalREnabled && subs.some(s => s.monitorFallback === MonitorFallback.Polling)) {
            // signalR is currently disabled & subs with fallback polling: make sure polling is enabled if applicable
            setJobPollingInterval(milliseconds.TenSeconds);
        } else {
            // do one off fetches and then clear flag 
            const oneOffs = subs.filter(s => s.fetchPriorNotifications);
            if (oneOffs.length) {
                oneOffs.forEach(async sub => {
                    await loadLatestJobUpdate(sub);
                });
                setSubs(existing =>
                    [...existing.filter(s => !oneOffs.some(o => o.id === s.id)),
                        ...oneOffs.map(clearOneOffFetch)]);
            }
        }
    }, [subs]);

    return {
        addSub,
        replaceSubs,
        removeSub,
        removeAllSubs,
        subs,
        results: notifications
    }
}