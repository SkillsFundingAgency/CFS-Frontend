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
import {JobObserverState} from '../states/JobObserverState';
import {IJobObserverActions} from '../actions/jobObserverActions';
import {reduceJobObserverState} from './jobObserverReducer';

export interface IStoreState {
    userState: IUserState,
    jobObserverState: JobObserverState,
    fundingSearchSelection: FundingSearchSelectionState,
    featureFlags: FeatureFlagsState
}

export type Actions =
    IUserActions |
    IJobObserverActions |
    IFundingSearchSelectionActions |
    GetFeatureFlagsAction;

export const rootReducer: Reducer<IStoreState, Actions> =
    combineReducers({
        userState: reduceUserState,
        jobObserverState: reduceJobObserverState,
        fundingSearchSelection: reduceFundingSearchSelectionState,
        featureFlags: reduceFeatureFlagsState
    });

export type AppState = ReturnType<typeof rootReducer>