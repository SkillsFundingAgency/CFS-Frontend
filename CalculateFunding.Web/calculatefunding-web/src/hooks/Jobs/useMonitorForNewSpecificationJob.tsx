import {JobType} from "../../types/jobType";
import {useEffect, useRef, useState} from "react";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {JobMessage} from "../../types/jobMessage";
import {getJobDetailsFromJobMessage, JobDetails} from "../../helpers/jobDetailsHelper";
import {AxiosError} from "axios";

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
    const hubRef = useRef<HubConnection>();
    const specRef = useRef<string>("");

    useEffect(() => {
        if (specificationId && specificationId.length > 0) {
            setIsMonitoring(true);
            monitorSpecJobNotifications(specificationId);
        }
    }, [specificationId]);

    async function monitorSpecJobNotifications(specId: string) {
        let hubConnect: HubConnection;
        if (hubRef.current) {
            hubConnect = hubRef.current;
        } else {
            hubConnect = new HubConnectionBuilder()
                .withUrl(`/api/notifications`)
                .withAutomaticReconnect()
                .build();
            hubConnect.keepAliveIntervalInMilliseconds = 1000 * 60 * 3;
            hubConnect.serverTimeoutInMilliseconds = 1000 * 60 * 6;
            hubRef.current = hubConnect;
        }

        try {
            if (hubConnect.connectionId === null) {
                await hubConnect.start();
                hubConnect.on('NotificationEvent', (job: JobMessage) => {
                    const jobType: JobType | undefined = JobType[job.jobType as keyof typeof JobType];
                    if (isThisJobValid(job) && amInterestedInJobType(jobType)) {
                        setNewJob(getJobDetailsFromJobMessage(job));
                    }
                });
            }
            if (specRef.current.length > 0) {
                await hubConnect.invoke("StopWatchingForSpecificationNotifications", specRef.current);
            }
            specRef.current = specId;
            await hubConnect.invoke("StartWatchingForSpecificationNotifications", specId);
        } catch (err) {
            onError(`Error while monitoring jobs: ${err.message}`);
            await hubConnect.stop();
            setIsMonitoring(false);
        }
    }

    function isThisJobValid(job: JobMessage) {
        return job && job.jobId && job.jobId.length > 0;
    }

    function amInterestedInJobType(jobType: JobType | undefined) {
        return !jobType ? false :
            jobTypes.length === 0 || (jobTypes.length > 0 && jobTypes.includes(jobType));
    }

    return {isMonitoring, newJob};
};