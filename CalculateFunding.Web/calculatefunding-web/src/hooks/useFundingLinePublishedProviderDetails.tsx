import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { milliseconds } from "../helpers/TimeInMs";
import * as publishedProviderFundingLineService from "../services/publishedProviderFundingLineService";
import { FundingLineProfileViewModel } from "../types/PublishedProvider/FundingLineProfile";

export interface GetFundingLinePublishedProviderDetailsQueryResult {
  fundingLineProfile: FundingLineProfileViewModel | undefined;
  isLoadingFundingLineProfile: boolean;
  refetchFundingLineProfile: () => void;
}

export const useFindSpecificationsWithResults = ({
  specificationId,
  providerId,
  fundingStreamId,
  fundingPeriodId,
  fundingLineCode,
  options,
}: {
  specificationId: string | undefined;
  providerId: string | undefined;
  fundingStreamId: string | undefined;
  fundingPeriodId: string | undefined;
  fundingLineCode: string | undefined;
  options?: Omit<
    UseQueryOptions<FundingLineProfileViewModel, AxiosError, FundingLineProfileViewModel>,
    "queryFn"
  >;
}): GetFundingLinePublishedProviderDetailsQueryResult => {
  const { data, isLoading, refetch } = useQuery<
    FundingLineProfileViewModel,
    AxiosError,
    FundingLineProfileViewModel
  >(
    [
      "funding-line-provider-profile",
      specificationId,
      providerId,
      fundingLineCode,
      fundingStreamId,
      fundingPeriodId,
    ],
    async () =>
      (
        await publishedProviderFundingLineService.getFundingLinePublishedProviderDetails(
          specificationId as string,
          providerId as string,
          fundingStreamId as string,
          fundingLineCode as string,
          fundingPeriodId as string
        )
      ).data,
    {
      enabled: !!fundingStreamId?.length && !!fundingPeriodId?.length,
      cacheTime: milliseconds.TenSeconds,
      staleTime: milliseconds.TenSeconds,
      ...options,
    }
  );

  return {
    fundingLineProfile: data,
    isLoadingFundingLineProfile: isLoading,
    refetchFundingLineProfile: refetch,
  };
};
