import {AxiosError} from "axios";
import {JobDetails} from "../../types/jobDetails";
import {useQuery} from "react-query";
import {getLatestJobByEntityId} from "../../services/jobService";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {LatestJobResult} from "../../types/Jobs/LatestJobResult";

export const useFetchLatestJobByEntityId =(
    specificationId:string,
    entityId:string,
    onError?:(err:AxiosError | Error) => void)
    : LatestJobResult => {

    const {data, error, isFetching, isLoading, isError, isFetched} =
    useQuery<JobDetails | undefined, AxiosError>(`specification=${specificationId}-${entityId}-job`,
        async () => await checkJob(), {
        enabled: (specificationId && specificationId.length > 0 && entityId && entityId.length > 0) === true,
            onError: onError
        });

    const checkJob = async () : Promise<JobDetails | undefined> => {
        const response = await getLatestJobByEntityId(specificationId, entityId);
        const result = response.data?.jobId != undefined && response.data?.jobId !== "" ? response.data : undefined;

        return result ? getJobDetailsFromJobResponse(result) : undefined;
    }

    if (isError) {
        return {lastJob: undefined, isCheckingForJob: isLoading, errorCheckingForJob: error?.response?.data, haveErrorCheckingForJob: isError, isFetching, isFetched};
    }

    return {lastJob: data, isCheckingForJob: isLoading, errorCheckingForJob: "", haveErrorCheckingForJob: false, isFetching, isFetched};
}