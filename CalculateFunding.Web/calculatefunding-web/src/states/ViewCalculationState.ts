import {CalculationSearchResponse} from "../types/CalculationSearchResponse";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {CalculationProviderResultList} from "../types/CalculationProviderResult";
import {CalculationDetails} from "../types/CalculationDetails";

export interface ViewCalculationState {
    specification: SpecificationSummary;
    providers: CalculationProviderResultList;
    calculation: CalculationDetails

}