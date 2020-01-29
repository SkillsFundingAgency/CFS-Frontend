import {SelectSpecificationState} from "../states/SelectSpecificationState";
import {SelectSpecificationActions, SelectSpecificationActionTypes} from "../actions/SelectSpecificationActions";

const initialState: SelectSpecificationState = {
    fundingStreams: [],
    fundingPeriods: [],
    specifications: []
};

export function reduceSelectSpecificationState(state: SelectSpecificationState = initialState, action: SelectSpecificationActions): SelectSpecificationState {
    switch (action.type) {
        case SelectSpecificationActionTypes.GET_FUNDINGSTREAMS:
            return {...state, fundingStreams: action.payload};
        case SelectSpecificationActionTypes.GET_FUNDINGPERIODSBYFUNDINGSTREAMID:
            return {...state, fundingPeriods: action.payload};
        case SelectSpecificationActionTypes.GET_SPECIFICATIONSBYFUNDINGPERIODANDSTREAMID:
            return {...state, specifications: action.payload};
        default:
            return state;
    }
}