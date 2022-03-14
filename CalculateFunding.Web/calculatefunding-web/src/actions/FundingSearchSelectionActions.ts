import { ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";

import { FundingSearchSelectionState } from "../states/FundingSearchSelectionState";
import {
  buildInitialPublishedProviderSearchRequest,
  PublishedProviderSearchRequest,
} from "../types/publishedProviderSearchRequest";
import {FundingActionType} from "../types/PublishedProvider/PublishedProviderFundingCount";

export enum FundingSearchSelectionActionEvent {
  INITIALISE = "initialise",
  HAS_ERRORS = "setHasErrors",
  UPDATE_PAGE = "updatePage",
  ADD_PROVIDERS = "addProvidersToFundingSelection",
  REMOVE_PROVIDERS = "removeProvidersToFundingSelection",
  UPDATE_STATUS_FILTERS = "updateStatusFilters",
  UPDATE_LOCAL_AUTHORITY_FILTERS = "updateLocalAuthorityFilters",
  UPDATE_PROVIDER_TYPE_FILTERS = "updateProviderTypeFilters",
  UPDATE_PROVIDER_SUB_TYPE_FILTERS = "updateProviderSubTypeFilters",
  UPDATE_SEARCH_TEXT_FILTER = "updateSearchTextFilter",
  UPDATE_ALLOCATION_TYPE_FILTERS = "updateAllocationTypeFilters",
  UPDATE_MONTH_YEAR_OPENED_FILTERS = "updateMonthYearOpenedFilters",
}

export type IFundingSearchSelectionActions =
  | IInitialiseFundingSearchSelectionAction
  | IUpdatePage
  | ISetHasErrors
  | IAddProvidersToFundingSelectionAction
  | IUpdateProviderTypeFiltersAction
  | IUpdateStatusFiltersAction
  | IUpdateLocalAuthorityFiltersAction
  | IUpdateProviderSubTypeFiltersAction
  | IUpdateSearchTextFilterAction
  | IRemoveProvidersFromFundingSelectionAction
  | IUpdateAllocationTypeFiltersAction
  | IUpdateMonthYearOpenedFilters;

export interface IInitialiseFundingSearchSelectionAction {
  type: FundingSearchSelectionActionEvent.INITIALISE;
  payload: PublishedProviderSearchRequest;
}

export interface ISetHasErrors {
  type: FundingSearchSelectionActionEvent.HAS_ERRORS;
  payload: boolean;
}

export interface IUpdatePage {
  type: FundingSearchSelectionActionEvent.UPDATE_PAGE;
  payload: number;
}

export interface IAddProvidersToFundingSelectionAction {
  type: FundingSearchSelectionActionEvent.ADD_PROVIDERS;
  payload: string[];
}

export interface IRemoveProvidersFromFundingSelectionAction {
  type: FundingSearchSelectionActionEvent.REMOVE_PROVIDERS;
  payload: string[];
}

export interface IUpdateStatusFiltersAction {
  type: FundingSearchSelectionActionEvent.UPDATE_STATUS_FILTERS;
  payload: SearchFilter;
}

export interface IUpdateLocalAuthorityFiltersAction {
  type: FundingSearchSelectionActionEvent.UPDATE_LOCAL_AUTHORITY_FILTERS;
  payload: SearchFilter;
}

export interface IUpdateProviderTypeFiltersAction {
  type: FundingSearchSelectionActionEvent.UPDATE_PROVIDER_TYPE_FILTERS;
  payload: SearchFilter;
}

export interface IUpdateProviderSubTypeFiltersAction {
  type: FundingSearchSelectionActionEvent.UPDATE_PROVIDER_SUB_TYPE_FILTERS;
  payload: SearchFilter;
}

export interface IUpdateSearchTextFilterAction {
  type: FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER;
  payload: TextSearchModel;
}

export interface IUpdateAllocationTypeFiltersAction {
  type: FundingSearchSelectionActionEvent.UPDATE_ALLOCATION_TYPE_FILTERS;
  payload: string;
}

export interface IUpdateMonthYearOpenedFilters {
  type: FundingSearchSelectionActionEvent.UPDATE_MONTH_YEAR_OPENED_FILTERS;
  payload: SearchFilter;
}

export interface TextSearchModel {
  searchFields: string[];
  searchTerm: string;
}

export interface SearchFilter {
  value: string;
  isSelected: boolean;
}

export const initialiseFundingSearchSelection: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IInitialiseFundingSearchSelectionAction>
> = (fundingStreamId: string, fundingPeriodId: string, specificationId: string, fundingAction: Exclude<FundingActionType, FundingActionType.Refresh>) => {
  const initialSearchCriteria = buildInitialPublishedProviderSearchRequest(
    fundingStreamId,
    fundingPeriodId,
    specificationId,
    fundingAction
);
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.INITIALISE,
      payload: initialSearchCriteria,
    });
  };
};

export const setHasErrors: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, ISetHasErrors>
> = (hasErrors: boolean) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.HAS_ERRORS,
      payload: hasErrors,
    });
  };
};

export const setPage: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdatePage>
> = (pageNumber: number) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.UPDATE_PAGE,
      payload: pageNumber,
    });
  };
};

export const addProvidersToFundingSelection: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IAddProvidersToFundingSelectionAction>
> = (providerVersionIds: string[]) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.ADD_PROVIDERS,
      payload: providerVersionIds,
    });
  };
};

export const removeProvidersFromFundingSelection: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IRemoveProvidersFromFundingSelectionAction>
> = (providerVersionIds: string[]) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.REMOVE_PROVIDERS,
      payload: providerVersionIds,
    });
  };
};

export const updateStatusFilters: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateStatusFiltersAction>
> = (filterChange: SearchFilter) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.UPDATE_STATUS_FILTERS,
      payload: filterChange,
    });
  };
};

export const updateLocalAuthorityFilters: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateLocalAuthorityFiltersAction>
> = (filterChange: SearchFilter) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.UPDATE_LOCAL_AUTHORITY_FILTERS,
      payload: filterChange,
    });
  };
};

export const updateSearchTextFilter: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateSearchTextFilterAction>
> = (search: TextSearchModel) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER,
      payload: search,
    });
  };
};

export const updateProviderTypeFilters: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateProviderTypeFiltersAction>
> = (filterChange: SearchFilter) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.UPDATE_PROVIDER_TYPE_FILTERS,
      payload: filterChange,
    });
  };
};

export const updateProviderSubTypeFilters: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateProviderSubTypeFiltersAction>
> = (filterChange: SearchFilter) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.UPDATE_PROVIDER_SUB_TYPE_FILTERS,
      payload: filterChange,
    });
  };
};

export const updateAllocationTypeFilters: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateAllocationTypeFiltersAction>
> = (allocationType: string) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.UPDATE_ALLOCATION_TYPE_FILTERS,
      payload: allocationType,
    });
  };
};

export const updateMonthYearOpenedFilters: ActionCreator<
  ThunkAction<Promise<any>, FundingSearchSelectionState, unknown, IUpdateMonthYearOpenedFilters>
> = (filterChange: SearchFilter) => {
  return async (dispatch) => {
    dispatch({
      type: FundingSearchSelectionActionEvent.UPDATE_MONTH_YEAR_OPENED_FILTERS,
      payload: filterChange,
    });
  };
};
