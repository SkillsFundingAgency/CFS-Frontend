import {IFundingLineStructureState} from "./IFundingLineStructureState";
import {IViewFundingState} from "./IViewFundingState";
import {
    ViewSpecificationResultsState,
} from "./ViewSpecificationResultsState";
import {ViewSpecificationState} from "./ViewSpecificationState";

export interface AppState {
    viewFunding: IViewFundingState;
    fundingLineStructure: IFundingLineStructureState
    viewSpecificationResults: ViewSpecificationResultsState;
    viewSpecification: ViewSpecificationState;
}
