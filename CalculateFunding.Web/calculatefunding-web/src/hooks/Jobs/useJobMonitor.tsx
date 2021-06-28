import {useEffect, useRef, useState} from "react";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {AxiosError} from "axios";
import {JobDetails, JobResponse} from "../../types/jobDetails";
import {milliseconds} from "../../helpers/TimeInMs";
import {JobMonitoringFilter} from "../../types/Jobs/JobMonitoringFilter";

export interface JobMonitorProps {
    filterBy: JobMonitoringFilter,
    onError: (err: AxiosError | Error | string) => void,
    isEnabled?: boolean
}

export interface JobMonitorResult {
    newJob: JobDetails | undefined
}

/** @deprecated - pls use {@link useJobSubscription} instead */
export const useJobMonitor = ({filterBy, onError, isEnabled}: JobMonitorProps): JobMonitorResult => {
    const [newJob, setNewJob] = useState<JobDetails>();
    const [hubConnection, setHubConnection] = useState<HubConnection>();
    const hubRef = useRef<HubConnection>();

    useEffect(() => {
        if (isEnabled === undefined || isEnabled) {
            monitorJobNotifications();
        }
    }, [isEnabled]);

    useEffect(() => {
        if (!hubConnection) return;
        hubRef.current = hubConnection;
        return () => {
            hubRef.current?.stop();
        }
    }, [hubConnection]);

    async function monitorJobNotifications() {
        let hubConnect: HubConnection;
        try {
            if (!hubRef.current) {
                hubConnect = new HubConnectionBuilder()
                    .withUrl(`/api/notifications`)
                    .withAutomaticReconnect([3, 5, 8, 13, 21, 34, 55])
                    .build();
                hubConnect.keepAliveIntervalInMilliseconds = milliseconds.ThreeMinutes;
                hubConnect.serverTimeoutInMilliseconds = milliseconds.SixMinutes;

                // register listeners before calling start
                hubConnect.on('NotificationEvent', (job: JobResponse) => {
                    if (isThisJobValid(job) && filterJobs(job)) {
                        setNewJob(getJobDetailsFromJobResponse(job));
                    }
                });

                await hubConnect.start();

                if (filterBy.specificationId && filterBy.specificationId.length > 0) {
                    await hubConnect.invoke("StartWatchingForSpecificationNotifications", filterBy.specificationId);
                } else {
                    await hubConnect.invoke("StartWatchingForAllNotifications");
                }

                setHubConnection(hubConnect);
            }
        } catch (err) {
            onError(`Error while monitoring jobs: ${err.message}`);
        }
    }

    const isThisJobValid = (job: JobResponse) => {
        return job && job.jobId && job.jobId.length > 0;
    }

    const filterJobsByType = (job: JobResponse) => {
        return !filterBy.jobTypes || (filterBy.jobTypes.length === 0 || filterBy.jobTypes.find(type => job.jobType === type.toString()));
    }

    const filterJobsByIdOrParent = (job: JobResponse) => {
        return !filterBy.jobId || (job.jobId === filterBy.jobId || (filterBy.includeChildJobs !== false && job.parentJobId === filterBy.jobId));
    }

    const filterJobsBySpecification = (job: JobResponse) => {
        return !filterBy.specificationId || job.specificationId === filterBy.specificationId;
    }

    const filterJobs = (job: JobResponse) => {
        return filterJobsByType(job) &&
            filterJobsByIdOrParent(job) &&
            filterJobsBySpecification(job);
    }

    return {newJob};
};