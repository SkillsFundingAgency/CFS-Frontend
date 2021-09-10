import { FeatureFlagsState } from "./FeatureFlagsState";
import { IUserState } from "./IUserState";
import { ViewSpecificationResultsState } from "./ViewSpecificationResultsState";

export interface AppState {
  user: IUserState;
  viewSpecificationResults: ViewSpecificationResultsState;
  featureFlags: FeatureFlagsState;
}
