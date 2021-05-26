import {JobType} from "../../types/jobType";
import {useFetchLatestSpecificationJob} from "./useFetchLatestSpecificationJob";
import {AxiosError} from "axios";
import {JobDetails} from "../../types/jobDetails";
import {JobMonitoringFilter, useJobMonitor} from "./useJobMonitor";

export type LatestSpecificationJobWithMonitoringResult = {
    latestJob: JobDetails | undefined,
    hasJob: boolean | undefined,
    isFetching: boolean,
    isFetched: boolean,
    isCheckingForJob: boolean
}

export const useLatestSpecificationJobWithMonitoring =
    (specificationId: string,
     jobTypes: JobType[] = [],
     onError: (err: AxiosError | Error | string) => void)
        : LatestSpecificationJobWithMonitoringResult => {
        const jobFilter: JobMonitoringFilter = {
            specificationId: specificationId,
            jobTypes: jobTypes,
            includeChildJobs: false
        };

        const {lastJob, isCheckingForJob, isFetching, isFetched} =
            useFetchLatestSpecificationJob({jobFilter, onError});
        const {newJob} =
            useJobMonitor({
                filterBy: jobFilter,
                onError,
                isEnabled: true,
            });
        const latestJob: JobDetails | undefined = newJob !== undefined ? newJob : lastJob;

        return {
            latestJob,
            hasJob: isFetched ? latestJob !== undefined : undefined,
            isFetching,
            isFetched,
            isCheckingForJob,
        };
    };
