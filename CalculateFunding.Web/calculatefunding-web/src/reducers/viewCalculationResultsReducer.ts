import {ViewCalculationState} from "../states/ViewCalculationState";
import {
    ViewCalculationResultsActions,
    ViewCalculationResultsActionTypes
} from "../actions/ViewCalculationResultsActions";

const initialState: ViewCalculationState = {
    providers: {
        totalResults: 0,
        endItemNumber: 0,
        startItemNumber: 0,
        pagerState: {
            currentPage: 0,
            lastPage: 0,
            previousPage: 0,
            pages: [],
            nextPage: 0,
            displayNumberOfPages: 0
        },
        totalErrorResults: 0,
        facets: [],
        currentPage: 0,
        calculationProviderResults : [],
    },
    specification: {
        id: "",
        description: "",
        fundingStreams: [],
        fundingPeriod: {
            name: "",
            id: ""
        },
        name: "",
        providerVersionId: "",
        isSelectedForFunding: false,
        approvalStatus: ""
    },
    calculation: {
        lastUpdatedDateDisplay:"",
        id:"",
        lastUpdatedDate: new Date(),
        status:"",
        fundingStreamId:"",
        name:"",
calculationType:"",
        description:null,
        namespace :"",
        specificationId:"",
        specificationName:"",
        valueType:"",
        wasTemplateCalculation:false
    }
};

export function reduceCalculationResultsState(state: ViewCalculationState = initialState, action: ViewCalculationResultsActions): ViewCalculationState {
    switch (action.type) {
        case ViewCalculationResultsActionTypes.GET_CALCULATIONRESULTS:
            return {...state, providers: action.payload};
        case ViewCalculationResultsActionTypes.GET_CALCULATIONBYID:
            return {...state, calculation: action.payload};
        default:
            return state;
    }
}