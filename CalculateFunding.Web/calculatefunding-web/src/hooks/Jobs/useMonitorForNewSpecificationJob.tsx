import {JobType} from "../../types/jobType";
import {useEffect, useRef, useState} from "react";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {AxiosError} from "axios";
import {JobDetails, JobResponse} from "../../types/jobDetails";

export type MonitorForNewSpecificationJobResult = {
    newJob: JobDetails | undefined,
    isMonitoring: boolean,
}

export const useMonitorForNewSpecificationJob = (
    specificationId: string,
    jobTypes: JobType[],
    onError: (err: AxiosError | Error | string) => void): MonitorForNewSpecificationJobResult => {
    const [newJob, setNewJob] = useState<JobDetails>();
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
    const [hubConnection, setHubConnection] = useState<HubConnection>();
    const hubRef = useRef<HubConnection>();

    useEffect(() => {
        if (specificationId && specificationId.length > 0) {
            setIsMonitoring(true);
            monitorSpecJobNotifications(specificationId);
        }
    }, [specificationId]);

    useEffect(() => {
        if (!hubConnection) return;
        hubRef.current = hubConnection;
        return () => {
            hubRef.current?.stop();
        }
    }, [hubConnection]);

    async function monitorSpecJobNotifications(specId: string) {
        let hubConnect: HubConnection;
        try {
            if (!hubRef.current) {
                hubConnect = new HubConnectionBuilder()
                    .withUrl(`/api/notifications`)
                    .withAutomaticReconnect()
                    .build();
                hubConnect.keepAliveIntervalInMilliseconds = 1000 * 60 * 3;
                hubConnect.serverTimeoutInMilliseconds = 1000 * 60 * 6;
                // register listeners before calling start
                hubConnect.on('NotificationEvent', (job: JobResponse) => {
                    const jobType: JobType | undefined = JobType[job.jobType as keyof typeof JobType];
                    if (isThisJobValid(job) && amInterestedInJobType(jobType)) {
                        setNewJob(getJobDetailsFromJobResponse(job));
                    }
                });
                await hubConnect.start();
                await hubConnect.invoke("StartWatchingForAllNotifications");
                setHubConnection(hubConnect);
            }
        } catch (err) {
            onError(`Error while monitoring jobs: ${err.message}`);
            setIsMonitoring(false);
        }
    }

    function isThisJobValid(job: JobResponse) {
        return job && job.jobId && job.jobId.length > 0;
    }

    function amInterestedInJobType(jobType: JobType | undefined) {
        return !jobType ? false :
            jobTypes.length === 0 || (jobTypes.length > 0 && jobTypes.includes(jobType));
    }

    return {isMonitoring, newJob};
};