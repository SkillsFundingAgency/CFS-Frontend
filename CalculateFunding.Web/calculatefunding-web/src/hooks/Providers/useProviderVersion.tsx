﻿import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { milliseconds } from "../../helpers/TimeInMs";
import { getProviderByIdAndVersionService } from "../../services/providerService";
import { ProviderSummary } from "../../types/ProviderSummary";

export type ProviderVersionQueryResult = {
  providerVersion: ProviderSummary | undefined;
  isLoadingProviderVersion: boolean;
  isFetchingProviderVersion: boolean;
  isErrorLoadingProviderVersion: boolean;
  errorLoadingProviderVersion: AxiosError | null;
};

export const useProviderVersion = (
  providerId: string,
  providerVersionId: string | undefined,
  onError: (err: AxiosError) => void,
  options: Partial<UseQueryOptions<ProviderSummary, AxiosError>> = {}
): ProviderVersionQueryResult => {
  const versionId = !providerVersionId || providerVersionId === "undefined" ? "" : providerVersionId;
  const { data, isLoading, isError, error, isFetching } = useQuery<ProviderSummary, AxiosError>(
    `provider-${providerId}-version-${versionId}`,
    async () => (await getProviderByIdAndVersionService(providerId, versionId)).data,
    {
      onError: onError,
      cacheTime: milliseconds.TenSeconds,
      staleTime: milliseconds.OneDay,
      refetchOnWindowFocus: false,
      enabled: providerId?.length > 0 && versionId?.length > 0,
      ...options,
    }
  );

  return {
    providerVersion: data,
    isLoadingProviderVersion: isLoading,
    isFetchingProviderVersion: isFetching,
    isErrorLoadingProviderVersion: isError,
    errorLoadingProviderVersion: error,
  };
};
