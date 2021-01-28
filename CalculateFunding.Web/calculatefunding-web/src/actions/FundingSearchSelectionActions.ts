import {ActionCreator} from "redux";
import {ThunkAction} from "redux-thunk";
import {FundingSearchSelectionState} from "../states/FundingSearchSelectionState";
import {buildInitialPublishedProviderSearchRequest, PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";

export enum FundingSearchSelectionActionEvent {
    INITIALISE = 'initialise',
    HAS_ERRORS = 'setHasErrors',
    UPDATE_PAGE = 'updatePage',
    ADD_PROVIDERS = 'addProvidersToFundingSelection',
    REMOVE_PROVIDERS = 'removeProvidersToFundingSelection',
    UPDATE_STATUS_FILTERS = 'updateStatusFilters',
    UPDATE_LOCAL_AUTHORITY_FILTERS = 'updateLocalAuthorityFilters',
    UPDATE_PROVIDER_TYPE_FILTERS = 'updateProviderTypeFilters',
    UPDATE_PROVIDER_SUB_TYPE_FILTERS = 'updateProviderSubTypeFilters',
    UPDATE_SEARCH_TEXT_FILTER = 'updateSearchTextFilter',
}

export type IFundingSearchSelectionActions =
    IInitialiseFundingSearchSelectionAction |
    IUpdatePage |
    ISetHasErrors |
    IAddProvidersToFundingSelectionAction |
    IUpdateProviderTypeFiltersAction |
    IUpdateStatusFiltersAction |
    IUpdateLocalAuthorityFiltersAction |
    IUpdateProviderSubTypeFiltersAction |
    IUpdateSearchTextFilterAction |
    IRemoveProvidersFromFundingSelectionAction;

export interface IInitialiseFundingSearchSelectionAction {
    type: FundingSearchSelectionActionEvent.INITIALISE;
    payload: PublishedProviderSearchRequest
}

export interface ISetHasErrors {
    type: FundingSearchSelectionActionEvent.HAS_ERRORS;
    payload: boolean
}

export interface IUpdatePage {
    type: FundingSearchSelectionActionEvent.UPDATE_PAGE;
    payload: number
}

export interface IAddProvidersToFundingSelectionAction {
    type: FundingSearchSelectionActionEvent.ADD_PROVIDERS;
    payload: string[]
}

export interface IRemoveProvidersFromFundingSelectionAction {
    type: FundingSearchSelectionActionEvent.REMOVE_PROVIDERS;
    payload: string[]
}

export interface IUpdateStatusFiltersAction {
    type: FundingSearchSelectionActionEvent.UPDATE_STATUS_FILTERS;
    payload: string[]
}

export interface IUpdateLocalAuthorityFiltersAction {
    type: FundingSearchSelectionActionEvent.UPDATE_LOCAL_AUTHORITY_FILTERS;
    payload: string[]
}

export interface IUpdateProviderTypeFiltersAction {
    type: FundingSearchSelectionActionEvent.UPDATE_PROVIDER_TYPE_FILTERS;
    payload: string[]
}

export interface IUpdateProviderSubTypeFiltersAction {
    type: FundingSearchSelectionActionEvent.UPDATE_PROVIDER_SUB_TYPE_FILTERS;
    payload: string[]
}

export interface IUpdateSearchTextFilterAction {
    type: FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER;
    payload: TextSearchModel
}

export interface TextSearchModel {
    searchFields: string[],
    searchTerm: string
}

export const initialiseFundingSearchSelection: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IInitialiseFundingSearchSelectionAction>> =
    (fundingStreamId: string,
     fundingPeriodId: string,
     specificationId: string) => {
        const initialSearchCriteria = buildInitialPublishedProviderSearchRequest(fundingStreamId, fundingPeriodId, specificationId);
        return async (dispatch) => {
            dispatch({
                type: FundingSearchSelectionActionEvent.INITIALISE,
                payload: initialSearchCriteria
            });
        }
    };

export const setHasErrors: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, ISetHasErrors>> =
    (hasErrors: boolean) => {
        return async (dispatch) => {
            dispatch({
                type: FundingSearchSelectionActionEvent.HAS_ERRORS,
                payload: hasErrors
            });
        }
    };

export const setPage: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdatePage>> =
    (pageNumber: number) => {
        return async (dispatch) => {
            dispatch({
                type: FundingSearchSelectionActionEvent.UPDATE_PAGE,
                payload: pageNumber
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

export const updateStatusFilters: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateStatusFiltersAction>> =
    (filters: string[]) => {
        return async (dispatch) => {
            dispatch({
                type: FundingSearchSelectionActionEvent.UPDATE_STATUS_FILTERS,
                payload: filters
            });
        }
    };

export const updateLocalAuthorityFilters: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateLocalAuthorityFiltersAction>> =
    (filters: string[]) => {
        return async (dispatch) => {
            dispatch({
                type: FundingSearchSelectionActionEvent.UPDATE_LOCAL_AUTHORITY_FILTERS,
                payload: filters
            });
        }
    };

export const updateSearchTextFilter: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateSearchTextFilterAction>> =
    (search: TextSearchModel) => {
        return async (dispatch) => {
            dispatch({
                type: FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER,
                payload: search
            });
        }
    };

export const updateProviderTypeFilters: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateProviderTypeFiltersAction>> =
    (filters: string[]) => {
        return async (dispatch) => {
            dispatch({
                type: FundingSearchSelectionActionEvent.UPDATE_PROVIDER_TYPE_FILTERS,
                payload: filters
            });
        }
    };

export const updateProviderSubTypeFilters: ActionCreator<ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateProviderSubTypeFiltersAction>> =
    (filters: string[]) => {
        return async (dispatch) => {
            dispatch({
                type: FundingSearchSelectionActionEvent.UPDATE_PROVIDER_SUB_TYPE_FILTERS,
                payload: filters
            });
        }
    };