import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { getSpecificationsByFundingPeriodAndStreamIdWithResultsService } from "../../services/specificationService";
import { SpecificationSummary } from "../../types/SpecificationSummary";

export type SpecificationSummaryQueryResult = {
  specificationHasCalculationResults: boolean;
  isLoadingSpecificationResults: boolean;
};

export const useSpecificationResults = (
  specificationId: string,
  fundingStreamId: string,
  fundingPeriodId: string,
  onError: (err: AxiosError) => void,
  onSuccess?: (data: SpecificationSummary[]) => void
): SpecificationSummaryQueryResult => {
  const { data, isLoading } = useQuery<SpecificationSummary[], AxiosError>(
    `specificationResults-${fundingStreamId}-${fundingPeriodId}`,
    async () =>
      (await getSpecificationsByFundingPeriodAndStreamIdWithResultsService(fundingStreamId, fundingPeriodId))
        .data,
    {
      onError: onError,
      onSuccess: onSuccess,
      refetchOnWindowFocus: false,
      enabled: fundingStreamId !== "" && fundingPeriodId !== "" && specificationId !== "",
    }
  );

  return {
    specificationHasCalculationResults: !!data?.filter((d) => d.id === specificationId)?.length,
    isLoadingSpecificationResults: isLoading,
  };
};
