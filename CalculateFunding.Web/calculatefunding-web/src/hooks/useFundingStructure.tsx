import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { getFundingLineStructureService } from "../services/fundingStructuresService";
import { FundingStructureItemViewModel } from "../types/FundingStructureItem";

export interface GetFundingStructureQueryResult {
  fundingStructure: FundingStructureItemViewModel[] | undefined;
  isLoadingFundingStructure: boolean;
  refetchFundingStructure: () => void;
}

export const useFundingStructure = ({
  specificationId,
  fundingStreamId,
  fundingPeriodId,
  options = {},
}: {
  fundingStreamId: string | undefined;
  specificationId: string | undefined;
  fundingPeriodId: string | undefined;
  options?: Partial<UseQueryOptions<FundingStructureItemViewModel[], AxiosError>>;
}): GetFundingStructureQueryResult => {
  const { data, isLoading, refetch } = useQuery<FundingStructureItemViewModel[], AxiosError>(
    ["funding-structure", specificationId, fundingStreamId, fundingPeriodId],
    async () =>
      (
        await getFundingLineStructureService(
          specificationId as string,
          fundingPeriodId as string,
          fundingStreamId as string
        )
      ).data,
    {
      enabled: !!specificationId?.length && !!fundingStreamId?.length && !!fundingPeriodId?.length,
      ...options,
    }
  );

  return {
    fundingStructure: data,
    isLoadingFundingStructure: isLoading,
    refetchFundingStructure: refetch,
  };
};
