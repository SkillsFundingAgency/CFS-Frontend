import * as specHook from "../../hooks/useSpecificationSummary";
import { SpecificationSummaryQueryResult } from "../../hooks/useSpecificationSummary";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { fakery } from "../fakes/fakery";

const specResult = (
  spec?: SpecificationSummary,
  overrides: Partial<SpecificationSummaryQueryResult> = {}
): SpecificationSummaryQueryResult => {
  return {
    clearSpecificationFromCache: () => Promise.resolve(),
    specification: spec ?? fakery.makeSpecificationSummary(),
    isLoadingSpecification: false,
    errorCheckingForSpecification: null,
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: true,
    ...overrides,
  };
};

const spy: jest.SpyInstance = jest.spyOn(specHook, "useSpecificationSummary");

const hasSpecificationResult = (result?: SpecificationSummaryQueryResult) =>
  spy.mockImplementation(() => result ?? specResult());

const hasSpecification = (spec?: SpecificationSummary) =>
  spy.mockImplementation(() => (spec ? specResult(spec) : specResult()));

export const useSpecificationSummaryUtils = {
  spy,
  hasSpecification,
  hasSpecificationResult,
};
