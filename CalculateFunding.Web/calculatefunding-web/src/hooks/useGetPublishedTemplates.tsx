import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import * as policyService from "../services/policyService";
import { PublishedFundingTemplate } from "../types/TemplateBuilderDefinitions";

export interface GetPublishedTemplatesQueryResult {
  publishedTemplates: PublishedFundingTemplate[] | undefined;
  isLoadingPublishedTemplates: boolean;
}

export const useGetPublishedTemplates = (
  fundingStreamId: string | undefined,
  fundingPeriodId: string | undefined,
  options: Partial<UseQueryOptions<PublishedFundingTemplate[], AxiosError>> = {}
): GetPublishedTemplatesQueryResult => {
  const { data, isLoading } = useQuery<PublishedFundingTemplate[], AxiosError>(
    `published-funding-templates-for-${fundingStreamId}-${fundingPeriodId}`,
    async () =>
      (
        await policyService.getPublishedTemplatesByStreamAndPeriod(
          fundingStreamId as string,
          fundingPeriodId as string
        )
      ).data,
    {
      enabled: !!fundingStreamId?.length && !!fundingPeriodId?.length,
      ...options,
    }
  );

  return {
    publishedTemplates: data,
    isLoadingPublishedTemplates: isLoading,
  };
};
