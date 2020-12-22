import {JobType} from "../../types/jobType";
import {useFetchLatestSpecificationJob} from "./useFetchLatestSpecificationJob";
import {useMonitorForNewSpecificationJob} from "./useMonitorForNewSpecificationJob";
import {AxiosError} from "axios";
import {JobDetails} from "../../types/jobDetails";

export type LatestSpecificationJobWithMonitoringResult = {
    latestJob: JobDetails | undefined,
    hasJob: boolean | undefined,
    isMonitoring: boolean,
    isFetching: boolean,
    isFetched: boolean,
    isCheckingForJob: boolean
}

export const useLatestSpecificationJobWithMonitoring =
    (specificationId: string, 
     jobTypes: JobType[] = [],
     onError: (err: AxiosError | Error | string) => void)
        : LatestSpecificationJobWithMonitoringResult => {
        const {lastJob, isCheckingForJob, isFetching, isFetched} =
            useFetchLatestSpecificationJob(specificationId, jobTypes, onError);
        const {newJob, isMonitoring} =
            useMonitorForNewSpecificationJob(specificationId, jobTypes, onError);

        const latestJob: JobDetails | undefined = newJob !== undefined ? newJob : lastJob;

        return {
            latestJob,
            hasJob: isFetched ? latestJob !== undefined : undefined,
            isMonitoring,
            isFetching,
            isFetched,
            isCheckingForJob,
        };
    };
