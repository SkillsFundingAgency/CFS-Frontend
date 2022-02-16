import { CalculationSummaryBySpecificationQueryResult } from "../../hooks/Calculations/useCalculationSummariesBySpecification";
import * as calculationSummariesBySpecificationHock from "../../hooks/Calculations/useCalculationSummariesBySpecification";
import { CalculationSummary } from "../../types/CalculationDetails";

const createCalculationSummariesBySpecQueryResult = (
  specs: CalculationSummary[]
): CalculationSummaryBySpecificationQueryResult => {
  return {
    calculationSummaries: specs,
    isLoadingCalculationSummaries: false,
  };
};

const spy: jest.SpyInstance = jest.spyOn(
  calculationSummariesBySpecificationHock,
  "useCalculationSummariesBySpecification"
);

const hasCalculations = (calculations: CalculationSummary[]) =>
  spy.mockImplementation(() => createCalculationSummariesBySpecQueryResult(calculations));

const hasNoCalculations = () => hasCalculations([]);

export const useCalculationSummariesBySpecificationUtils = {
  spy,
  hasNoCalculations,
  hasCalculations,
};
