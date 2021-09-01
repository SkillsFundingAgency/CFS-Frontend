import {AxiosError} from "axios";
import * as React from "react";
import {useEffect, useMemo} from "react";
import {DateTime} from "luxon";
import {JobDetails} from "../../types/jobDetails";
import {JobMonitorMode, useSignalRJobMonitor} from "./useSignalRJobMonitor";
import {getJob, getJobStatusUpdatesForSpecification, getLatestJobByEntityId, getLatestJobByJobDefinitionId} from "../../services/jobService";
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
        console.log('Replacing existing job subscriptions with new ones');
        reset();

        const newSubs = request.map(x => util.convert(x))
        setSubs(newSubs);
        if (newSubs.some(s => s.isEnabled && s.monitorMode === MonitorMode.SignalR)) {
            setIsSignalREnabled(true);
        }
        return newSubs;
    };

    const addSub = async (request: AddJobSubscription): Promise<JobSubscription> => {
        console.log('Adding job subscription', request);
        const newSub = util.convert(request);
        const existing = util.findExistingSubscription(subs, newSub);
        if (!existing) {
            console.log(`Subscribing to jobs with ` +
                `jobId=[${newSub.filterBy.jobId?.length ? newSub.filterBy.jobId : 'any'}], ` +
                `jobTypes=[${newSub.filterBy.jobTypes?.length ? newSub.filterBy.jobTypes.join(',') : 'any'}], ` +
                `specificationId=[${newSub.filterBy?.specificationId?.length ? newSub.filterBy.specificationId : 'any'}]`, newSub);
            setSubs(existing => [...existing, newSub]);
            if (newSub.isEnabled && newSub.monitorMode === MonitorMode.SignalR) {
                setIsSignalREnabled(true);
            }
        } else {

            console.log(`Subscription already exists`, newSub, existing);
        }
        if (!!newSub.fetchPriorNotifications) {
            console.log('Fetching previous job results');
            await loadLatestJobUpdate(newSub);
        }
        return newSub;
    };

    const reset = () => {
        console.log('Resetting job notifications');
        setIsSignalREnabled(true);
        setNotifications([]);
        setJobPollingInterval(0);
    };

    const removeSub = (id: string) => {
        console.log('Removing job subscription with id ' + id);
        setSubs(existing => existing.filter(x => x.id !== id));
    };

    const removeAllSubs = () => {
        console.log('Removing all job subscriptions');
        setSubs([]);
    };

    const onSignalRFail = (error: string) => {
        console.log('SignalR has failed', error);

        onSignalRCloseOrFail();
    };

    const onSignalRClose = () => {
        console.log('SignalR has closed');

        onSignalRCloseOrFail();
    };

    const onSignalRCloseOrFail = () => {
        // trigger signalR shutdown
        setIsSignalREnabled(false);

        if (subs.length === 0) return;

        if (jobPollingInterval <= 0 && util.anySubsWithSignalROrFallbackPolling(subs)) {
            console.log('Initiating polling');
            setJobPollingInterval(milliseconds.TenSeconds);
        }

        if (subs.some(s => s.isEnabled && s.monitorMode === MonitorMode.SignalR)) {
            // try to kickstart signalR
            console.log('Setting up timer to kickstart signalR');
            setInterval(() => setIsSignalREnabled(true), milliseconds.TenSeconds);
        }
    };

    const onSignalRReconnected = async () => {
        console.log('SignalR has reconnected');

        // cancel polling because we now have signalR working again
        console.log('Clearing polling');
        setJobPollingInterval(0);

        // try to find any job updates that were missed in the interim
        await loadLatestJobUpdatesForPollingSubscriptions();
    };

    const onSignalRReconnecting = () => {
        // try to find any job updates that would otherwise be missed in the interim
        if (jobPollingInterval <= 0 && util.anySubsWithSignalROrFallbackPolling(subs)) {
            console.log('Initiating polling');
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

    const checkForJobByJobType = async (jobType: JobType): Promise<JobDetails | undefined> => {
        if (!util.isJobIdValid(jobType)) return;
        const response = await getLatestJobByJobDefinitionId(jobType);
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

        console.log('Merging notifications');
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
            } else if (!!sub.filterBy.jobTypes) {
                await loadLatestJobUpdatesByJobTypes(sub.filterBy.jobTypes);
            } else {
                console.error('Oops! Looking for jobs but no suitable api endpoint to call');
            }
        }
    };

    const loadLatestJobUpdatesById = async (jobIds: string[]) => {
        let newNotifications: JobNotification[] = [];
        for (const jobId of jobIds) {
            const job = await checkForJobByJobId(jobId);
            console.log('Polled for job by job id', job);
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

    const loadLatestJobUpdatesByJobTypes = async (jobTypes: JobType[]) => {
        let newNotifications: JobNotification[] = [];
        for (const jobType of jobTypes) {
            const job = await checkForJobByJobType(jobType);
            console.log('Polled for job by job type', job);
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
                console.log(`Polled for job by specification [${filter.specificationId}] and triggered entity id [${filter.triggerByEntityId}]`, job);
                jobs = job ? [job] : [];
            }
        } else {
            jobs = await checkForSpecificationJobByJobTypes(filter.specificationId, filter.jobTypes);
            console.log(`Polled for jobs by specification [${filter.specificationId}] and job types [${filter.jobTypes.join(',')}]`, jobs);
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
        console.log(`SignalR: job update received`, signalRResults);

        // if any new results from signalR then we can cancel polling
        setJobPollingInterval(0);

        mergeNotifications(signalRResults);
    }, [signalRResults]);

    useEffect(() => {
        console.log('Subscription state change', subs);
        if (!subs || subs.length === 0) {
            // no subs, deactivate signalR and polling
            console.log('No subscriptions - therefore deactivate signalR and polling');
            setIsSignalREnabled(false);
            setJobPollingInterval(0);
        } else if (!isSignalREnabled && subs.some(s => s.monitorFallback === MonitorFallback.Polling)) {
            // signalR is currently disabled & subs with fallback polling: make sure polling is enabled if applicable
            console.log('SignalR disabled - initiating polling');
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