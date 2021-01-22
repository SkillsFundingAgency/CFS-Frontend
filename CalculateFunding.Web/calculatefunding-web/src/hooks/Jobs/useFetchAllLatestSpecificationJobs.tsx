import {JobType} from "../../types/jobType";
import {useQuery} from "react-query";
import {getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {AxiosError} from "axios";
import {JobDetails} from "../../types/jobDetails";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";

export type FetchAllLatestSpecificationJobResult = {
    allJobs: JobDetails[] | undefined,
    isCheckingForJobs: boolean,
    errorCheckingForJobs: string,
    haveErrorCheckingForJobs: boolean,
    isFetching: boolean,
    isFetched: boolean,
}

export const useFetchAllLatestSpecificationJobs = (
    specificationId: string,
    jobTypes: JobType[],
    onError?: (err: AxiosError | Error) => void)
    : FetchAllLatestSpecificationJobResult => {
    const jobTypeList = jobTypes.join(",");

    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery<JobDetails[] | undefined, AxiosError>(`specification-${specificationId}-all-jobs-` + jobTypeList,
            async () => await checkForJobs(specificationId, jobTypeList),
            {
                refetchOnWindowFocus: false,
                enabled: (specificationId && specificationId.length > 0 && jobTypes.length > 0) === true,
                onError: onError
            });

    const checkForJobs = async (specId: string, listOfJobTypes: string): Promise<JobDetails[] | undefined> => {
        const response = await getJobStatusUpdatesForSpecification(specId, listOfJobTypes);
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

