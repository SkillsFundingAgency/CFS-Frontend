import {Reducer} from "redux";
import {FundingSearchSelectionState} from "../states/FundingSearchSelectionState";
import {FundingSearchSelectionActionEvent, IFundingSearchSelectionActions} from "../actions/FundingSearchSelectionActions";
import {PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";

const initialState: FundingSearchSelectionState = {searchCriteria: undefined, selectedProviderIds: []};

export const reduceFundingSearchSelectionState: Reducer<FundingSearchSelectionState, IFundingSearchSelectionActions> =
    (state: FundingSearchSelectionState = initialState, action: IFundingSearchSelectionActions): FundingSearchSelectionState => {

        switch (action.type) {
            case FundingSearchSelectionActionEvent.INITIALISE:
                const searchCriteria = action.payload;
                return {
                    searchCriteria,
                    selectedProviderIds: []
                };
            case FundingSearchSelectionActionEvent.ADD_PROVIDERS:
                return {
                    ...state,
                    selectedProviderIds: state.selectedProviderIds.concat((action.payload as string[]).filter(id => !state.selectedProviderIds.includes(id)))
                };
            case FundingSearchSelectionActionEvent.REMOVE_PROVIDERS:
                return {
                    ...state,
                    selectedProviderIds: state.selectedProviderIds.filter(id => !action.payload.includes(id))
                };
            case FundingSearchSelectionActionEvent.UPDATE_PROVIDER_TYPE_FILTERS:
                return {
                    ...state,
                    selectedProviderIds: [],
                    searchCriteria: {...(state.searchCriteria as PublishedProviderSearchRequest), providerType: action.payload, pageNumber: 1}
                };
            case FundingSearchSelectionActionEvent.UPDATE_STATUS_FILTERS:
                return {
                    ...state,
                    selectedProviderIds: [],
                    searchCriteria: {...(state.searchCriteria as PublishedProviderSearchRequest), status: action.payload, pageNumber: 1}
                };
            case FundingSearchSelectionActionEvent.UPDATE_LOCAL_AUTHORITY_FILTERS:
                return {
                    ...state,
                    selectedProviderIds: [],
                    searchCriteria: {...(state.searchCriteria as PublishedProviderSearchRequest), localAuthority: action.payload, pageNumber: 1}
                };
            case FundingSearchSelectionActionEvent.UPDATE_PROVIDER_SUB_TYPE_FILTERS:
                return {
                    ...state,
                    selectedProviderIds: [],
                    searchCriteria: {...(state.searchCriteria as PublishedProviderSearchRequest), providerSubType: action.payload, pageNumber: 1}
                };
            case FundingSearchSelectionActionEvent.UPDATE_PAGE:
                return {
                    ...state,
                    searchCriteria: {...(state.searchCriteria as PublishedProviderSearchRequest), pageNumber: action.payload}
                };
            case FundingSearchSelectionActionEvent.UPDATE_SEARCH_TEXT_FILTER:
                return {
                    ...state,
                    selectedProviderIds: [],
                    searchCriteria: {
                        ...(state.searchCriteria as PublishedProviderSearchRequest),
                        searchFields: action.payload.searchFields,
                        searchTerm: action.payload.searchTerm,
                        pageNumber: 1
                    }
                };
            case FundingSearchSelectionActionEvent.HAS_ERRORS:
                return {
                    ...state,
                    selectedProviderIds: [],
                    searchCriteria: {...(state.searchCriteria as PublishedProviderSearchRequest), hasErrors: action.payload, pageNumber: 1}
                };
            default:
                return state;
        }
    };