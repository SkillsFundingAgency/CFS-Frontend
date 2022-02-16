import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { getCalculationSummaryBySpecificationId } from "../../services/calculationService";
import { CalculationSummary } from "../../types/CalculationDetails";

export interface CalculationSummaryBySpecificationQueryResult {
  calculationSummaries: CalculationSummary[] | undefined;
  isLoadingCalculationSummaries: boolean;
}

export const useCalculationSummariesBySpecification = ({
  specificationId,
  options = {},
}: {
  specificationId: string | undefined;
  options?: Omit<UseQueryOptions<CalculationSummary[], AxiosError, CalculationSummary[]>, "queryFn">;
}): CalculationSummaryBySpecificationQueryResult => {
  const { data, isLoading } = useQuery<CalculationSummary[], AxiosError, CalculationSummary[]>(
    ["calculation-summaries-by-spec", specificationId],
    async () => (await getCalculationSummaryBySpecificationId(specificationId as string)).data,
    {
      enabled: !!specificationId?.length,
      ...options,
    }
  );

  return {
    calculationSummaries: data,
    isLoadingCalculationSummaries: isLoading,
  };
};
