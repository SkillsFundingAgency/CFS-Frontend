﻿import { AxiosError } from "axios";
import { useQuery, useQueryClient, UseQueryOptions } from "react-query";

import { milliseconds } from "../helpers/TimeInMs";
import { getSpecificationSummaryService } from "../services/specificationService";
import { SpecificationSummary } from "../types/SpecificationSummary";

export type SpecificationSummaryQueryResult = {
  specification: SpecificationSummary | undefined;
  isLoadingSpecification: boolean;
  errorCheckingForSpecification: AxiosError | null;
  haveErrorCheckingForSpecification: boolean;
  isFetchingSpecification: boolean;
  isSpecificationFetched: boolean;
  clearSpecificationFromCache: () => Promise<void>;
};

export const useSpecificationSummary = (
  specificationId: string | undefined,
  onError?: (err: AxiosError) => void,
  staleTime = 0
): SpecificationSummaryQueryResult => {
  const config: UseQueryOptions<SpecificationSummary, AxiosError> = {
    cacheTime: milliseconds.OneHour,
    staleTime: staleTime,
    enabled: !!specificationId?.length,
    onError: onError,
  };

  const key = `specification-${specificationId}-summary`;
  const queryClient = useQueryClient();

  const { data, error, isFetching, isLoading, isError, isFetched } = useQuery<
    SpecificationSummary,
    AxiosError
  >(key, async () => (await getSpecificationSummaryService(specificationId as string))?.data, config);

  const clearSpecificationFromCache = async () => {
    await queryClient.invalidateQueries(key);
  };

  return {
    specification: data,
    isLoadingSpecification: isError ? false : isLoading,
    haveErrorCheckingForSpecification: isError,
    errorCheckingForSpecification: error,
    isFetchingSpecification: isFetching,
    isSpecificationFetched: isFetched,
    clearSpecificationFromCache,
  };
};
