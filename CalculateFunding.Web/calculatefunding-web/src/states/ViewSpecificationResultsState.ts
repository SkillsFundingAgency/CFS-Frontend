import {CalculationSummary} from "../types/CalculationSummary";
import {SpecificationSummary} from "../types/SpecificationSummary";

export interface ViewSpecificationResultsState {
    specification: SpecificationSummary,
    additionalCalculations: CalculationSummary,
    templateCalculations: CalculationSummary
}