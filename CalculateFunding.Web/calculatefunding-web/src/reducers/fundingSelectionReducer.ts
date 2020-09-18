import {Reducer} from "redux";
import {IFundingSelectionState} from "../states/IFundingSelectionState";
import {IFundingSelectionActions, FundingSelectionActionEvent} from "../actions/FundingSelectionActions";

const initialState: IFundingSelectionState = { providerVersionIds: []};

export const reduceFundingSelectionState: Reducer<IFundingSelectionState, IFundingSelectionActions> =
    (state: IFundingSelectionState = initialState, action: IFundingSelectionActions): IFundingSelectionState => {
        switch (action.type) {
            case FundingSelectionActionEvent.ADD_PROVIDERS:
                return {...state, providerVersionIds: state.providerVersionIds.concat(action.payload.filter(id => !state.providerVersionIds.includes(id)))};
            case FundingSelectionActionEvent.REMOVE_PROVIDERS:
                return {...state, providerVersionIds: state.providerVersionIds.filter(id => !action.payload.includes(id))};
            default:
                return state;
        }
    };