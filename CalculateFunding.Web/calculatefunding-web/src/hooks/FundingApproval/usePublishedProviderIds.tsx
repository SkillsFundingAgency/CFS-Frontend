import {AxiosError} from "axios";
import {useQuery} from "react-query";
import {getAllProviderVersionIdsForSearch} from "../../services/publishedProviderService";
import {buildInitialPublishedProviderIdsSearchRequest, PublishedProviderIdsSearchRequest} from "../../types/publishedProviderIdsSearchRequest";

export type PublishedProviderIdsQueryResult = {
    publishedProviderIds: string[] | undefined,
    isLoadingPublishedProviderIds: boolean,
}
export const usePublishedProviderIds = (fundingStreamId: string, 
                                        fundingPeriodId: string, 
                                        specificationId: string,
                                        isEnabled: boolean,
                                        onError: (err: AxiosError) => void)
    : PublishedProviderIdsQueryResult => {

    const {data, isLoading} =
        useQuery<string[], AxiosError>(
            `published-provider-ids-for-spec-${specificationId}-${fundingStreamId}-${fundingPeriodId}`,
            async () => {
                const searchRequest: PublishedProviderIdsSearchRequest = buildInitialPublishedProviderIdsSearchRequest(fundingStreamId, fundingPeriodId, specificationId);
                return (await getAllProviderVersionIdsForSearch(searchRequest)).data
            },
            {
                onError,
                enabled: specificationId && specificationId.length > 0
                    && fundingStreamId && fundingStreamId.length > 0
                    && fundingPeriodId && fundingPeriodId.length > 0
                    && isEnabled
            });
    return {
        publishedProviderIds: data,
        isLoadingPublishedProviderIds: isLoading,
    }
};