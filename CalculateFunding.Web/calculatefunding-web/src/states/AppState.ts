import {IFundingLineStructureState} from "./IFundingLineStructureState";
import {ViewSpecificationResultsState} from "./ViewSpecificationResultsState";
import {ViewSpecificationState} from "./ViewSpecificationState";
import {ViewCalculationState} from "./ViewCalculationState";
import {SelectSpecificationState} from "./SelectSpecificationState";
import {ProviderState} from "./ProviderState";
import {SpecificationState} from "./SpecificationState";
import {DatasetState} from "./DatasetState";
import {FeatureFlagsState} from "./FeatureFlagsState";
import {IUserState} from "./IUserState";

export interface AppState {
    selectSpecification: SelectSpecificationState,
    user: IUserState,
    fundingLineStructure: IFundingLineStructureState
    viewSpecificationResults: ViewSpecificationResultsState,
    viewSpecification: ViewSpecificationState,
    viewCalculationResults: ViewCalculationState,
    provider: ProviderState,
    specifications: SpecificationState,
    datasets: DatasetState,
    featureFlags: FeatureFlagsState
}
