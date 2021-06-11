import {useQuery} from "react-query";
import {getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {AxiosError} from "axios";
import {JobDetails} from "../../types/jobDetails";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {JobMonitoringFilter} from "./useJobMonitor";
import {FetchLatestSpecificationJobProps} from "./useFetchLatestSpecificationJob";

export type FetchAllLatestSpecificationJobResult = {
    allJobs: JobDetails[] | undefined,
    isCheckingForJobs: boolean,
    errorCheckingForJobs: string,
    haveErrorCheckingForJobs: boolean,
    isFetching: boolean,
    isFetched: boolean,
}

export const useFetchAllLatestSpecificationJobs = (
    {
        jobFilter,
        onError
    }: FetchLatestSpecificationJobProps)
    : FetchAllLatestSpecificationJobResult => {
    const jobTypeList = jobFilter.jobTypes ? jobFilter.jobTypes.join(',') : '';

    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery<JobDetails[] | undefined, AxiosError>(`specification-${jobFilter.specificationId}-all-jobs-` + jobTypeList,
            async () => await checkForJobs(jobFilter),
            {
                refetchOnWindowFocus: false,
                enabled: (jobFilter.specificationId && jobFilter.specificationId.length > 0 &&
                    jobFilter.jobTypes && jobFilter.jobTypes.length > 0) === true,
                onError: onError
            });

    const checkForJobs = async (jobFilter: JobMonitoringFilter): Promise<JobDetails[] | undefined> => {
        if (!jobFilter.specificationId || !jobFilter.jobTypes) return;
        const response = await getJobStatusUpdatesForSpecification(jobFilter.specificationId, jobFilter.jobTypes);
        const results = response.data.filter(item => item && item.jobId && item.jobId !== "" && item.lastUpdated);
        return results && results.length > 0 ? results.map(r => getJobDetailsFromJobResponse(r) as JobDetails) : undefined;
    };

    if (isError) {
        return {
            allJobs: undefined,
            isCheckingForJobs: isLoading,
            errorCheckingForJobs: error?.response?.data,
            haveErrorCheckingForJobs: isError,
            isFetching,
            isFetched
        };
    }

    return {
        allJobs: data,
        isCheckingForJobs: isLoading,
        errorCheckingForJobs: "",
        haveErrorCheckingForJobs: false,
        isFetching, isFetched
    };
};

