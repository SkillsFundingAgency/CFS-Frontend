import {JobType} from "../../types/jobType";
import {useQuery} from "react-query";
import {getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {getJobDetailsFromJobSummary, JobDetails} from "../../helpers/jobDetailsHelper";
import {AxiosError} from "axios";

export type FetchLatestSpecificationJobResult = {
    lastJob: JobDetails | undefined,
    isCheckingForJob: boolean,
    errorCheckingForJob: string,
    haveErrorCheckingForJob: boolean,
    isFetching: boolean,
    isFetched: boolean,
}

export const useFetchLatestSpecificationJob = (
    specificationId: string,
    jobTypes: JobType[],
    onError?: (err: AxiosError) => void)
    : FetchLatestSpecificationJobResult => {
    const jobTypeList = jobTypes.join(",");

    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery<JobDetails | undefined, AxiosError>(`specification-${specificationId}-jobs-` + jobTypeList,
            async () => await checkForJob(specificationId, jobTypeList),
            {
                enabled: specificationId && specificationId.length > 0 && jobTypes.length > 0,
                onError: err => onError
            });

    const checkForJob = async (specId: string, listOfJobTypes: string): Promise<JobDetails | undefined> => {
        const response = await getJobStatusUpdatesForSpecification(specId, listOfJobTypes);
        const results = response.data
            .filter(item => item && item.jobId !== "" && item.lastUpdated)
            .sort((a, b) => Number(new Date(b.lastUpdated)) - Number(new Date(a.lastUpdated)));
        return results ? getJobDetailsFromJobSummary(results[0]) : undefined;
    };

    if (isError) {
        return {lastJob: undefined, isCheckingForJob: isLoading, errorCheckingForJob: error?.response?.data, haveErrorCheckingForJob: isError, isFetching, isFetched};
    }

    return {lastJob: data, isCheckingForJob: isLoading, errorCheckingForJob: "", haveErrorCheckingForJob: false, isFetching, isFetched};
};

