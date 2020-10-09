import {JobType} from "../types/jobType";
import {useFetchLatestSpecificationJob} from "./useFetchLatestSpecificationJob";
import {JobSummary} from "../types/jobSummary";
import {useMonitorForNewSpecificationJob} from "./useMonitorForNewSpecificationJob";
import {RunningStatus} from "../types/RunningStatus";
import {getJobProgressMessage} from "../helpers/getJobProgressMessage";
import {CompletionStatus} from "../types/CompletionStatus";

export type LatestSpecificationJobWithMonitoringResult = {
    latestJob: JobSummary | undefined,
    hasJob: boolean,
    hasActiveJob: boolean,
    hasFailedJob: boolean,
    jobError: string,
    hasJobError: boolean,
    isMonitoring: boolean,
    isFetching: boolean,
    isFetched: boolean,
    isCheckingForJob: boolean,
    jobInProgressMessage: string
}

export const useLatestSpecificationJobWithMonitoring =
    (specificationId: string, jobTypes: JobType[] = [])
        : LatestSpecificationJobWithMonitoringResult => {
        const {lastJob, isCheckingForJob, errorCheckingForJob, haveErrorCheckingForJob, isFetching, isFetched} =
            useFetchLatestSpecificationJob(specificationId, jobTypes);
        const {newJob, isMonitoring, errorWhileMonitoringJobs, haveErrorWhileMonitoringJobs} =
            useMonitorForNewSpecificationJob(specificationId, jobTypes);

        const latestJob: JobSummary | undefined = newJob !== undefined ? newJob : lastJob;

        return {
            latestJob,
            hasJob: latestJob !== undefined,
            hasActiveJob: latestJob !== undefined && latestJob.runningStatus !== RunningStatus.Completed,
            hasFailedJob: latestJob !== undefined && latestJob.runningStatus === RunningStatus.Completed && lastJob?.completionStatus !== CompletionStatus.Succeeded,
            jobError: haveErrorCheckingForJob ? errorCheckingForJob : haveErrorWhileMonitoringJobs ? errorWhileMonitoringJobs : "",
            hasJobError: haveErrorCheckingForJob || haveErrorWhileMonitoringJobs,
            isMonitoring,
            isFetching,
            isFetched,
            isCheckingForJob,
            jobInProgressMessage: getJobProgressMessage(latestJob)
        };
    };
