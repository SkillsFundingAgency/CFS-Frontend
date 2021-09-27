import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";
import { QueryObserverResult, RefetchOptions } from "react-query/types/core/types";

import * as publishedProviderService from "../../services/publishedProviderService";
import { PublishedProviderSearchRequest } from "../../types/publishedProviderSearchRequest";

export type PublishedProviderIdsQueryResult = {
  publishedProviderIds: string[] | undefined;
  isLoadingPublishedProviderIds: boolean;
  refetchPublishedProviderIds: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<string[], AxiosError>>;
};
export const usePublishedProviderIds = (
  searchRequest: PublishedProviderSearchRequest | undefined,
  queryConfig: UseQueryOptions<string[], AxiosError>
): PublishedProviderIdsQueryResult => {
  const providerIdSearchRequest: PublishedProviderSearchRequest | undefined = searchRequest
    ? { ...(searchRequest as PublishedProviderSearchRequest), ...{ pageSize: 30000, pageNumber: 1 } }
    : undefined;

  const {
    data: publishedProviderIds,
    isLoading: isLoadingPublishedProviderIds,
    refetch: refetchPublishedProviderIds,
  } = useQuery<string[], AxiosError>(
    ["published-provider-ids-for-search", providerIdSearchRequest],
    async () =>
      (
        await publishedProviderService.getAllProviderVersionIdsForSearch(
          providerIdSearchRequest as PublishedProviderSearchRequest
        )
      ).data,
    {
      enabled: queryConfig.enabled && searchRequest !== undefined,
      onError: queryConfig.onError,
    }
  );
  return {
    publishedProviderIds,
    isLoadingPublishedProviderIds,
    refetchPublishedProviderIds,
  };
};
