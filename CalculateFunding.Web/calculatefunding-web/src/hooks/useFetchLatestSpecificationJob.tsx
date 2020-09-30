import {JobType} from "../types/jobType";
import {useQuery} from "react-query";
import {getJobStatusUpdatesForSpecification} from "../services/jobService";
import {JobSummary} from "../types/jobSummary";

export type FetchLatestSpecificationJobResult = {
    lastJob: JobSummary | undefined,
    isCheckingForJob: boolean,
    errorCheckingForJob: string,
    haveErrorCheckingForJob: boolean,
    isFetching: boolean,
    isFetched: boolean,
}

export const useFetchLatestSpecificationJob = (specificationId: string, jobTypes: JobType[]): FetchLatestSpecificationJobResult => {
    const jobTypeList = jobTypes.join(",");
    const {data: jobs, error, isFetching, isLoading, isError, isFetched} =
        useQuery(`specification-${specificationId}-jobs-` + jobTypeList,
            async () => await checkForJob(specificationId, jobTypes));

    const checkForJob = async (specId: string, jobTypes: JobType[]) => {
        if (specId === undefined || specId === null || specId.length === 0) {
            return undefined;
        }
        if (jobTypes.length === 0) {
            throw new Error("Missing job types");
        }

        const response = await getJobStatusUpdatesForSpecification(specificationId, jobTypeList);

        if (!response || !response.data) {
            return [];
        }
        return response.data
            .filter(item => item && item.jobId !== "" && item.lastUpdated)
            .sort((a, b) => {
                return Number(b.lastUpdated) - Number(a.lastUpdated);
            });
    };

    return (isError || !jobs || jobs.length === 0) ?
        {lastJob: undefined, isCheckingForJob: isLoading, errorCheckingForJob: error as string, haveErrorCheckingForJob: isError, isFetching, isFetched} :
        {lastJob: jobs[0], isCheckingForJob: isLoading, errorCheckingForJob: "", haveErrorCheckingForJob: false, isFetching, isFetched};
};

