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

export const useFetchLatestSpecificationJob = (specificationId: string, jobTypes: JobType[])
    : FetchLatestSpecificationJobResult => {
    const jobTypeList = jobTypes.join(",");
    
    const {data, error, isFetching, isLoading, isError, isFetched} =
        useQuery(`specification-${specificationId}-jobs-` + jobTypeList,
            async () => await checkForJob(specificationId, jobTypes),
            {enabled: specificationId && specificationId.length > 0});

    const checkForJob = async (specId: string, jobTypes: JobType[]) => {
        if (specId === undefined || specId === null || specId.length === 0) {
            return undefined;
        }
        if (jobTypes.length === 0) {
            return new Error("Missing job types");
        }

        try {
            const response = await getJobStatusUpdatesForSpecification(specificationId, jobTypeList);

            if (response.status !== 200) {
                return new Error(response.statusText);
            }
            if (!response || !response.data) {
                return [];
            }
            return response.data
                .filter(item => item && item.jobId !== "" && item.lastUpdated)
                .sort((a, b) => {
                    return Number(b.lastUpdated) - Number(a.lastUpdated);
                });
        } catch (e) {
            return new Error(e.message);
        }
    };
    
    if (data instanceof Error) {
        return {lastJob: undefined, isCheckingForJob: false, errorCheckingForJob: data.message, haveErrorCheckingForJob: true, isFetching: false, isFetched: false};
    }
    if (isError) {
        return {lastJob: undefined, isCheckingForJob: isLoading, errorCheckingForJob: error as string, haveErrorCheckingForJob: isError, isFetching, isFetched};
    }
    
    const jobs = data as JobSummary[];
    return {lastJob: jobs && jobs.length > 0 ? jobs[0] : undefined, isCheckingForJob: isLoading, errorCheckingForJob: "", haveErrorCheckingForJob: false, isFetching, isFetched};
};

