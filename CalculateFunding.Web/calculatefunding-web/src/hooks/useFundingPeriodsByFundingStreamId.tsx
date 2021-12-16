import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { milliseconds } from "../helpers/TimeInMs";
import * as specificationService from "../services/specificationService";
import { FundingPeriod } from "../types/viewFundingTypes";

export const useFundingPeriodsByFundingStreamId = (
  fundingStreamId: string | undefined,
  options?: Omit<UseQueryOptions<FundingPeriod[], AxiosError, FundingPeriod[]>, "queryFn">
) => {
  const results = useQuery<FundingPeriod[], AxiosError, FundingPeriod[]>(
    ["funding-periods-by-funding-stream", fundingStreamId],
    async () => (await specificationService.getFundingPeriodsByFundingStreamIdService(fundingStreamId as string)).data,
    {
      enabled: !!fundingStreamId?.length,
      cacheTime: milliseconds.OneDay,
      staleTime: milliseconds.OneDay,
      ...options,
    }
  );

  const { data, isLoading } = results;
  
  return { fundingPeriods: data, isLoadingFundingPeriods: isLoading, ...results };
};
