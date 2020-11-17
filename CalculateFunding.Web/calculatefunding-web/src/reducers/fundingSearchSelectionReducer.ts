import {Reducer} from "redux";
import {FundingSearchSelectionState} from "../states/FundingSearchSelectionState";
import {FundingSearchSelectionActionEvent, IFundingSearchSelectionActions} from "../actions/FundingSearchSelectionActions";

const initialState: FundingSearchSelectionState = {searchCriteria: undefined, providerVersionIds: []};

export const reduceFundingSearchSelectionState: Reducer<FundingSearchSelectionState, IFundingSearchSelectionActions> =
    (state: FundingSearchSelectionState = initialState, action: IFundingSearchSelectionActions): FundingSearchSelectionState => {
        switch (action.type) {
            case FundingSearchSelectionActionEvent.INITIALISE:
                return {
                    searchCriteria: action.payload,
                    providerVersionIds: []
                };
            case FundingSearchSelectionActionEvent.UPDATE_SEARCH:
                return {
                    ...state,
                    searchCriteria: action.payload
                };
            case FundingSearchSelectionActionEvent.ADD_PROVIDERS:
                return {
                    ...state,
                    providerVersionIds: state.providerVersionIds.concat((action.payload as string[]).filter(id => !state.providerVersionIds.includes(id)))
                };
            case FundingSearchSelectionActionEvent.REMOVE_PROVIDERS:
                return {
                    ...state,
                    providerVersionIds: state.providerVersionIds.filter(id => !action.payload.includes(id))
                };
            default:
                return state;
        }
    };