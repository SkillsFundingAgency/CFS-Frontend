import {JobDetails} from "../jobDetails";

export type FetchLatestSpecificationJobResult = {
    lastJob: JobDetails | undefined,
    isCheckingForJob: boolean,
    errorCheckingForJob: string,
    haveErrorCheckingForJob: boolean,
    isFetching: boolean,
    isFetched: boolean,
}