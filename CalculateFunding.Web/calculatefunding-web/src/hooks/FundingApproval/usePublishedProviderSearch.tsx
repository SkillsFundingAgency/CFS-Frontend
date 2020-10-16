import {AxiosError} from "axios";
import {QueryConfig, useQuery} from "react-query";
import {PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {searchForPublishedProviderResults} from "../../services/publishedProviderService";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";

export type PublishedProviderSearchQueryResult = {
    publishedProviderSearchResults: PublishedProviderSearchResults | undefined,
    isLoadingSearchResults: boolean,
    isErrorLoadingSearchResults: boolean,
    errorLoadingSearchResults: string
}
export const usePublishedProviderSearch = (searchRequest: PublishedProviderSearchRequest,
                                           isEnabled: boolean,
                                           queryConfig: QueryConfig<PublishedProviderSearchResults, AxiosError> =
                                               {
                                                   enabled: searchRequest && searchRequest.fundingStreamId && searchRequest.fundingPeriodId && isEnabled
                                               })
    : PublishedProviderSearchQueryResult => {
    const {data, isLoading, isError, error} =
        useQuery<PublishedProviderSearchResults, AxiosError>(
            ["published-provider-search", searchRequest],
            async () => (await searchForPublishedProviderResults(searchRequest)).data,
            queryConfig);
    return {
        publishedProviderSearchResults: data,
        isLoadingSearchResults: isLoading,
        isErrorLoadingSearchResults: isError,
        errorLoadingSearchResults: !isError ? "" : error ?
            `Error while searching for published providers: ${error.message}` :
            "Unknown error while searching for published providers"
    }
};
