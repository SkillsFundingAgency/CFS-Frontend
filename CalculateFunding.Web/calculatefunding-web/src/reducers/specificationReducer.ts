import {SpecificationState} from "../states/SpecificationState";
import {SpecificationActions, SpecificationActionTypes} from "../actions/SpecificationActions";

const initialState: SpecificationState = {
    specificationListResults: {
        facets: [],
        items: [],
        pageNumber: 0,
        pageSize: 0,
        totalErrorItems: 0,
        totalItems: 0,
        totalPages: 0
    }
};

export function reduceSpecificationState(state: SpecificationState = initialState, action: SpecificationActions): SpecificationState {
    switch (action.type) {
        case SpecificationActionTypes.GET_ALLSPECIFICATIONS:
            return {...state, specificationListResults: action.payload};
        default:
            return state;
    }
}