import {AxiosError} from "axios";
import {useFetchLatestJobByEntityId} from "./useFetchLatestJobByEntityId";
import {useJobMonitor} from "./useJobMonitor";
import {JobDetails} from "../../types/jobDetails";
import {LatestSpecificationJobWithMonitoringResult} from "./useLatestSpecificationJobWithMonitoring";

/** @deprecated - pls use {@link useJobSubscription} instead */
export const useLatestEntityJobWithMonitoring =
    (specificationId: string,
     entityId: string,
     onError: (err: AxiosError | Error | string) => void)
        : LatestSpecificationJobWithMonitoringResult => {
        const {lastJob, isCheckingForJob, isFetching, isFetched} =
            useFetchLatestJobByEntityId(specificationId, entityId, onError);
        const {newJob} =
            useJobMonitor({
                filterBy: {jobId: entityId},
                onError: onError,
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