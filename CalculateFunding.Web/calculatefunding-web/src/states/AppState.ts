import {IFundingLineStructureState} from "./IFundingLineStructureState";
import {IViewFundingState} from "./IViewFundingState";
import {ViewSpecificationResultsState} from "./ViewSpecificationResultsState";
import {ViewSpecificationState} from "./ViewSpecificationState";
import {ViewCalculationState} from "./ViewCalculationState";
import {SelectSpecificationState} from "./SelectSpecificationState";

export interface AppState {
    selectSpecification: SelectSpecificationState;
    viewFunding: IViewFundingState;
    fundingLineStructure: IFundingLineStructureState
    viewSpecificationResults: ViewSpecificationResultsState;
    viewSpecification: ViewSpecificationState;
    viewCalculationResults: ViewCalculationState;
}
