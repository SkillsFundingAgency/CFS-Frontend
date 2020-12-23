import {IUserState} from "../states/IUserState";
import {combineReducers, Reducer} from "redux";
import {reduceUserState} from "./userReducer";
import {FeatureFlagsState} from "../states/FeatureFlagsState";
import {reduceFeatureFlagsState} from "./featureFlagsReducer";
import {GetFeatureFlagsAction} from "../actions/FeatureFlagsActions";
import {IUserActions} from "../actions/userAction";
import {FundingSearchSelectionState} from "../states/FundingSearchSelectionState";
import {IFundingSearchSelectionActions} from "../actions/FundingSearchSelectionActions";
import {reduceFundingSearchSelectionState} from "./fundingSearchSelectionReducer";

export interface IStoreState {
    userState: IUserState,
    fundingSearchSelection: FundingSearchSelectionState,
    featureFlags: FeatureFlagsState
}

export type Actions =
    IUserActions |
    IFundingSearchSelectionActions |
    GetFeatureFlagsAction;

export const rootReducer: Reducer<IStoreState, Actions> =
    combineReducers({
        userState: reduceUserState,
        fundingSearchSelection: reduceFundingSearchSelectionState,
        featureFlags: reduceFeatureFlagsState
    });

export type AppState = ReturnType<typeof rootReducer>