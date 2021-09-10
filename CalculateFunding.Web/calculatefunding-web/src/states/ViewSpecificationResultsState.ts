import { CalculationSearchResponse } from "../types/CalculationSearchResponse";
import { SpecificationSummary } from "../types/SpecificationSummary";

export interface ViewSpecificationResultsState {
  specification: SpecificationSummary;
  additionalCalculations: CalculationSearchResponse;
  templateCalculations: CalculationSearchResponse;
}
