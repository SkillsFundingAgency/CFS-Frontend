import {ViewSpecificationResultsState} from "../states/ViewSpecificationResultsState";
import {
    ViewSpecificationResultsActions,
    ViewSpecificationResultsActionTypes
} from "../actions/ViewSpecificationResultsActions";

const initialState: ViewSpecificationResultsState = {
    additionalCalculations: {
        calculations: [],
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        pagerState: {
            currentPage: 0,
            displayNumberOfPages: 0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0
        },
        startItemNumber:0,
        totalErrorResults: 0,
        totalResults: 0
    },
    templateCalculations: {
        calculations: [],
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        pagerState: {
            currentPage: 0,
            displayNumberOfPages: 0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0
        },
        startItemNumber:0,
        totalErrorResults: 0,
        totalResults: 0
    },
    specification: {
        name: "",
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [],
        id: "",
        isSelectedForFunding: false,
        providerVersionId: ""
    }
};

export function reduceViewSpecificationResultsState(state: ViewSpecificationResultsState = initialState, action: ViewSpecificationResultsActions): ViewSpecificationResultsState {
    switch (action.type) {
        case ViewSpecificationResultsActionTypes.GET_SPECIFICATIONSUMMARY:
            return {...state, specification: action.payload};
        case ViewSpecificationResultsActionTypes.GET_TEMPLATECALCULATIONS:
            return {...state, templateCalculations: action.payload};
        case ViewSpecificationResultsActionTypes.GET_ADDITIONALCALCULATIONS:
            return {...state, additionalCalculations: action.payload};
        default:
            return state;
    }
}