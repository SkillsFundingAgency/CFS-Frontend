import {AxiosError} from "axios";
import {QueryConfig, useQuery} from "react-query";
import {buildInitialPublishedProviderSearchRequest, PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {getAllProviderVersionIdsForSearch} from "../../services/publishedProviderService";
import {SearchMode} from "../../types/SearchMode";
import {PublishedProviderIdsSearchRequest} from "../../types/publishedProviderIdsSearchRequest";

export type PublishedProviderIdsQueryResult = {
    publishedProviderIds: string[] | undefined,
    isLoadingPublishedProviderIds: boolean,
    isErrorLoadingPublishedProviderIds: boolean,
    errorLoadingPublishedProviderIds: string
}
export const usePublishedProviderIds = (searchRequest: PublishedProviderIdsSearchRequest,
                                        isEnabled: boolean,
                                        queryConfig: QueryConfig<string[], AxiosError> =
                                            {
                                                enabled: searchRequest 
                                                    && searchRequest.specificationId && searchRequest.specificationId.length > 0 
                                                    && searchRequest.fundingStreamId && searchRequest.fundingStreamId.length > 0 
                                                    && searchRequest.fundingPeriodId && searchRequest.fundingPeriodId.length > 0 
                                                    && isEnabled
                                            })
    : PublishedProviderIdsQueryResult => {
    
    const {data, isLoading, isError, error} =
        useQuery<string[], AxiosError>(
            [`published-provider-ids`, searchRequest],
            async () => (await getAllProviderVersionIdsForSearch(searchRequest)).data,
            queryConfig);

    return {
        publishedProviderIds: data,
        isLoadingPublishedProviderIds: isLoading,
        isErrorLoadingPublishedProviderIds: isError,
        errorLoadingPublishedProviderIds: !isError ? "" : error ?
            `Error while fetching published providers IDs: ${error.message}` :
            "Unknown error while fetching published providers IDs"
    }
};