import {AxiosError} from "axios";
import {QueryConfig, useQuery} from "react-query";
import {PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {searchForPublishedProviderResults} from "../../services/publishedProviderService";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";

export type PublishedProviderErrorSearchQueryResult = {
    publishedProvidersWithErrors: PublishedProviderSearchResults | undefined,
    isLoadingPublishedProviderErrors: boolean,
    isErrorLoadingPublishedProviderErrors: boolean,
    errorLoadingPublishedProviderErrors: string
}
export const usePublishedProviderErrorSearch = (searchRequest: PublishedProviderSearchRequest,
                                                isEnabled: boolean,
                                                queryConfig: QueryConfig<PublishedProviderSearchResults, AxiosError> =
                                               {
                                                   enabled: searchRequest && searchRequest.fundingStreamId && searchRequest.fundingPeriodId && isEnabled
                                               })
    : PublishedProviderErrorSearchQueryResult => {
    const searchRequestWithJustErrors = {...searchRequest, hasErrors: true, pageSize: 20, pageNumber: 1};
    const {data, isLoading, isError, error} = useQuery<PublishedProviderSearchResults, AxiosError>(["published-provider-errors", searchRequestWithJustErrors],
        async () => (await searchForPublishedProviderResults(searchRequestWithJustErrors)).data,
        queryConfig);
    return {
        publishedProvidersWithErrors: data,
        isLoadingPublishedProviderErrors: isLoading,
        isErrorLoadingPublishedProviderErrors: isError,
        errorLoadingPublishedProviderErrors: !isError ? "" : error ?
            `Error while searching for published provider errors: ${error.message}` :
            "Unknown error while searching for published provider errors"
    }
};