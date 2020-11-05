import {JobType} from "../../types/jobType";
import {useFetchLatestSpecificationJob} from "./useFetchLatestSpecificationJob";
import {JobSummary} from "../../types/jobSummary";
import {useMonitorForNewSpecificationJob} from "./useMonitorForNewSpecificationJob";
import {getJobDisplayProps, JobStatusProps} from "../../helpers/getJobDisplayProps";

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
    jobStatus: JobStatusProps | undefined
}

export const useLatestSpecificationJobWithMonitoring =
    (specificationId: string, jobTypes: JobType[] = [])
        : LatestSpecificationJobWithMonitoringResult => {
        const {lastJob, isCheckingForJob, errorCheckingForJob, haveErrorCheckingForJob, isFetching, isFetched} =
            useFetchLatestSpecificationJob(specificationId, jobTypes);
        const {newJob, isMonitoring, errorWhileMonitoringJobs, haveErrorWhileMonitoringJobs} =
            useMonitorForNewSpecificationJob(specificationId, jobTypes);

        const latestJob: JobSummary | undefined = newJob !== undefined ? newJob : lastJob;
        const jobDisplayInfo = latestJob ? getJobDisplayProps(latestJob) : undefined;

        return {
            latestJob,
            hasJob: latestJob !== undefined,
            hasActiveJob: jobDisplayInfo !== undefined && jobDisplayInfo.isActive,
            hasFailedJob: jobDisplayInfo !== undefined && jobDisplayInfo.isFailed,
            jobError: haveErrorCheckingForJob ? errorCheckingForJob : haveErrorWhileMonitoringJobs ? errorWhileMonitoringJobs : "",
            hasJobError: haveErrorCheckingForJob || haveErrorWhileMonitoringJobs,
            isMonitoring,
            isFetching,
            isFetched,
            isCheckingForJob,
            jobStatus: jobDisplayInfo
        };
    };
