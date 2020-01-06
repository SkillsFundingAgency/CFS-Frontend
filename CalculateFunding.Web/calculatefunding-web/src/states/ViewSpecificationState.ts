import {CalculationSummary} from "../types/CalculationSummary";
import {SpecificationSummary} from "../types/SpecificationSummary";

export interface ViewSpecificationState {
    specification: SpecificationSummary,
    additionalCalculations: CalculationSummary,
    templateCalculations: CalculationSummary
}