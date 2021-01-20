import {AxiosError} from "axios";
import {useQuery, UseQueryOptions} from "react-query";
import * as publishedProviderService from "../../services/publishedProviderService";
import {buildInitialPublishedProviderIdsSearchRequest, PublishedProviderIdsSearchRequest} from "../../types/publishedProviderIdsSearchRequest";
import {QueryObserverResult, RefetchOptions} from "react-query/types/core/types";

export type PublishedProviderIdsQueryResult = {
    publishedProviderIds: string[] | undefined,
    isLoadingPublishedProviderIds: boolean,
    refetchPublishedProviderIds: (options?: RefetchOptions) => Promise<QueryObserverResult<string[], AxiosError>>,
}
export const usePublishedProviderIds = (fundingStreamId: string, 
                                        fundingPeriodId: string, 
                                        specificationId: string,
                                        queryConfig: UseQueryOptions<string[], AxiosError>)
    : PublishedProviderIdsQueryResult => {

    const {data, isLoading, refetch} =
        useQuery<string[], AxiosError>(
            `published-provider-ids-for-spec-${specificationId}-${fundingStreamId}-${fundingPeriodId}`,
            async () => {
                const searchRequest: PublishedProviderIdsSearchRequest = buildInitialPublishedProviderIdsSearchRequest(fundingStreamId, fundingPeriodId, specificationId);
                return (await publishedProviderService.getAllProviderVersionIdsForSearch(searchRequest)).data
            },
            queryConfig);
    return {
        publishedProviderIds: data,
        isLoadingPublishedProviderIds: isLoading,
        refetchPublishedProviderIds: refetch,
    }
};