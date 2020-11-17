import {ActionCreator} from "redux";
import {ThunkAction} from "redux-thunk";
import {FundingSearchSelectionState} from "../states/FundingSearchSelectionState";
import {buildInitialPublishedProviderSearchRequest, PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";

export enum FundingSearchSelectionActionEvent {
    INITIALISE = 'initialise',
    UPDATE_SEARCH = 'updateSearch',
    ADD_PROVIDERS = 'addProvidersToFundingSelection',
    REMOVE_PROVIDERS = 'removeProvidersToFundingSelection'
}

export type IFundingSearchSelectionActions =
    IInitialiseFundingSearchSelectionAction |
    IUpdateFundingSearchAction |
    IAddProvidersToFundingSelectionAction |
    IRemoveProvidersFromFundingSelectionAction;

export interface IInitialiseFundingSearchSelectionAction {
    type: FundingSearchSelectionActionEvent.INITIALISE;
    payload: PublishedProviderSearchRequest
}
export interface IUpdateFundingSearchAction {
    type: FundingSearchSelectionActionEvent.UPDATE_SEARCH;
    payload: PublishedProviderSearchRequest
}
export interface IAddProvidersToFundingSelectionAction {
    type: FundingSearchSelectionActionEvent.ADD_PROVIDERS;
    payload: string[]
}
export interface IRemoveProvidersFromFundingSelectionAction {
    type: FundingSearchSelectionActionEvent.REMOVE_PROVIDERS;
    payload: string[]
}

export const initialiseFundingSearchSelection: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IInitialiseFundingSearchSelectionAction>> = 
    (fundingStreamId: string,
     fundingPeriodId: string,
     specificationId: string) => {
    return async (dispatch) => {
        dispatch({
            type: FundingSearchSelectionActionEvent.INITIALISE,
            payload: buildInitialPublishedProviderSearchRequest(fundingStreamId, fundingPeriodId, specificationId),
        });
    }
};

export const updateFundingSearch: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateFundingSearchAction>> = 
    (searchCriteria: PublishedProviderSearchRequest) => {
    return async (dispatch) => {
        dispatch({
            type: FundingSearchSelectionActionEvent.UPDATE_SEARCH,
            payload: searchCriteria
        });
    }
};

export const addProvidersToFundingSelection: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IAddProvidersToFundingSelectionAction>> = 
    (providerVersionIds: string[]) => {
    return async (dispatch) => {
        dispatch({
            type: FundingSearchSelectionActionEvent.ADD_PROVIDERS,
            payload: providerVersionIds
        });
    }
};
export const removeProvidersFromFundingSelection: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IRemoveProvidersFromFundingSelectionAction>> = 
    (providerVersionIds: string[]) => {
    return async (dispatch) => {
        dispatch({
            type: FundingSearchSelectionActionEvent.REMOVE_PROVIDERS,
            payload: providerVersionIds
        });
    }
};