import {ActionCreator} from "redux";
import {ThunkAction} from "redux-thunk";
import {IFundingSelectionState} from "../states/IFundingSelectionState";

export enum FundingSelectionActionEvent {
    ADD_PROVIDERS = 'addProvidersToFundingSelection',
    REMOVE_PROVIDERS = 'removeProvidersToFundingSelection'
}

export type IFundingSelectionActions =
    IAddProvidersToFundingSelectionAction |
    IRemoveProvidersFromFundingSelectionAction;

export interface IAddProvidersToFundingSelectionAction {
    type: FundingSelectionActionEvent.ADD_PROVIDERS;
    payload: string[]
}
export interface IRemoveProvidersFromFundingSelectionAction {
    type: FundingSelectionActionEvent.REMOVE_PROVIDERS;
    payload: string[]
}

export const addProvidersToFundingSelection: ActionCreator<ThunkAction<Promise<any>, IFundingSelectionState, null, IAddProvidersToFundingSelectionAction>> = 
    (providerVersionIds: string[]) => {
    return async (dispatch) => {
        dispatch({
            type: FundingSelectionActionEvent.ADD_PROVIDERS,
            payload: providerVersionIds
        });
    }
};
export const removeProvidersFromFundingSelection: ActionCreator<ThunkAction<Promise<any>, IFundingSelectionState, null, IRemoveProvidersFromFundingSelectionAction>> = 
    (providerVersionIds: string[]) => {
    return async (dispatch) => {
        dispatch({
            type: FundingSelectionActionEvent.REMOVE_PROVIDERS,
            payload: providerVersionIds
        });
    }
};