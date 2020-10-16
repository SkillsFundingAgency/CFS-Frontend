﻿import {JobType} from "../../types/jobType";
import {useState} from "react";
import {JobSummary} from "../../types/jobSummary";
import {HubConnectionBuilder} from "@microsoft/signalr";
import {JobMessage} from "../../types/jobMessage";
import {RunningStatus} from "../../types/RunningStatus";

export type MonitorForNewSpecificationJobResult = {
    newJob: JobSummary | undefined,
    errorWhileMonitoringJobs: string,
    haveErrorWhileMonitoringJobs: boolean,
    isMonitoring: boolean,
}

export const useMonitorForNewSpecificationJob = (specificationId: string, jobTypes: JobType[] = [])
    : MonitorForNewSpecificationJobResult => {
    const [newJob, setNewJob] = useState<JobSummary>();
    const [error, setError] = useState<string>();
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

    if (specificationId && specificationId.length > 0 && !isMonitoring) {
        setError(undefined);
        setIsMonitoring(true);
        monitorSpecJobNotifications(specificationId);
    }

    async function monitorSpecJobNotifications(specId: string) {
        const hubConnect = new HubConnectionBuilder()
            .withUrl(`/api/notifications`)
            .build();
        hubConnect.keepAliveIntervalInMilliseconds = 1000 * 60 * 3;
        hubConnect.serverTimeoutInMilliseconds = 1000 * 60 * 6;

        try {
            await hubConnect.start();
            hubConnect.on('NotificationEvent', (job: JobMessage) => {
                const jobType: JobType | undefined = JobType[job.jobType as keyof typeof JobType];
                if (isThisJobValid(job) && amInterestedInJobType(jobType)) {
                    setNewJob({
                        jobId: job.jobId,
                        jobType: job.jobType,
                        completionStatus: job.completionStatus,
                        runningStatus: job.runningStatus as unknown as RunningStatus,
                        invokerUserId: job.invokerUserId,
                        invokerUserDisplayName: job.invokerUserDisplayName,
                        created: job.jobCreatedDateTime,
                        lastUpdated: job.statusDateTime as unknown as Date
                    });
                } else {
                    setNewJob(undefined);
                }
            });
            await hubConnect.invoke("StartWatchingForSpecificationNotifications", specId);
        } catch (err) {
            setError(`Error while monitoring jobs: ${err.message}`);
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

    return {
        isMonitoring, 
        newJob, 
        errorWhileMonitoringJobs: error as string, 
        haveErrorWhileMonitoringJobs: error !== undefined && error.length > 0};
};