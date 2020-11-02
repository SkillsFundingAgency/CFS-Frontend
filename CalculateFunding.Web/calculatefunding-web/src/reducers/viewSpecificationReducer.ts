import {ViewSpecificationState} from "../states/ViewSpecificationState";
import {ViewSpecificationActionTypes, ViewSpecificationsActions} from "../actions/ViewSpecificationsActions";
import {CalculationSearchResponse} from "../types/CalculationSearchResponse";
import {DatasetSummary} from "../types/DatasetSummary";
import {ReleaseTimetableViewModel} from "../types/ReleaseTimetableSummary";
import {IFundingStructureItem} from "../types/FundingStructureItem";
import {FundingLineStructureActionTypes} from "../actions/FundingLineStructureAction";
import {ProfileVariationPointer} from "../types/Specifications/ProfileVariationPointer";

const initialState: ViewSpecificationState = {
    additionalCalculations: {
        lastPage: 0,
        totalCount: 0,
        results: [],
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
    fundingLineStatusResult: "",
    profileVariationPointerResult: []
};

export function reduceViewSpecificationState(state: ViewSpecificationState = initialState, action: ViewSpecificationsActions): ViewSpecificationState {
    switch (action.type) {
        case ViewSpecificationActionTypes.GET_SPECIFICATION:
            return {...state, specification: action.payload};
        case ViewSpecificationActionTypes.GET_ADDITIONALCALCULATIONS:
            return {...state, additionalCalculations: action.payload as CalculationSearchResponse};
        case ViewSpecificationActionTypes.GET_DATASETS:
            return {...state, datasets: action.payload as DatasetSummary};
        case ViewSpecificationActionTypes.GET_RELEASETIMETABLE:
            return {...state, releaseTimetable: action.payload as ReleaseTimetableViewModel};
        case ViewSpecificationActionTypes.GET_FUNDINGLINESTRUCTURE:
            return {...state, fundingLineStructureResult: action.payload as IFundingStructureItem[]};
        case ViewSpecificationActionTypes.GET_PROFILEVARIATIONPOINTER:
            return {...state, profileVariationPointerResult: action.payload as ProfileVariationPointer[]};
        case ViewSpecificationActionTypes.SET_PROFILEVARIATIONPOINTER:
            return {...state, profileVariationPointerResult: action.payload as ProfileVariationPointer[]};
        case FundingLineStructureActionTypes.CHANGE_FUNDINGLINESTATUS:
            return {...state, fundingLineStatusResult: action.payload};
        case ViewSpecificationActionTypes.CONFIRM_TIMETABLECHANGES:
            return {...state, releaseTimetable: action.payload as ReleaseTimetableViewModel};
        default:
            return state;
    }
}
