import { combineReducers, Reducer } from "redux";

import { GetFeatureFlagsAction } from "../actions/FeatureFlagsActions";
import { IFundingSearchSelectionActions } from "../actions/FundingSearchSelectionActions";
import { IJobObserverActions } from "../actions/jobObserverActions";
import { IUserActions } from "../actions/userAction";
import { FeatureFlagsState } from "../states/FeatureFlagsState";
import { FundingSearchSelectionState } from "../states/FundingSearchSelectionState";
import { IUserState } from "../states/IUserState";
import { JobObserverState } from "../states/JobObserverState";
import { reduceFeatureFlagsState } from "./featureFlagsReducer";
import { reduceFundingSearchSelectionState } from "./fundingSearchSelectionReducer";
import { reduceJobObserverState } from "./jobObserverReducer";
import { reduceUserState } from "./userReducer";

export interface IStoreState {
  userState: IUserState;
  jobObserverState: JobObserverState;
  fundingSearchSelection: FundingSearchSelectionState;
  featureFlags: FeatureFlagsState;
}

export type Actions =
  | IUserActions
  | IJobObserverActions
  | IFundingSearchSelectionActions
  | GetFeatureFlagsAction;

export const rootReducer: Reducer<IStoreState, Actions> = combineReducers({
  userState: reduceUserState,
  jobObserverState: reduceJobObserverState,
  fundingSearchSelection: reduceFundingSearchSelectionState,
  featureFlags: reduceFeatureFlagsState,
});

export type AppState = ReturnType<typeof rootReducer>;
