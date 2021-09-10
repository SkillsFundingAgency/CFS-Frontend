import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { getPublishedProviderErrors } from "../../services/publishedProviderService";

export type PublishedProviderErrorSearchQueryResult = {
  publishedProvidersWithErrors: string[] | undefined;
  isLoadingPublishedProviderErrors: boolean;
  isErrorLoadingPublishedProviderErrors: boolean;
  errorLoadingPublishedProviderErrors: string;
};
export const usePublishedProviderErrorSearch = (
  specificationId: string,
  isEnabled: boolean,
  onError: (err: AxiosError) => void
): PublishedProviderErrorSearchQueryResult => {
  const { data, isLoading, isError, error } = useQuery<string[], AxiosError>(
    `published-provider-errors-for-spec-${specificationId}`,
    async () => (await getPublishedProviderErrors(specificationId)).data,
    {
      onError,
      enabled: (specificationId && specificationId.length > 0 && isEnabled) === true,
    }
  );
  return {
    publishedProvidersWithErrors: data,
    isLoadingPublishedProviderErrors: isLoading,
    isErrorLoadingPublishedProviderErrors: isError,
    errorLoadingPublishedProviderErrors: !isError
      ? ""
      : error
      ? `Error while searching for published provider errors: ${error.message}`
      : "Unknown error while searching for published provider errors",
  };
};
