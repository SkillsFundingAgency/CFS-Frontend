import * as coreProvidersHook from "../../hooks/useGetCoreProviders";
import { GetCoreProvidersQueryResult } from "../../hooks/useGetCoreProviders";
import { CoreProviderSummary } from "../../types/CoreProviderSummary";

const createGetCoreProvidersQueryResult = (
  coreProviders: CoreProviderSummary[]
): GetCoreProvidersQueryResult => {
  return {
    coreProviders: coreProviders,
    isLoadingCoreProviders: false,
  };
};

const spy: jest.SpyInstance = jest.spyOn(coreProvidersHook, "useGetCoreProviders");

const hasCoreProviders = (coreProviders: CoreProviderSummary[]) =>
  spy.mockImplementation(() => createGetCoreProvidersQueryResult(coreProviders));

const hasNoCoreProviders = () => hasCoreProviders([]);

export const useGetCoreProvidersUtils = {
  spy,
  hasNoCoreProviders,
  hasCoreProviders,
};
