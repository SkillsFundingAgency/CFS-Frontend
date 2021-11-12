import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { milliseconds } from "../helpers/TimeInMs";
import * as policyService from "../services/policyService";
import { FundingStream } from "../types/viewFundingTypes";

export const useFundingStreams = (
  securityTrimmed: boolean,
  queryConfig: UseQueryOptions<FundingStream[], AxiosError> = {
    cacheTime: milliseconds.OneDay,
    staleTime: milliseconds.OneDay,
  }
) => {
  const { data, isLoading } = useQuery(
    "funding-streams",
    async () => (await policyService.getFundingStreamsService(securityTrimmed)).data,
      {
          cacheTime: queryConfig.cacheTime,
          staleTime: queryConfig.staleTime
      }
  );
  return { fundingStreams: data, isLoadingFundingStreams: isLoading };
};
