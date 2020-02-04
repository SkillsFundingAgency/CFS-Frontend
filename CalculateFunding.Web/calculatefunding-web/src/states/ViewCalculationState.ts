import {Calculation, CalculationSummary} from "../types/CalculationSummary";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {CalculationProviderResultList} from "../types/CalculationProviderResult";

export interface ViewCalculationState {
    specification: SpecificationSummary;
    providers: CalculationProviderResultList;
    calculation: Calculation

}