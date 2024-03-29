﻿import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import * as providerService from "../services/providerService";
import { ProviderSnapshot, ProviderSource } from "../types/CoreProviderSummary";

export interface GetProviderSnapshotsQueryResult {
  providerSnapshots: ProviderSnapshot[] | undefined;
  isLoadingProviderSnapshots: boolean;
}

export const useGetProviderSnapshots = (
  fundingStreamId: string | undefined,
  fundingPeriodId: string | undefined,
  providerSource: ProviderSource | undefined,  
  options: Partial<UseQueryOptions<ProviderSnapshot[], AxiosError>> = {}
): GetProviderSnapshotsQueryResult => {
  const { data, isLoading } = useQuery<ProviderSnapshot[], AxiosError>(
    `coreProviderSummary-for-${fundingStreamId}-${fundingPeriodId}`,
    async () => (await providerService.getProviderSnapshotsByFundingStream(fundingStreamId as string, fundingPeriodId as string)).data,
    {
        enabled: !!fundingStreamId?.length && !!fundingPeriodId?.length && providerSource === ProviderSource.FDZ,
      ...options,
    }
  );

  return {
    providerSnapshots: data,
    isLoadingProviderSnapshots: isLoading,
  };
};
