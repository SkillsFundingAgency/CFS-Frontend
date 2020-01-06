import {IFundingLineStructureState} from "./IFundingLineStructureState";
import {IViewFundingState} from "./IViewFundingState";
import {ViewSpecificationState} from "./ViewSpecificationState";

export interface AppState {
    viewFunding: IViewFundingState;
    fundingLineStructure: IFundingLineStructureState
    viewSpecification: ViewSpecificationState;
}
