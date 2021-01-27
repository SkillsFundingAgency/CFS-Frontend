import {AxiosError} from "axios";
import {useQuery, UseQueryOptions} from "react-query";
import {PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import * as publishedProviderService from "../../services/publishedProviderService";
import {ApprovalMode} from "../../types/ApprovalMode";
import {usePublishedProviderIds} from "./usePublishedProviderIds";

export type PublishedProviderSearchQueryResult = {
    publishedProviderSearchResults: PublishedProviderSearchResults | undefined,
    isLoadingSearchResults: boolean,
    publishedProviderIds: string[] | undefined,
    refetchSearchResults: () => void,
}

export const usePublishedProviderSearch = (searchRequest: PublishedProviderSearchRequest | undefined,
                                           approvalMode: ApprovalMode | undefined,
                                           queryConfig: UseQueryOptions<PublishedProviderSearchResults, AxiosError>)
    : PublishedProviderSearchQueryResult => {

    const {data: publishedProviderSearchResults, isLoading: isLoadingResults, refetch: refetchSearchResults} =
        useQuery<PublishedProviderSearchResults, AxiosError>(
            ["published-provider-search", searchRequest],
            async () => (await publishedProviderService.searchForPublishedProviderResults(searchRequest as PublishedProviderSearchRequest)).data,
            {...queryConfig, refetchOnWindowFocus: false});

    const {publishedProviderIds, isLoadingPublishedProviderIds, refetchPublishedProviderIds} =
        usePublishedProviderIds(searchRequest, approvalMode,
            {
                enabled: queryConfig.enabled,
                onError: queryConfig.onError,
                refetchOnWindowFocus: false
            });

    return {
        publishedProviderSearchResults,
        isLoadingSearchResults: isLoadingResults || isLoadingPublishedProviderIds,
        publishedProviderIds,
        refetchSearchResults: () => {
            refetchSearchResults() && approvalMode === ApprovalMode.Batches && refetchPublishedProviderIds()
        }
    }
};
