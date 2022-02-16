import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { milliseconds } from "../helpers/TimeInMs";
import * as specificationService from "../services/specificationService";
import { SpecificationSummary } from "../types/SpecificationSummary";

export interface FindSpecsWithResultsQueryResult {
  specificationsWithResults: SpecificationSummary[] | undefined;
  isLoadingSpecificationsWithResults: boolean;
  hasFetchedSpecificationsWithResults: boolean;
}

export const useFindSpecificationsWithResults = (
  fundingStreamId: string | undefined,
  fundingPeriodId: string | undefined,
  options?: Omit<UseQueryOptions<SpecificationSummary[], AxiosError, SpecificationSummary[]>, "queryFn">
): FindSpecsWithResultsQueryResult => {
  const { data, isLoading, isFetched } = useQuery<SpecificationSummary[], AxiosError, SpecificationSummary[]>(
    ["specs-with-calc-results", fundingStreamId, fundingPeriodId],
    async () =>
      (
        await specificationService.getSpecificationsWithResultsService(
          fundingStreamId as string,
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
    specificationsWithResults: data,
    isLoadingSpecificationsWithResults: isLoading,
    hasFetchedSpecificationsWithResults: isFetched,
  };
};
