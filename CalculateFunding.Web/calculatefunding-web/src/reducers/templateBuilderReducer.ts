import { ITemplateBuilderState } from "../states/ITemplateBuilderState";
import { TemplateBuilderAction, TemplateBuilderActionTypes } from "../actions/TemplateBuilderActions";

const initialState: ITemplateBuilderState = {
    datasource: []
}

export function reduceTemplateBuilderState(state: ITemplateBuilderState = initialState, action: TemplateBuilderAction): ITemplateBuilderState {
    switch (action.type) {
        case TemplateBuilderActionTypes.ADD_FUNDING_LINE:
            return {...state };
        case TemplateBuilderActionTypes.ADD_CALCULATION:
            return {...state };
        default:
            return state;
    }
}