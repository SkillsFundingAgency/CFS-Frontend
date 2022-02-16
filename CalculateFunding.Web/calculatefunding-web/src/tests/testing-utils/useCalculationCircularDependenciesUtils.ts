import * as calculationCircularDependenciesHook from "../../hooks/Calculations/useCalculationCircularDependencies";
import { CalculationCircularDependenciesQueryResult } from "../../hooks/Calculations/useCalculationCircularDependencies";
import { CircularReferenceError } from "../../types/Calculations/CircularReferenceError";

const createGetCalculationCircularDependenciesQueryResult = (
  circularDependencies: CircularReferenceError[]
): CalculationCircularDependenciesQueryResult => {
  return {
    circularReferenceErrors: circularDependencies,
    isLoadingCircularDependencies: false,
  };
};

const spy: jest.SpyInstance = jest.spyOn(
  calculationCircularDependenciesHook,
  "useCalculationCircularDependencies"
);

const hasCalculationCircularDependencies = (circularDependencies: CircularReferenceError[]) =>
  spy.mockImplementation(() => createGetCalculationCircularDependenciesQueryResult(circularDependencies));

const hasNoCalculationCircularDependencies = () => hasCalculationCircularDependencies([]);

export const useCalculationCircularDependenciesUtils = {
  spy,
  hasNoCalculationCircularDependencies,
  hasCalculationCircularDependencies,
};
