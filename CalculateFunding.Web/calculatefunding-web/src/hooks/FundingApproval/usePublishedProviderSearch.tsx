import {AxiosError} from "axios";
import {useQuery, UseQueryOptions} from "react-query";
import {PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {searchForPublishedProviderResults} from "../../services/publishedProviderService";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {QueryObserverResult, RefetchOptions} from "react-query/types/core/types";

export type PublishedProviderSearchQueryResult = {
    publishedProviderSearchResults: PublishedProviderSearchResults | undefined,
    isLoadingSearchResults: boolean,
    refetchSearchResults: (options?: RefetchOptions) => Promise<QueryObserverResult<PublishedProviderSearchResults, AxiosError>>,
}

export const usePublishedProviderSearch = (searchRequest: PublishedProviderSearchRequest | undefined,
                                           queryConfig: UseQueryOptions<PublishedProviderSearchResults, AxiosError>)
    : PublishedProviderSearchQueryResult => {
    const {data, isLoading, refetch} =
        useQuery<PublishedProviderSearchResults, AxiosError>(
            ["published-provider-search", searchRequest],
            async () => (await searchForPublishedProviderResults(searchRequest as PublishedProviderSearchRequest)).data,
            queryConfig);
    return {
        publishedProviderSearchResults: data,
        isLoadingSearchResults: isLoading,
        refetchSearchResults: refetch
    }
};
