import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { publishedProviderService } from "../../services/publishedProviderService";
import { ReleaseFundingPublishedProvidersSummary } from "../../types/PublishedProvider/ReleaseFundingPublishedProvidersSummary";

export const useReleaseFundingSummaryData = (
  specificationId: string,
  channelCodes: string[],
  publishedProviderIds: string[],
  options: Partial<UseQueryOptions<ReleaseFundingPublishedProvidersSummary, AxiosError>> = {}
) => {
  const { data, isLoading, ...rest } = useQuery<ReleaseFundingPublishedProvidersSummary, AxiosError>(
    ["release-funding-channels-summary", { specificationId, channelCodes, publishedProviderIds }],
    async () =>
      (
        await publishedProviderService.getReleaseFundingChannelSummary(
          specificationId,
          channelCodes,
          publishedProviderIds
        )
      ).data,
    {
      enabled: specificationId?.length > 0 && channelCodes?.length > 0,
      ...options,
    }
  );

  return {
    releaseSummaryData: data,
    isLoadingReleaseSummaryData: isLoading,
    ...rest,
  };
};
