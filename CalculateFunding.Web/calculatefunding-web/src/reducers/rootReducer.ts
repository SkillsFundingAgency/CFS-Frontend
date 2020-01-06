import {combineReducers, Reducer} from "redux";
import {reduceUserState} from "./userReducer";
import {IUserState} from "../states/IUserState";
import {IFundingLineStructureState} from "../states/IFundingLineStructureState";
import {reduceFundingLineStructureState} from "./fundingLineStructureReducer";
import {IViewFundingState} from "../states/IViewFundingState";
import {reduceViewFundingState} from "./viewFundingReducer";
import {reduceViewSpecificationState} from "./viewSpecificationReducer";
import {ViewSpecificationState} from "../states/ViewSpecificationState";

/*
 * This is the root state of the app
 * It contains every substate of the app
 */
export interface IStoreState {
    viewFundingState: IViewFundingState,
    userState: IUserState,
    fundingLineStructureState: IFundingLineStructureState,
    viewSpecification: ViewSpecificationState
}

/**
 * All combineReducers() does is generate a function that calls your reducers with the slices of state selected according to their keys,
 * and combining their results into a single object again. It's not magic.
 */
export const rootReducer: Reducer<IStoreState> = combineReducers({
    userState: reduceUserState,
    fundingLineStructureState: reduceFundingLineStructureState,
    viewFundingState: reduceViewFundingState,
    viewSpecification: reduceViewSpecificationState
});

export type AppState = ReturnType<typeof rootReducer>