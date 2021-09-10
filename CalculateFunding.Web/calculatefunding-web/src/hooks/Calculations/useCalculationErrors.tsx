import { AxiosError } from "axios";
import { UseQueryOptions,useQuery,useQueryClient } from "react-query";

import { milliseconds } from "../../helpers/TimeInMs";
import { getCalculationErrorsBySpecificationId } from "../../services/calculationService";
import { CalculationError, CalculationErrorQueryResult } from "../../types/Calculations/CalculationError";

export const useCalculationErrors = (
  specificationId: string,
  onError?: (err: AxiosError) => void,
  staleTime: number = milliseconds.OneHour
): CalculationErrorQueryResult => {
  const config: UseQueryOptions<CalculationError[], AxiosError> = {
    cacheTime: milliseconds.OneHour,
    staleTime: staleTime,
    refetchOnWindowFocus: false,
    enabled: (specificationId && specificationId.length > 0) === true,
    onError: onError,
  };

  const key = `calculationErrors-${specificationId}`;
  const queryClient = useQueryClient();

  const { data, error, isFetching, isLoading, isError, isFetched } = useQuery<CalculationError[], AxiosError>(
    `specification-${specificationId}-summary`,
    async () => (await getCalculationErrorsBySpecificationId(specificationId)).data,
    config
  );

  const clearCalculationErrorsFromCache = async () => {
    await queryClient.invalidateQueries(key);
  };

  return {
    calculationErrors: data,
    isLoadingCalculationErrors: isError ? false : isLoading,
    haveErrorCheckingForCalculationErrors: isError,
    errorCheckingForCalculationErrors: error,
    isFetchingCalculationErrors: isFetching,
    areCalculationErrorsFetched: isFetched,
    calculationErrorCount: data?.length ?? 0,
    clearCalculationErrorsFromCache: clearCalculationErrorsFromCache,
  };
};
