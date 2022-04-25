import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { searchCalculationProviders } from "../../services/calculationService";
import { CalculationProviderSearchResponse } from "../../types/CalculationProviderResult";
import { CalculationProviderSearchRequest } from "../../types/calculationProviderSearchRequest";

export interface UseCalculationProviderSearchResult {
  calculationProvidersData: CalculationProviderSearchResponse | undefined;
  refetchCalculationProviders: () => void;
  isLoadingCalculationProviders: boolean;
}

export const useCalculationProviderSearch = (
  searchRequest: CalculationProviderSearchRequest,
  options: Partial<UseQueryOptions<CalculationProviderSearchResponse, AxiosError>> = {}
): UseCalculationProviderSearchResult => {
  const { data, isLoading, refetch, ...rest } = useQuery<CalculationProviderSearchResponse, AxiosError>(
    ["calculation-provider-search", searchRequest],
    async () => (await searchCalculationProviders(searchRequest)).data,
    {
      enabled: !!searchRequest && !!searchRequest.calculationId?.length,
      ...options,
    }
  );

  return {
    calculationProvidersData: data,
    refetchCalculationProviders: refetch,
    isLoadingCalculationProviders: isLoading,
    ...rest,
  };
};
