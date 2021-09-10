import { AxiosError } from "axios";
import { UseQueryOptions,useQuery,useQueryClient } from "react-query";

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
  specificationId: string,
  onError: (err: AxiosError) => void,
  staleTime = 0
): SpecificationSummaryQueryResult => {
  const config: UseQueryOptions<SpecificationSummary, AxiosError> = {
    cacheTime: milliseconds.OneHour,
    staleTime: staleTime,
    refetchOnWindowFocus: false,
    enabled: (specificationId && specificationId.length > 0) === true,
    onError: onError,
  };

  const key = `specification-${specificationId}-summary`;
  const queryClient = useQueryClient();

  const { data, error, isFetching, isLoading, isError, isFetched } = useQuery<
    SpecificationSummary,
    AxiosError
  >(
    `specification-${specificationId}-summary`,
    async () => (await getSpecificationSummaryService(specificationId)).data,
    config
  );

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
