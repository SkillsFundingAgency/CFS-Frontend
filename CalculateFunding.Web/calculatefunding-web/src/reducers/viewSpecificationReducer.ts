import {ViewSpecificationState} from "../states/ViewSpecificationState";
import {ViewSpecificationActionTypes, ViewSpecificationsActions} from "../actions/ViewSpecificationsActions";
import {CalculationSummary} from "../types/CalculationSummary";
import {DatasetSummary} from "../types/DatasetSummary";
import {ReleaseTimetableViewModel} from "../types/ReleaseTimetableSummary";
import {IFundingStructureItem} from "../types/FundingStructureItem";
import {FundingLineStructureActionTypes} from "../actions/FundingLineStructureAction";

const initialState: ViewSpecificationState = {
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
        startItemNumber: 0,
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
        fundingStreams: [{
            name: "",
            id: ""
        }],
        id: "",
        isSelectedForFunding: false,
        providerVersionId: ""
    },
    datasets: {
        content: [],
        statusCode: 0
    },
    releaseTimetable: {
        navisionDate: {
            day: "",
            month: "",
            year: "",
            time: ""
        },
        releaseDate: {
            day: "",
            month: "",
            year: "",
            time: ""
        }
    },
    fundingLineStructureResult: [],
    fundingLineStatusResult: ""
};

export function reduceViewSpecificationState(state: ViewSpecificationState = initialState, action: ViewSpecificationsActions): ViewSpecificationState {
    switch (action.type) {
        case ViewSpecificationActionTypes.GET_SPECIFICATION:
            return {...state, specification: action.payload};
        case ViewSpecificationActionTypes.GET_ADDITIONALCALCULATIONS:
            return {...state, additionalCalculations: action.payload as CalculationSummary};
        case ViewSpecificationActionTypes.GET_DATASETS:
            return {...state, datasets: action.payload as DatasetSummary};
        case ViewSpecificationActionTypes.GET_RELEASETIMETABLE:
            return {...state, releaseTimetable: action.payload as ReleaseTimetableViewModel};
        case ViewSpecificationActionTypes.GET_FUNDINGLINESTRUCTURE:
            return {...state, fundingLineStructureResult: action.payload as IFundingStructureItem[]};
        case FundingLineStructureActionTypes.CHANGE_FUNDINGLINESTATUS:
            return {...state, fundingLineStatusResult: action.payload};
        case ViewSpecificationActionTypes.CONFIRM_TIMETABLECHANGES:
            return {...state, releaseTimetable: action.payload as ReleaseTimetableViewModel};
        default:
            return state;
    }
}