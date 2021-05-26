﻿import {useQuery} from "react-query";
import {getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {AxiosError} from "axios";
import {JobDetails} from "../../types/jobDetails";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {LatestJobResult} from "../../types/Jobs/LatestJobResult";
import {milliseconds} from "../../helpers/TimeInMs";
import {JobMonitoringFilter} from "./useJobMonitor";

export interface FetchLatestSpecificationJobProps {
    jobFilter: JobMonitoringFilter,
    onError?: (err: AxiosError | Error) => void,
    enablePoling?: boolean | undefined
}

export const useFetchLatestSpecificationJob = (
    {
        jobFilter,
        onError
    }: FetchLatestSpecificationJobProps)
    : LatestJobResult => {

    const jobTypeList = jobFilter.jobTypes ? jobFilter.jobTypes.join(',') : '';

    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery<JobDetails | undefined, AxiosError>(`specification-${jobFilter.specificationId}-jobs-` + jobTypeList,
            async () => await checkForJob(jobFilter),
            {
                enabled: (jobFilter.specificationId && jobFilter.specificationId.length > 0 &&
                    jobFilter.jobTypes && jobFilter.jobTypes.length > 0) === true,
                onError: onError
            });

    const checkForJob = async (jobFilter: JobMonitoringFilter): Promise<JobDetails | undefined> => {
        if (!jobFilter.specificationId || !jobFilter.jobTypes) return;
        const response = await getJobStatusUpdatesForSpecification(jobFilter.specificationId, jobFilter.jobTypes);
        if (!response.data || response.data.length === 0) return undefined;
        const results = response.data
            .filter(item => item && item.jobId && item.jobId !== "" && item.lastUpdated)
            .sort((a, b) => Number(new Date(b.lastUpdated)) - Number(new Date(a.lastUpdated)));
        return results && results.length > 0 ? getJobDetailsFromJobResponse(results[0]) : undefined;
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

