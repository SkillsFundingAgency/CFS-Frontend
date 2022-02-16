import * as fundingStructureHook from "../../hooks/useFundingStructure";
import { GetFundingStructureQueryResult } from "../../hooks/useFundingStructure";
import { FundingStructureItemViewModel } from "../../types/FundingStructureItem";

const createGetFundingStructureQueryResult = (
  FundingStructure: FundingStructureItemViewModel[]
): GetFundingStructureQueryResult => {
  return {
    fundingStructure: FundingStructure,
    isLoadingFundingStructure: false,
    refetchFundingStructure: jest.fn(),
  };
};

const spy: jest.SpyInstance = jest.spyOn(fundingStructureHook, "useFundingStructure");

const hasFundingStructure = (fundingStructure: FundingStructureItemViewModel[]) =>
  spy.mockImplementation(() => createGetFundingStructureQueryResult(fundingStructure));

const hasNoFundingStructure = () => hasFundingStructure([]);

export const useGetFundingStructureUtils = {
  spy,
  hasNoFundingStructure,
  hasFundingStructure,
};
