import {JobType} from "../../types/jobType";
import {useFetchLatestSpecificationJob} from "./useFetchLatestSpecificationJob";
import {useMonitorForNewSpecificationJob} from "./useMonitorForNewSpecificationJob";
import {AxiosError} from "axios";
import {JobDetails} from "../../types/jobDetails";
import {useFetchLatestJobByEntityId} from "./useFetchLatestJobByEntityId";
import {useJobMonitor} from "./useJobMonitor";

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


export const useLatestEntityJobWithMonitoring =
    (specificationId :string,
     entityId: string,
     onError: (err: AxiosError | Error | string) => void)
        : LatestSpecificationJobWithMonitoringResult => {
        const {lastJob, isCheckingForJob, isFetching, isFetched} =
            useFetchLatestJobByEntityId(specificationId, entityId, onError);
        const {newJob} =
            useJobMonitor({
                filterBy: {jobId: entityId},
                onError: onError,
                isEnabled: true
            });

        const latestJob: JobDetails | undefined = newJob !== undefined ? newJob : lastJob;

        return {
            latestJob,
            hasJob: isFetched ? latestJob !== undefined : undefined,
            isMonitoring:true,
            isFetching,
            isFetched,
            isCheckingForJob,
        };
    };