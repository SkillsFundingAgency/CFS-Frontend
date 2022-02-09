import { AxiosError } from "axios";

import { SpecificationSummary } from "../../types/SpecificationSummary";
import { useFindSpecificationsWithResults } from "../useFindSpecificationsWithResults";

export type SpecificationSummaryQueryResult = {
  specificationHasCalculationResults: boolean;
  isLoadingSpecificationResults: boolean;
};

export const useSpecificationResults = (
  specificationId: string | undefined,
  fundingStreamId: string | undefined,
  fundingPeriodId: string | undefined,
  onError: (err: AxiosError) => void,
  onSuccess?: (data: SpecificationSummary[]) => void
): SpecificationSummaryQueryResult => {
  const { specificationsWithResults, isLoadingSpecificationsWithResults } = useFindSpecificationsWithResults(
    fundingStreamId,
    fundingPeriodId,
    {
      enabled: !!specificationId?.length && !!fundingStreamId?.length && !!fundingPeriodId?.length,
      onError: onError,
      onSuccess: onSuccess,
    }
  );

  return {
    specificationHasCalculationResults: !!specificationsWithResults?.filter((d) => d.id === specificationId)
      ?.length,
    isLoadingSpecificationResults: isLoadingSpecificationsWithResults,
  };
};
