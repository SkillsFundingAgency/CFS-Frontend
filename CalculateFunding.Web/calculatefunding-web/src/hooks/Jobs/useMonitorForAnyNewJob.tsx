import {JobType} from "../../types/jobType";
import {useRef, useState} from "react";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {AxiosError} from "axios";
import {JobDetails, JobResponse} from "../../types/jobDetails";
import {useEffectOnce} from "../useEffectOnce";

export type MonitorForAnyNewJobResult = {
    newJob: JobDetails | undefined
}

export const useMonitorForAnyNewJob = (
    jobTypes: JobType[],
    onError: (err: AxiosError | Error | string) => void): MonitorForAnyNewJobResult => {
    const [newJob, setNewJob] = useState<JobDetails>();
    const hubRef = useRef<HubConnection>();

    useEffectOnce(() => {
        monitorJobNotifications();
    });

    async function monitorJobNotifications() {
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
                hubConnect.on('NotificationEvent', (job: JobResponse) => {
                    const jobType: JobType | undefined = JobType[job.jobType as keyof typeof JobType];
                    if (isThisJobValid(job) && amInterestedInJobType(jobType)) {
                        setNewJob(getJobDetailsFromJobResponse(job));
                    }
                });
            }
            await hubConnect.invoke("StartWatchingForAllNotifications");
        } catch (err) {
            onError(`Error while monitoring jobs: ${err.message}`);
            await hubConnect.stop();
        }
    }

    function isThisJobValid(job: JobResponse) {
        return job && job.jobId && job.jobId.length > 0;
    }

    function amInterestedInJobType(jobType: JobType | undefined) {
        return !jobType ? false :
            jobTypes.length === 0 || (jobTypes.length > 0 && jobTypes.includes(jobType));
    }

    return {newJob};
};