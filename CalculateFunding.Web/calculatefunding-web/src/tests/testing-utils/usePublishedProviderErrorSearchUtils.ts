import { PublishedProviderErrorSearchQueryResult } from "../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import * as providerErrorsHook from "../../hooks/FundingApproval/usePublishedProviderErrorSearch";

const createPublishedProviderErrorSearchQueryResult = (
  errors: string[]
): PublishedProviderErrorSearchQueryResult => {
  return {
    publishedProvidersWithErrors: errors,
    isLoadingPublishedProviderErrors: false,
    isErrorLoadingPublishedProviderErrors: false,
    errorLoadingPublishedProviderErrors: "",
  };
};

const hasProvidersWithErrors = (errors: string[]) =>
  jest
    .spyOn(providerErrorsHook, "usePublishedProviderErrorSearch")
    .mockImplementation(() => createPublishedProviderErrorSearchQueryResult(errors));

const hasProvidersWithoutErrors = () => hasProvidersWithErrors([]);

export const usePublishedProviderErrorSearchUtils = {
  createPublishedProviderErrorSearchQueryResult,
  hasProvidersWithErrors,
  hasProvidersWithoutErrors,
};
