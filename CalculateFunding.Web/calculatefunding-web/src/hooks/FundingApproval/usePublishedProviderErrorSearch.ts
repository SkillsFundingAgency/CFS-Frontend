import {AxiosError} from "axios";
import {QueryConfig, useQuery} from "react-query";
import {PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {getPublishedProviderErrors, searchForPublishedProviderResults} from "../../services/publishedProviderService";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {milliseconds} from "../../helpers/TimeInMs";

export type PublishedProviderErrorSearchQueryResult = {
    publishedProvidersWithErrors: string[] | undefined,
    isLoadingPublishedProviderErrors: boolean,
    isErrorLoadingPublishedProviderErrors: boolean,
    errorLoadingPublishedProviderErrors: string
}
export const usePublishedProviderErrorSearch = (specificationId: string,
                                                isEnabled: boolean,
                                                onError: (err: AxiosError) => void)
    : PublishedProviderErrorSearchQueryResult => {
    const {data, isLoading, isError, error} = useQuery<string[], AxiosError>(`published-provider-errors-for-spec-${specificationId}`,
        async () => (await getPublishedProviderErrors(specificationId)).data,
        {
            onError,
            enabled: specificationId && specificationId.length > 0 && isEnabled
        });
    return {
        publishedProvidersWithErrors: data,
        isLoadingPublishedProviderErrors: isLoading,
        isErrorLoadingPublishedProviderErrors: isError,
        errorLoadingPublishedProviderErrors: !isError ? "" : error ?
            `Error while searching for published provider errors: ${error.message}` :
            "Unknown error while searching for published provider errors"
    }
};