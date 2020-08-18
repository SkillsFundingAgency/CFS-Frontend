import {IUserState} from "../states/IUserState";
import {IFundingLineStructureState} from "../states/IFundingLineStructureState";
import {IViewFundingState} from "../states/IViewFundingState";
import {ViewSpecificationResultsState} from "../states/ViewSpecificationResultsState";
import {ViewSpecificationState} from "../states/ViewSpecificationState";
import {ViewCalculationState} from "../states/ViewCalculationState";
import {combineReducers, Reducer} from "redux";
import {reduceUserState} from "./userReducer";
import {reduceFundingLineStructureState} from "./fundingLineStructureReducer";
import {reduceViewSpecificationState} from "./viewSpecificationReducer";
import {reduceViewFundingState} from "./viewFundingReducer";
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
import {ViewFundingAction} from "../actions/viewFundingAction";
import {ViewSpecificationResultsActions} from "../actions/ViewSpecificationResultsActions";
import {SelectSpecificationActions} from "../actions/SelectSpecificationActions";
import {ViewCalculationResultsActions} from "../actions/ViewCalculationResultsActions";
import {ProviderActions} from "../actions/ProviderActions";
import {GetAllSpecifications} from "../actions/SpecificationActions";
import {GetDataSchemaAction} from "../actions/DatasetActions";
import {GetFeatureFlagsAction} from "../actions/FeatureFlagsActions";
import {ViewSpecificationsActions} from "../actions/ViewSpecificationsActions";
import {
    ICreateAccountAction,
    IFundingStreamPermissionsAction,
    IHasUserConfirmedSkillsAction,
    IUpdateUserConfirmedSkillsAction
} from "../actions/userAction";

export interface IStoreState {
    userState: IUserState,
    fundingLineStructureState: IFundingLineStructureState,
    viewFundingState: IViewFundingState,
    viewSpecificationResults: ViewSpecificationResultsState,
    viewSpecification: ViewSpecificationState,
    viewCalculationResults: ViewCalculationState
    selectSpecification: SelectSpecificationState,
    provider: ProviderState,
    datasets: DatasetState,
    featureFlags: FeatureFlagsState
}

export type Actions = 
    ICreateAccountAction |
    IHasUserConfirmedSkillsAction |
    IUpdateUserConfirmedSkillsAction |
    IFundingStreamPermissionsAction |
    FundingLineStructureAction |
    ViewFundingAction |
    ViewSpecificationResultsActions |
    ViewSpecificationsActions |
    SelectSpecificationActions |
    ViewCalculationResultsActions |
    ProviderActions |
    GetAllSpecifications |
    GetDataSchemaAction |
    GetFeatureFlagsAction;

export const rootReducer: Reducer<IStoreState, Actions> =
    combineReducers({
        userState: reduceUserState,
        fundingLineStructureState: reduceFundingLineStructureState,
        viewFundingState: reduceViewFundingState,
        viewSpecificationResults: reduceViewSpecificationResultsState,
        viewSpecification: reduceViewSpecificationState,
        selectSpecification: reduceSelectSpecificationState,
        viewCalculationResults: reduceCalculationResultsState,
        provider: reduceProvider,
        datasets: reduceDatasetState,
        featureFlags: reduceFeatureFlagsState
    });

export type AppState = ReturnType<typeof rootReducer>