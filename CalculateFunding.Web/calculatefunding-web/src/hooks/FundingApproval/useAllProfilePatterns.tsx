import { AxiosError } from "axios";
import { useQuery } from "react-query";
import { getAllProfilePatterns } from "services/profilingService";
import { FundingStreamPeriodProfilePattern } from "types/ProviderProfileTotalsForStreamAndPeriod";

export type AllProfilePatternsQueryResult = {
  profilePatterns: FundingStreamPeriodProfilePattern[] | undefined;
  isLoadingProfilePatterns: boolean;
};
export const useAllProfilePatterns = (
  fundingStreamId: string,
  fundingPeriodId: string,
  onError: (err: AxiosError) => void
): AllProfilePatternsQueryResult => {
  const { data, isLoading } = useQuery<FundingStreamPeriodProfilePattern[], AxiosError>(
    `profile-patterns-${fundingStreamId}-${fundingPeriodId}`,
    async () => (await getAllProfilePatterns(fundingStreamId as string, fundingPeriodId as string)).data,
    {
      onError,
    }
  );
  return {
    profilePatterns: data,
    isLoadingProfilePatterns: isLoading,
  };
};
