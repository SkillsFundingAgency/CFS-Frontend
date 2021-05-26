import {useQuery} from "react-query";
import {getJob} from "../../services/jobService";
import {AxiosError} from "axios";
import {JobDetails} from "../../types/jobDetails";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {LatestJobResult} from "../../types/Jobs/LatestJobResult";
import {milliseconds} from "../../helpers/TimeInMs";

export interface FetchJobByIdProps {
    jobId: string | undefined,
    onError?: (err: AxiosError | Error | string) => void,
    isEnabled?: boolean | undefined
    enablePolling?: boolean | undefined
}

export const useFetchJobById = (
    {
        jobId,
        enablePolling,
        isEnabled,
        onError
    }: FetchJobByIdProps)
    : LatestJobResult => {
    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery<JobDetails | undefined, AxiosError>(
            `specification-job-id-${jobId}`,
            async () => await checkForJobByJobId(jobId as string),
            {
                enabled: isEnabled && !!jobId,
                refetchInterval: milliseconds.ThirtySeconds,
                refetchIntervalInBackground: enablePolling,
                onError: onError
            });

    const checkForJobByJobId = async (jobId: string): Promise<JobDetails | undefined> => {
        if (!jobId) return;
        const response = await getJob(jobId);
        if (!response.data) return undefined;
        return getJobDetailsFromJobResponse(response.data);
    };

    if (isError) {
        return {
            lastJob: undefined,
            isCheckingForJob: isLoading,
            errorCheckingForJob: error?.response?.data,
            haveErrorCheckingForJob: isError,
            isFetching,
            isFetched
        };
    }

    return {
        lastJob: data,
        isCheckingForJob: isLoading,
        errorCheckingForJob: "",
        haveErrorCheckingForJob: false,
        isFetching,
        isFetched
    };
};

