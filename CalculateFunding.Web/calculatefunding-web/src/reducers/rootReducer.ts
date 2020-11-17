import {IUserState} from "../states/IUserState";
import {IFundingLineStructureState} from "../states/IFundingLineStructureState";
import {ViewSpecificationResultsState} from "../states/ViewSpecificationResultsState";
import {combineReducers, Reducer} from "redux";
import {reduceUserState} from "./userReducer";
import {reduceFundingLineStructureState} from "./fundingLineStructureReducer";
import {reduceViewSpecificationResultsState} from "./viewSpecificationResultsReducer";
import {reduceSelectSpecificationState} from "./selectSpecificationReducer";
import {SelectSpecificationState} from "../states/SelectSpecificationState";
import {reduceDatasetState} from "./datasetReducer";
import {DatasetState} from "../states/DatasetState";
import {FeatureFlagsState} from "../states/FeatureFlagsState";
import {reduceFeatureFlagsState} from "./featureFlagsReducer";
import {FundingLineStructureAction} from "../actions/FundingLineStructureAction";
import {ViewSpecificationResultsActions} from "../actions/ViewSpecificationResultsActions";
import {SelectSpecificationActions} from "../actions/SelectSpecificationActions";
import {DatasetActions} from "../actions/DatasetActions";
import {GetFeatureFlagsAction} from "../actions/FeatureFlagsActions";
import {IUserActions} from "../actions/userAction";
import {FundingSearchSelectionState} from "../states/FundingSearchSelectionState";
import {IFundingSearchSelectionActions} from "../actions/FundingSearchSelectionActions";
import {reduceFundingSearchSelectionState} from "./fundingSearchSelectionReducer";

export interface IStoreState {
    userState: IUserState,
    fundingLineStructureState: IFundingLineStructureState,
    viewSpecificationResults: ViewSpecificationResultsState,
    selectSpecification: SelectSpecificationState,
    datasets: DatasetState,
    fundingSearchSelection: FundingSearchSelectionState,
    featureFlags: FeatureFlagsState
}

export type Actions =
    IUserActions |
    FundingLineStructureAction |
    ViewSpecificationResultsActions |
    SelectSpecificationActions |
    DatasetActions |
    IFundingSearchSelectionActions |
    GetFeatureFlagsAction;

export const rootReducer: Reducer<IStoreState, Actions> =
    combineReducers({
        userState: reduceUserState,
        fundingLineStructureState: reduceFundingLineStructureState,
        viewSpecificationResults: reduceViewSpecificationResultsState,
        selectSpecification: reduceSelectSpecificationState,
        datasets: reduceDatasetState,
        fundingSearchSelection: reduceFundingSearchSelectionState,
        featureFlags: reduceFeatureFlagsState
    });

export type AppState = ReturnType<typeof rootReducer>