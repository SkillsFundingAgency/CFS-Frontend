import {IUserState} from "../states/IUserState";
import {ViewSpecificationResultsState} from "../states/ViewSpecificationResultsState";
import {combineReducers, Reducer} from "redux";
import {reduceUserState} from "./userReducer";
import {reduceViewSpecificationResultsState} from "./viewSpecificationResultsReducer";
import {FeatureFlagsState} from "../states/FeatureFlagsState";
import {reduceFeatureFlagsState} from "./featureFlagsReducer";
import {ViewSpecificationResultsActions} from "../actions/ViewSpecificationResultsActions";
import {GetFeatureFlagsAction} from "../actions/FeatureFlagsActions";
import {IUserActions} from "../actions/userAction";
import {FundingSearchSelectionState} from "../states/FundingSearchSelectionState";
import {IFundingSearchSelectionActions} from "../actions/FundingSearchSelectionActions";
import {reduceFundingSearchSelectionState} from "./fundingSearchSelectionReducer";

export interface IStoreState {
    userState: IUserState,
    viewSpecificationResults: ViewSpecificationResultsState,
    fundingSearchSelection: FundingSearchSelectionState,
    featureFlags: FeatureFlagsState
}

export type Actions =
    IUserActions |
    ViewSpecificationResultsActions |
    IFundingSearchSelectionActions |
    GetFeatureFlagsAction;

export const rootReducer: Reducer<IStoreState, Actions> =
    combineReducers({
        userState: reduceUserState,
        viewSpecificationResults: reduceViewSpecificationResultsState,
        fundingSearchSelection: reduceFundingSearchSelectionState,
        featureFlags: reduceFeatureFlagsState
    });

export type AppState = ReturnType<typeof rootReducer>