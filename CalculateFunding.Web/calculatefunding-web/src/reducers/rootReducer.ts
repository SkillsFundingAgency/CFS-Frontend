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
import {reduceSpecificationState} from "./specificationReducer";
import {SpecificationState} from "../states/SpecificationState";
import {reduceDatasetState} from "./datasetReducer";
import {DatasetState} from "../states/DatasetState";
import {FeatureFlagsState} from "../states/FeatureFlagsState";
import {reduceFeatureFlagsState} from "./featureFlagsReducer";
import {IUserPermissionsState} from "../states/IUserPermissionsState";
import {reduceUserPermissionsState} from "./userPermissionsReducer";
import {ICreateAccountAction} from "../actions/userAction";
import { FundingLineStructureAction } from "../actions/FundingLineStructureAction";
import { ViewFundingAction } from "../actions/viewFundingAction";
import { ViewSpecificationResultsActions } from "../actions/ViewSpecificationResultsActions";
import { SelectSpecificationActions } from "../actions/SelectSpecificationActions";
import { ViewCalculationResultsActions } from "../actions/ViewCalculationResultsActions";
import { ProviderActions } from "../actions/ProviderActions";
import { GetAllSpecifications } from "../actions/SpecificationActions";
import { GetDataSchemaAction } from "../actions/DatasetActions";
import { GetFeatureFlagsAction } from "../actions/FeatureFlagsActions";
import { IFundingStreamPermissionsAction } from "../actions/UserPermissionsActions";
import {ITemplatesState} from "../states/ITemplatesState";

export interface IStoreState {
    userState: IUserState,
    userPermissions: IUserPermissionsState,
    templates: ITemplatesState,
    fundingLineStructureState: IFundingLineStructureState,
    viewFundingState: IViewFundingState,
    viewSpecificationResults: ViewSpecificationResultsState,
    viewSpecification: ViewSpecificationState,
    viewCalculationResults: ViewCalculationState
    selectSpecification: SelectSpecificationState,
    provider: ProviderState,
    specifications: SpecificationState,
    datasets: DatasetState,
    featureFlags: FeatureFlagsState
}

export type Actions = ICreateAccountAction | FundingLineStructureAction |
    ViewFundingAction | ViewSpecificationResultsActions | SelectSpecificationActions | ViewCalculationResultsActions |
    ProviderActions | GetAllSpecifications | GetDataSchemaAction | GetFeatureFlagsAction | IFundingStreamPermissionsAction;

export const rootReducer: Reducer<IStoreState, Actions> = combineReducers({
    userState: reduceUserState,
    userPermissions: reduceUserPermissionsState,
    fundingLineStructureState: reduceFundingLineStructureState,
    viewFundingState: reduceViewFundingState,
    viewSpecificationResults: reduceViewSpecificationResultsState,
    viewSpecification: reduceViewSpecificationState,
    selectSpecification: reduceSelectSpecificationState,
    viewCalculationResults: reduceCalculationResultsState,
    provider: reduceProvider,
    specifications: reduceSpecificationState,
    datasets: reduceDatasetState,
    featureFlags: reduceFeatureFlagsState,
});

export type AppState = ReturnType<typeof rootReducer>