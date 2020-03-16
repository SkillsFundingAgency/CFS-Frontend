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

export interface IStoreState {
    viewFundingState: IViewFundingState,
    userState: IUserState,
    fundingLineStructureState: IFundingLineStructureState,
    viewSpecificationResults: ViewSpecificationResultsState,
    viewSpecification: ViewSpecificationState,
    viewCalculationResults: ViewCalculationState
    selectSpecification: SelectSpecificationState,
    provider: ProviderState,
    specifications: SpecificationState,
    datasets: DatasetState
}



export const rootReducer: Reducer<IStoreState> = combineReducers({
    userState: reduceUserState,
    fundingLineStructureState: reduceFundingLineStructureState,
    viewFundingState: reduceViewFundingState,
    viewSpecificationResults: reduceViewSpecificationResultsState,
    viewSpecification: reduceViewSpecificationState,
    selectSpecification: reduceSelectSpecificationState,
    viewCalculationResults: reduceCalculationResultsState,
    provider: reduceProvider,
    specifications: reduceSpecificationState,
    datasets: reduceDatasetState
});

export type AppState = ReturnType<typeof rootReducer>