import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import * as providerVersionService from "../services/providerVersionService";
import { CoreProviderSummary, ProviderSource } from "../types/CoreProviderSummary";

export interface GetCoreProvidersQueryResult {
  coreProviders: CoreProviderSummary[] | undefined;
  isLoadingCoreProviders: boolean;
}

export const useGetCoreProviders = (
  fundingStreamId: string | undefined,
  providerSource: ProviderSource | undefined,
  options: Partial<UseQueryOptions<CoreProviderSummary[], AxiosError>> = {}
): GetCoreProvidersQueryResult => {
  const { data, isLoading } = useQuery<CoreProviderSummary[], AxiosError>(
    `coreProviderSummary-for-${fundingStreamId}`,
    async () =>
      (await providerVersionService.getCoreProvidersByFundingStream(fundingStreamId as string)).data,
    {
      enabled: !!fundingStreamId?.length && providerSource === ProviderSource.CFS,
      ...options,
    }
  );

  return {
    coreProviders: data,
    isLoadingCoreProviders: isLoading,
  };
};
