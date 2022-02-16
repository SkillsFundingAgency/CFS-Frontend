import * as findSpecsWithResultsHook from "../../hooks/useFindSpecificationsWithResults";
import { FindSpecsWithResultsQueryResult } from "../../hooks/useFindSpecificationsWithResults";
import { SpecificationSummary } from "../../types/SpecificationSummary";

const createSpecsWithResultsQueryResult = (
  specs: SpecificationSummary[]
): FindSpecsWithResultsQueryResult => {
  return {
    specificationsWithResults: specs,
    isLoadingSpecificationsWithResults: false,
    hasFetchedSpecificationsWithResults: true,
  };
};

const spy: jest.SpyInstance = jest.spyOn(findSpecsWithResultsHook, "useFindSpecificationsWithResults");

const hasSpecsWithResults = (specsWithResults: SpecificationSummary[]) =>
  spy.mockImplementation(() => createSpecsWithResultsQueryResult(specsWithResults));

const hasNoSpecsWithResults = () => hasSpecsWithResults([]);

export const useFindSpecsWithResultsUtils = {
  spy,
  hasNoSpecsWithResults,
  hasSpecsWithResults,
};
