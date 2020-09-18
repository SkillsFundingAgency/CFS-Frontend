import {IUserState} from "../states/IUserState";
import {IFundingLineStructureState} from "../states/IFundingLineStructureState";
import {ViewSpecificationResultsState} from "../states/ViewSpecificationResultsState";
import {ViewSpecificationState} from "../states/ViewSpecificationState";
import {ViewCalculationState} from "../states/ViewCalculationState";
import {combineReducers, Reducer} from "redux";
import {reduceUserState} from "./userReducer";
import {reduceFundingLineStructureState} from "./fundingLineStructureReducer";
import {reduceViewSpecificationState} from "./viewSpecificationReducer";
import {reduceViewSpecificationResultsState} from "./viewSpecificationResultsReducer";
import {reduceSelectSpecificationState} from "./selectSpecificationReducer";
import {SelectSpecificationState} from "../states/SelectSpecificationState";
import {reduceCalculationResultsState} from "./viewCalculationResultsReducer";
import {ProviderState} from "../states/ProviderState";
import {reduceProvider} from "./providerReducer";
import {reduceDatasetState} from "./datasetReducer";
import {DatasetState} from "../states/DatasetState";
import {FeatureFlagsState} from "../states/FeatureFlagsState";
import {reduceFeatureFlagsState} from "./featureFlagsReducer";
import {FundingLineStructureAction} from "../actions/FundingLineStructureAction";
import {ViewSpecificationResultsActions} from "../actions/ViewSpecificationResultsActions";
import {SelectSpecificationActions} from "../actions/SelectSpecificationActions";
import {ViewCalculationResultsActions} from "../actions/ViewCalculationResultsActions";
import {ProviderActions} from "../actions/ProviderActions";
import {SpecificationActions} from "../actions/SpecificationActions";
import {DatasetActions} from "../actions/DatasetActions";
import {GetFeatureFlagsAction} from "../actions/FeatureFlagsActions";
import {ViewSpecificationsActions} from "../actions/ViewSpecificationsActions";
import {IUserActions} from "../actions/userAction";
import {IFundingSelectionState} from "../states/IFundingSelectionState";
import {reduceFundingSelectionState} from "./fundingSelectionReducer";
import {IFundingSelectionActions} from "../actions/FundingSelectionActions";

export interface IStoreState {
    userState: IUserState,
    fundingLineStructureState: IFundingLineStructureState,
    viewSpecificationResults: ViewSpecificationResultsState,
    viewSpecification: ViewSpecificationState,
    viewCalculationResults: ViewCalculationState
    selectSpecification: SelectSpecificationState,
    provider: ProviderState,
    datasets: DatasetState,
    fundingSelection: IFundingSelectionState,
    featureFlags: FeatureFlagsState
}

export type Actions =
    IFundingSelectionActions |
    IUserActions |
    FundingLineStructureAction |
    ViewSpecificationResultsActions |
    ViewSpecificationsActions |
    SelectSpecificationActions |
    ViewCalculationResultsActions |
    ProviderActions |
    SpecificationActions |
    DatasetActions |
    GetFeatureFlagsAction;

export const rootReducer: Reducer<IStoreState, Actions> =
    combineReducers({
        userState: reduceUserState,
        fundingLineStructureState: reduceFundingLineStructureState,
        viewSpecificationResults: reduceViewSpecificationResultsState,
        viewSpecification: reduceViewSpecificationState,
        selectSpecification: reduceSelectSpecificationState,
        viewCalculationResults: reduceCalculationResultsState,
        provider: reduceProvider,
        datasets: reduceDatasetState,
        fundingSelection: reduceFundingSelectionState,
        featureFlags: reduceFeatureFlagsState
    });

export type AppState = ReturnType<typeof rootReducer>