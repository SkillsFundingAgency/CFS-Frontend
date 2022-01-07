import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { milliseconds } from "../../helpers/TimeInMs";
import { getCurrentPublishedProvider } from "../../services/providerService";
import { PublishedProviderVersion } from "../../types/PublishedProvider/PublishedProviderVersion";

export type CurrentPublishedProviderVersionQueryResult = {
  publishedProviderVersion: PublishedProviderVersion | undefined;
  isLoadingPublishedProviderVersion: boolean;
  isFetchingPublishedProviderVersion: boolean;
  isErrorLoadingPublishedProviderVersion: boolean;
  errorLoadingPublishedProviderVersion: AxiosError | null;
};

export const useCurrentPublishedProvider = (
  specificationId: string,
  fundingStreamId: string | undefined,
  providerId: string,
  onError: (err: AxiosError) => void
): CurrentPublishedProviderVersionQueryResult => {
  const { data, isLoading, isError, error, isFetching } = useQuery<PublishedProviderVersion, AxiosError>(
    `current-published-provider-${providerId}-specification-${specificationId}-fundingStreamId-${fundingStreamId}`,
    async () => (await getCurrentPublishedProvider(specificationId, fundingStreamId as string, providerId)).data,
    {
      onError: onError,
      cacheTime: milliseconds.OneDay,
      staleTime: milliseconds.OneDay,
      refetchOnWindowFocus: false,
      enabled:
        (specificationId &&
          fundingStreamId &&
          providerId &&
          specificationId.length > 0 &&
          fundingStreamId.length > 0 &&
          providerId.length > 0) === true,
    }
  );

  return {
    publishedProviderVersion: data,
    isLoadingPublishedProviderVersion: isLoading,
    isFetchingPublishedProviderVersion: isFetching,
    isErrorLoadingPublishedProviderVersion: isError,
    errorLoadingPublishedProviderVersion: error,
  };
};
