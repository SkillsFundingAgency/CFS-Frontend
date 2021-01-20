import {useQuery, UseQueryOptions} from "react-query";
import {FundingStream} from "../types/viewFundingTypes";
import {AxiosError} from "axios";
import * as policyService from "../services/policyService";
import {milliseconds} from "../helpers/TimeInMs";

export const useFundingStreams = (securityTrimmed: boolean, queryConfig: UseQueryOptions<FundingStream[], AxiosError> = {
    cacheTime: milliseconds.OneDay,
    staleTime: milliseconds.OneDay
}) => {
    const {data, isLoading} = useQuery(
        `funding-streams`,
        async () => (await policyService.getFundingStreamsService(securityTrimmed)).data,
        queryConfig);
    return {fundingStreams: data, isLoadingFundingStreams: isLoading};
}