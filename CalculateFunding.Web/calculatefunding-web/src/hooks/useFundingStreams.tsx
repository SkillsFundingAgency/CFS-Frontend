import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { milliseconds } from "../helpers/TimeInMs";
import * as policyService from "../services/policyService";
import { FundingStream } from "../types/viewFundingTypes";

export const useFundingStreams = (
  securityTrimmed: boolean,
  options?: Omit<UseQueryOptions<FundingStream[], AxiosError, FundingStream[]>, "queryFn">
) => {
  const results = useQuery<FundingStream[], AxiosError, FundingStream[]>(
    ["funding-streams", securityTrimmed],
    async () => (await policyService.getFundingStreamsService(securityTrimmed))?.data,
    {
      cacheTime: milliseconds.OneDay,
      staleTime: milliseconds.OneDay,
      ...options,
    }
  );

  const { data, isLoading } = results;
  return { fundingStreams: data, isLoadingFundingStreams: isLoading, ...results };
};
