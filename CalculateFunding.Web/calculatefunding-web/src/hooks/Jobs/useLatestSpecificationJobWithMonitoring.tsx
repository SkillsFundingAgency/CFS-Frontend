import {JobType} from "../../types/jobType";
import {useFetchLatestSpecificationJob} from "./useFetchLatestSpecificationJob";
import {useMonitorForNewSpecificationJob} from "./useMonitorForNewSpecificationJob";
import {JobDetails} from "../../helpers/jobDetailsHelper";
import {AxiosError} from "axios";

export type LatestSpecificationJobWithMonitoringResult = {
    latestJob: JobDetails | undefined,
    hasJob: boolean,
    jobError: string,
    hasJobError: boolean,
    isMonitoring: boolean,
    isFetching: boolean,
    isFetched: boolean,
    isCheckingForJob: boolean
}

export const useLatestSpecificationJobWithMonitoring =
    (specificationId: string, 
     jobTypes: JobType[] = [],
     onError?: (err: AxiosError) => void)
        : LatestSpecificationJobWithMonitoringResult => {
        const {lastJob, isCheckingForJob, errorCheckingForJob, haveErrorCheckingForJob, isFetching, isFetched} =
            useFetchLatestSpecificationJob(specificationId, jobTypes, onError);
        const {newJob, isMonitoring, errorWhileMonitoringJobs, haveErrorWhileMonitoringJobs} =
            useMonitorForNewSpecificationJob(specificationId, jobTypes);

        const latestJob: JobDetails | undefined = newJob !== undefined ? newJob : lastJob;

        return {
            latestJob,
            hasJob: latestJob !== undefined,
            jobError: haveErrorCheckingForJob ? errorCheckingForJob : haveErrorWhileMonitoringJobs ? errorWhileMonitoringJobs : "",
            hasJobError: haveErrorCheckingForJob || haveErrorWhileMonitoringJobs,
            isMonitoring,
            isFetching,
            isFetched,
            isCheckingForJob,
        };
    };
