import { Reducer } from "redux";

import {
  FundingSearchSelectionActionEvent,
  IFundingSearchSelectionActions,
  SearchFilter,
} from "../actions/FundingSearchSelectionActions";
import { FundingSearchSelectionState } from "../states/FundingSearchSelectionState";
import { PublishedProviderSearchRequest } from "../types/publishedProviderSearchRequest";

const initialState: FundingSearchSelectionState = { searchCriteria: undefined, selectedProviderIds: [] };

export const reduceFundingSearchSelectionState: Reducer<
  FundingSearchSelectionState,
  IFundingSearchSelectionActions
> = (
  state: FundingSearchSelectionState = initialState,
  action: IFundingSearchSelectionActions
): FundingSearchSelectionState => {
  function applyFilterChange(original: string[], filterChange: SearchFilter) {
    if (filterChange.isSelected) {
      original.push(filterChange.value);
    } else {
      const position = original.findIndex(filterItem => filterItem == filterChange.value);
      original.splice(position, 1);
    }
    return original;
  }

  const filters = state.searchCriteria as PublishedProviderSearchRequest;
  switch (action.type) {
    case FundingSearchSelectionActionEvent.INITIALISE:
      const searchCriteria = action.payload;
      return {
        searchCriteria,
        selectedProviderIds: [],
      };
    case FundingSearchSelectionActionEvent.ADD_PROVIDERS:
      return {
        ...state,
        selectedProviderIds: state.selectedProviderIds.concat(
          (action.payload as string[]).filter((id) => !state.selectedProviderIds.includes(id))
        ),
      };
    case FundingSearchSelectionActionEvent.REMOVE_PROVIDERS:
      return {
        ...state,
        selectedProviderIds: state.selectedProviderIds.filter((id) => !action.payload.includes(id)),
      };
    case FundingSearchSelectionActionEvent.UPDATE_PROVIDER_TYPE_FILTERS:
      return {
        ...state,
        searchCriteria: {
          ...filters,
          providerType: applyFilterChange(filters.providerType, action.payload),
          pageNumber: 1,
        },
      };
    case FundingSearchSelectionActionEvent.UPDATE_STATUS_FILTERS:
      return {
        ...state,
        searchCriteria: {
          ...filters,
          status: applyFilterChange(filters.status, action.payload),
          pageNumber: 1,
        },
      };
    case FundingSearchSelectionActionEvent.UPDATE_LOCAL_AUTHORITY_FILTERS:
      return {
        ...state,
        searchCriteria: {
          ...filters,
          localAuthority: applyFilterChange(filters.localAuthority, action.payload),
          pageNumber: 1,
        },
      };
    case FundingSearchSelectionActionEvent.UPDATE_PROVIDER_SUB_TYPE_FILTERS:
      return {
        ...state,
        searchCriteria: {
          ...filters,
          providerSubType: applyFilterChange(filters.providerSubType, action.payload),
          pageNumber: 1,
        },
      };
    case FundingSearchSelectionActionEvent.UPDATE_PAGE:
      return {
        ...state,
        searchCriteria: { ...filters, pageNumber: action.payload },
      };
    case FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER:
      return {
        ...state,
        searchCriteria: {
          ...filters,
          searchFields: action.payload.searchFields,
          searchTerm: action.payload.searchTerm,
          pageNumber: 1,
        },
      };
    case FundingSearchSelectionActionEvent.HAS_ERRORS:
      return {
        ...state,
        searchCriteria: { ...filters, hasErrors: action.payload, pageNumber: 1 },
      };
    case FundingSearchSelectionActionEvent.UPDATE_ALLOCATION_TYPE_FILTERS:
      return {
        ...state,
        searchCriteria: { ...filters, indicative: [action.payload] },
      };
    case FundingSearchSelectionActionEvent.UPDATE_MONTH_YEAR_OPENED_FILTERS:
      return {
        ...state,
        searchCriteria: {
          ...filters,
          monthYearOpened: applyFilterChange(filters.monthYearOpened, action.payload),
          pageNumber: 1,
        },
      };
    default:
      return state;
  }
};
