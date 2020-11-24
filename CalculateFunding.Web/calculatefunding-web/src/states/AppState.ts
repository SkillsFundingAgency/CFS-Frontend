import {ViewSpecificationResultsState} from "./ViewSpecificationResultsState";
import {FeatureFlagsState} from "./FeatureFlagsState";
import {IUserState} from "./IUserState";

export interface AppState {
    user: IUserState,
    viewSpecificationResults: ViewSpecificationResultsState,
    featureFlags: FeatureFlagsState
}
