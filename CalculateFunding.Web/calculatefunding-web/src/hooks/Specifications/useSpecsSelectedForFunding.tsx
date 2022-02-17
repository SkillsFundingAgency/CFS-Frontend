import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import * as specificationService from "../../services/specificationService";
import { Specification } from "../../types/viewFundingTypes";

export interface SpecsSelectedForFundingResult {
  specsSelectedForFunding: Specification[] | undefined;
  isLoadingSpecsSelectedForFunding: boolean;
}

export const useSpecsSelectedForFunding = (
  fundingPeriodId: string | undefined,
  fundingStreamId: string | undefined,
  options: Omit<UseQueryOptions<Specification[], AxiosError>, "queryFn"> = {}
): SpecsSelectedForFundingResult => {
  const { data, isLoading } = useQuery<Specification[], AxiosError>(
    ["specs-selected-for-funding", fundingStreamId, fundingPeriodId],
    async () =>
      (
        await specificationService.getSpecificationsSelectedForFundingByPeriodAndStreamService(
          fundingPeriodId as string,
          fundingStreamId as string
        )
      ).data,
    {
      enabled: !!fundingStreamId?.length && !!fundingPeriodId?.length,
      ...options,
    }
  );

  return {
    specsSelectedForFunding: data,
    isLoadingSpecsSelectedForFunding: isLoading,
  } as SpecsSelectedForFundingResult;
};
