import * as findSpecsSelectedForFundingHook from "../../hooks/Specifications/useSpecsSelectedForFunding";
import { SpecsSelectedForFundingResult } from "../../hooks/Specifications/useSpecsSelectedForFunding";
import { Specification } from "../../types/viewFundingTypes";

const createSpecsSelectedForFundingQueryResult = (specs: Specification[]): SpecsSelectedForFundingResult => {
  return {
    specsSelectedForFunding: specs,
    isLoadingSpecsSelectedForFunding: false,
  };
};

const spy: jest.SpyInstance = jest.spyOn(findSpecsSelectedForFundingHook, "useSpecsSelectedForFunding");

const hasSpecsSelectedForFunding = (specsSelectedForFunding: Specification[]) =>
  spy.mockImplementation(() => createSpecsSelectedForFundingQueryResult(specsSelectedForFunding));

const hasNoSpecsSelectedForFunding = () => hasSpecsSelectedForFunding([]);

export const useSpecsSelectedForFundingUtils = {
  spy,
  hasNoSpecsSelectedForFunding,
  hasSpecsSelectedForFunding,
};
