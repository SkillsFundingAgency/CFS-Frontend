import * as calcProvidersSearchHook from "../../hooks/Calculations/useCalculationProviderSearch";
import { UseCalculationProviderSearchResult } from "../../hooks/Calculations/useCalculationProviderSearch";
import {
  CalculationProviderResult,
  CalculationProviderSearchResponse,
} from "../../types/CalculationProviderResult";
import { fakery } from "../fakes/fakery";

const createUseCalcProvidersSearchResponse = (
  hookResultOverrides: Partial<UseCalculationProviderSearchResult> = {},
  resultsOverrides: CalculationProviderResult[] = [],
  responseOverrides: Partial<CalculationProviderSearchResponse> = {}
): UseCalculationProviderSearchResult => {
  return {
    calculationProvidersData: fakery.makeCalcProviderSearchResponse(
      resultsOverrides?.length ? resultsOverrides : [fakery.makeCalcProviderSearchResult()],
      responseOverrides
    ),
    isLoadingCalculationProviders: false,
    refetchCalculationProviders: () => Promise.resolve(),
    ...hookResultOverrides,
  };
};

const spy: jest.SpyInstance = jest.spyOn(calcProvidersSearchHook, "useCalculationProviderSearch");

const hasCalculationProvidersResponse = (overrides?: Partial<UseCalculationProviderSearchResult>) =>
  spy.mockImplementation(() => createUseCalcProvidersSearchResponse(overrides));

export const useCalcProviderSearchUtils = {
  spy,
  hasCalculationProvidersResponse,
  createUseCalcProvidersSearchResponse,
};
