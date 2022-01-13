import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";
import { QueryObserverResult, RefetchOptions } from "react-query/types/core/types";

import * as publishedProviderService from "../../services/publishedProviderService";

export type PublishedProviderIdsQueryResult = {
  publishedProviderIds: string[] | undefined;
  isLoadingPublishedProviderIds: boolean;
  refetchPublishedProviderIds: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<string[], AxiosError>>;
};
export const usePublishedProviderIds = (
  specificationId: string,
  queryConfig: UseQueryOptions<string[], AxiosError>
): PublishedProviderIdsQueryResult => {
  const {
    data: publishedProviderIds,
    isLoading: isLoadingPublishedProviderIds,
    refetch: refetchPublishedProviderIds,
  } = useQuery<string[], AxiosError>(
    ["published-provider-id/{specificationId}"],
    async () => (await publishedProviderService.getAllProviderVersionIds(specificationId)).data,
    {
      enabled: queryConfig.enabled,
      onError: queryConfig.onError,
    }
  );
  return {
    publishedProviderIds,
    isLoadingPublishedProviderIds,
    refetchPublishedProviderIds,
  };
};
