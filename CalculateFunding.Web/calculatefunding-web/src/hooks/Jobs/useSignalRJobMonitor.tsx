import {useEffect, useRef, useState} from "react";
import {HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from "@microsoft/signalr";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {AxiosError} from "axios";
import {JobDetails, JobResponse} from "../../types/jobDetails";
import {milliseconds} from "../../helpers/TimeInMs";
import {JobNotification, JobSubscription, MonitorMode} from "./useJobSubscription";
import {JobMonitoringFilter} from "./useJobMonitor";

export enum JobMonitorMode {
    WatchSingleSpecification,
    WatchAllJobs
}

export interface SignalRJobMonitorProps {
    subscriptions: JobSubscription[],
    mode: JobMonitorMode,
    onError: (err: AxiosError | Error | string) => void,
    isEnabled?: boolean,
    onReconnecting?: () => void,
    onReconnection?: () => void,
    onClose?: () => void,
    onFail?: (error: string) => void
}

export interface SignalRJobMonitorResult {
    results: JobNotification[],
    state: HubConnectionState | undefined,
    isMonitoring: boolean
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
                                         onClose
                                     }: SignalRJobMonitorProps): SignalRJobMonitorResult => {
    const [notifications, setNotifications] = useState<JobNotification[]>([]);
    const [hubConnection, setHubConnection] = useState<HubConnection>();
    const hubRef = useRef<HubConnection>();

    const hasInitialised = () => !!hubConnection;

    const hasDisconnected = () => hubConnection?.state == HubConnectionState.Disconnected;

    const isInSubscriptions = (notification: JobNotification, subs: JobSubscription[]) => {
        return subs.some(s => s.id === notification.subscription.id);
    }

    const excludeSubscriptionsFromNotifications = (notifications: JobNotification[], subs: JobSubscription[]) => {
        // given existing notifications, return those not matching the subscriptions provided
        return notifications.filter(n => !isInSubscriptions(n, subs));
    };

    const createJobNotification = (job: JobDetails, sub: JobSubscription): JobNotification => {
        return {
            latestJob: job,
            subscription: sub
        }
    }

    const stopSignalR = async () => {
        hubConnection?.stop();
        
        if (hubRef?.current) {
            await hubRef?.current?.stop();
            hubRef.current = undefined;
        }
        
        setHubConnection(undefined);
    }

    const hasEnabledSubscriptions = () => {
        return subscriptions.length > 0 &&
            (isEnabled === undefined || isEnabled)
            && subscriptions.some(s => s.isEnabled)
    }

    const findSingleSpecificationId = (subs: JobSubscription[]): string | undefined => {
        let specId: string | undefined;
        subs.forEach(({filterBy}) => {
            if (!filterBy.specificationId || filterBy.specificationId === specId) return false;
            specId = filterBy.specificationId;
        });
        return specId;
    }

    const isThisJobValid = (job: JobResponse) => {
        return job && job.jobId && job.jobId.length > 1; // to catch edge case of 0 turned to string
    }

    const findMatchingSubs = (job: JobResponse): JobSubscription[] => {
        if (!hasEnabledSubscriptions()) {
            return [];
        }

        const matches = subscriptions.filter(s => s.isEnabled
            && s.monitorMode === MonitorMode.SignalR
            && filterJobsByType(job, s.filterBy)
            && filterJobsByIdOrParent(job, s.filterBy)
            && filterJobsBySpecification(job, s.filterBy));

        return matches ?? [];
    }

    const filterJobsByType = (job: JobResponse, filterBy: JobMonitoringFilter) => {
        return !filterBy.jobTypes || (filterBy.jobTypes.length === 0 || filterBy.jobTypes.find(type => job.jobType === type.toString()));
    }

    const filterJobsByIdOrParent = (job: JobResponse, filterBy: JobMonitoringFilter) => {
        return !filterBy.jobId || (job.jobId === filterBy.jobId || (filterBy.includeChildJobs !== false && job.parentJobId === filterBy.jobId));
    }

    const filterJobsBySpecification = (job: JobResponse, filterBy: JobMonitoringFilter) => {
        return !filterBy.specificationId || job.specificationId === filterBy.specificationId;
    }

    const processMessage = (message: any) => {
        const job = (message as JobResponse);
        if (isThisJobValid(job)) {
            const matchingSubscriptions = findMatchingSubs(job)
            const jobDetails = getJobDetailsFromJobResponse(job);
            if (matchingSubscriptions.length > 0 && jobDetails) {
                const updated = matchingSubscriptions.map(sub => createJobNotification(jobDetails, sub));
                setNotifications(existing => {
                    const unchanged = excludeSubscriptionsFromNotifications(existing, subscriptions);
                    return [...unchanged, ...updated]
                });
            }
        }
    }

    const notifyDisconnection = (error: Error | string | undefined) => {
        const realError = (error as Error);
        const errorMessage = !!realError ? `Error while monitoring jobs: ${realError.message}` : !!error ? error as string : null;
        if (!!errorMessage) console.error(errorMessage);
        if (errorMessage && !!onFail) {
            onFail(errorMessage);
        } else if (!!onClose) {
            onClose();
        } else if (errorMessage && !!onError) {
            onError(errorMessage);
        }
    }

    const notifyReconnection = () => {
        onReconnection && onReconnection();
    }

    const notifyReconnecting = (error: Error | string | undefined) => {
        if (!!error) console.error(error);
        onReconnecting && onReconnecting();
    }

    const monitorJobNotifications = async () => {
        try {
            if (!hubRef.current) {
                let hubConnect: HubConnection = new HubConnectionBuilder()
                    .withUrl(`/api/notifications`)
                    .withAutomaticReconnect([5, 8, 13])
                    .configureLogging(LogLevel.Information)
                    .build();
                hubConnect.keepAliveIntervalInMilliseconds = milliseconds.ThreeMinutes;
                hubConnect.serverTimeoutInMilliseconds = milliseconds.SixMinutes;
                hubConnect.on('NotificationEvent', processMessage);
                hubConnect.onclose(error => notifyDisconnection(error));
                hubConnect.onreconnecting(error => notifyReconnecting(error));
                hubConnect.onreconnected(connectionId => notifyReconnection());

                await hubConnect.start();

                // if all subs are linked to the SAME spec, then just follow that spec
                const specId = findSingleSpecificationId(subscriptions);
                if (mode === JobMonitorMode.WatchSingleSpecification && specId) {
                    await hubConnect.invoke("StartWatchingForSpecificationNotifications", specId);
                } else { // otherwise follow everything
                    await hubConnect.invoke("StartWatchingForAllNotifications");
                }

                setHubConnection(hubConnect);
            }
        } catch (err) {
            notifyDisconnection(err);
            await stopSignalR();
        }
    }
    
    
    useEffect(() => {
        const shouldReconnect = isEnabled && hasDisconnected();
        if (shouldReconnect) {
            notifyDisconnection("SignalR has disconnected");
            subscriptions.forEach(s => s.isEnabled && !!s.onDisconnect && s.onDisconnect())
        } else {
            if (isEnabled && hasEnabledSubscriptions() && !hasInitialised()) {
                monitorJobNotifications();
            } else {
                if (!isEnabled || (!hasEnabledSubscriptions && hubRef.current)) {
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
        isMonitoring: !!hubRef.current &&
            (hubRef.current?.state == HubConnectionState.Connecting ||
                hubRef.current?.state === HubConnectionState.Connected ||
                hubRef.current?.state === HubConnectionState.Reconnecting)
    };
};