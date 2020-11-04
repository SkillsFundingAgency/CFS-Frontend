import {IFundingLineStructureState} from "./IFundingLineStructureState";
import {ViewSpecificationResultsState} from "./ViewSpecificationResultsState";
import {ViewCalculationState} from "./ViewCalculationState";
import {SelectSpecificationState} from "./SelectSpecificationState";
import {SpecificationState} from "./SpecificationState";
import {DatasetState} from "./DatasetState";
import {FeatureFlagsState} from "./FeatureFlagsState";
import {IUserState} from "./IUserState";

export interface AppState {
    selectSpecification: SelectSpecificationState,
    user: IUserState,
    fundingLineStructure: IFundingLineStructureState
    viewSpecificationResults: ViewSpecificationResultsState,
    viewCalculationResults: ViewCalculationState,
    specifications: SpecificationState,
    datasets: DatasetState,
    featureFlags: FeatureFlagsState
}
