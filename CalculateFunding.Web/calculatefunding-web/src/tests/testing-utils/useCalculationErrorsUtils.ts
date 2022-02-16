import * as calculationErrorsHook from "../../hooks/Calculations/useCalculationErrors";
import { CalculationError, CalculationErrorQueryResult } from "../../types/Calculations/CalculationError";

const createGetCalculationErrorsQueryResult = (
  calculationErrors: CalculationError[]
): CalculationErrorQueryResult => {
  return {
    calculationErrors: calculationErrors,
    isLoadingCalculationErrors: false,
    areCalculationErrorsFetched: true,
    calculationErrorCount: calculationErrors?.length,
    clearCalculationErrorsFromCache: jest.fn(),
    errorCheckingForCalculationErrors: null,
    haveErrorCheckingForCalculationErrors: false,
    isFetchingCalculationErrors: false,
  };
};

const spy: jest.SpyInstance = jest.spyOn(calculationErrorsHook, "useCalculationErrors");

const hasCalculationErrors = (calculationErrors: CalculationError[]) =>
  spy.mockImplementation(() => createGetCalculationErrorsQueryResult(calculationErrors));

const hasNoCalculationErrors = () => hasCalculationErrors([]);

export const useGetCalculationErrorsUtils = {
  spy,
  hasNoCalculationErrors,
  hasCalculationErrors,
};
