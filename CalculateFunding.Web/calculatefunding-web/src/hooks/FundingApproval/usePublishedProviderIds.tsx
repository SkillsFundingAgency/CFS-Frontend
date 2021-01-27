import {AxiosError} from "axios";
import {useQuery, UseQueryOptions} from "react-query";
import * as publishedProviderService from "../../services/publishedProviderService";
import {QueryObserverResult, RefetchOptions} from "react-query/types/core/types";
import {ApprovalMode} from "../../types/ApprovalMode";
import {PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";

export type PublishedProviderIdsQueryResult = {
    publishedProviderIds: string[] | undefined,
    isLoadingPublishedProviderIds: boolean,
    refetchPublishedProviderIds: (options?: RefetchOptions) => Promise<QueryObserverResult<string[], AxiosError>>,
}
export const usePublishedProviderIds = (searchRequest: PublishedProviderSearchRequest | undefined, 
                                        approvalMode: ApprovalMode | undefined,
                                        queryConfig: UseQueryOptions<string[], AxiosError>)
    : PublishedProviderIdsQueryResult => {
    const {data: publishedProviderIds, isLoading: isLoadingPublishedProviderIds, refetch: refetchPublishedProviderIds} =
        useQuery<string[], AxiosError>(
            ["published-provider-ids-for-search", searchRequest],
            async () => (await publishedProviderService.getAllProviderVersionIdsForSearch(searchRequest as PublishedProviderSearchRequest)).data,
            {
                enabled: queryConfig.enabled && searchRequest !== undefined && approvalMode && approvalMode === ApprovalMode.Batches,
                onError: queryConfig.onError
            });
    return {
        publishedProviderIds,
        isLoadingPublishedProviderIds,
        refetchPublishedProviderIds,
    }
};