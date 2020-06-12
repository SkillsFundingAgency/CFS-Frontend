import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {CalculationSummary} from "../types/CalculationSummary";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import {
    changeFundingLineStateService,
    getProfileVariationPointersService,
    getSpecificationSummaryService, setProfileVariationPointersService
} from "../services/specificationService";
import {ViewSpecificationState} from "../states/ViewSpecificationState";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {getDatasetBySpecificationIdService} from "../services/datasetService";
import {DatasetSummary} from "../types/DatasetSummary";
import {Content, ReleaseTimetableSummary, ReleaseTimetableViewModel} from "../types/ReleaseTimetableSummary";
import {
    getReleaseTimetableForSpecificationService,
    saveReleaseTimetableForSpecificationService
} from "../services/publishService";
import {SaveReleaseTimetableViewModel} from "../types/SaveReleaseTimetableViewModel";
import {IFundingLineStructureState} from "../states/IFundingLineStructureState";
import {IFundingStructureItem} from "../types/FundingStructureItem";
import {
    ChangeFundingLineStatusAction,
    FundingLineStructureAction,
} from "./FundingLineStructureAction";
import {getFundingLineStructureService} from "../services/fundingStructuresService";
import {PublishStatus, PublishStatusModel} from "../types/PublishStatusModel";
import {getCalculationsService} from "../services/calculationService";
import {ProfileVariationPointer} from "../types/Specifications/ProfileVariationPointer";

export enum ViewSpecificationActionTypes {
    GET_RELEASETIMETABLE = 'getReleaseTimetable',
    GET_ADDITIONALCALCULATIONS = 'getAdditionalCalculations',
    GET_SPECIFICATION = 'getSpecification',
    GET_DATASETS = 'getDatasetBySpecificationId',
    GET_FUNDINGLINESTRUCTURE = 'getFundingLineStructure',
    GET_PROFILEVARIATIONPOINTER = 'getProfileVariationPointers',
    SET_PROFILEVARIATIONPOINTER = 'setProfileVariationPointers',
    CHANGE_FUNDINGLINESTATUS = 'changeFundingLineState',
    CONFIRM_TIMETABLECHANGES = 'confirmTimetableChanges'
}

export interface GetAdditionalCalculations {
    type: ViewSpecificationActionTypes.GET_ADDITIONALCALCULATIONS
    payload: CalculationSummary
}

export interface GetSpecification {
    type: ViewSpecificationActionTypes.GET_SPECIFICATION
    payload: SpecificationSummary
}

export interface GetDatasets {
    type: ViewSpecificationActionTypes.GET_DATASETS
    payload: DatasetSummary
}

export interface GetReleaseTimetable {
    type: ViewSpecificationActionTypes.GET_RELEASETIMETABLE
    payload: ReleaseTimetableViewModel
}

export interface GetFundingLineStructureAction {
    type: ViewSpecificationActionTypes.GET_FUNDINGLINESTRUCTURE;
    payload: IFundingStructureItem[]
}

export interface GetProfileVariationPointers {
    type: ViewSpecificationActionTypes.GET_PROFILEVARIATIONPOINTER
    payload: ProfileVariationPointer[]
}

export interface SetProfileVariationPointers {
    type: ViewSpecificationActionTypes.SET_PROFILEVARIATIONPOINTER
    payload: ProfileVariationPointer[]
}

export interface ChangeFundingLineStatusAction {
    type: ViewSpecificationActionTypes.CHANGE_FUNDINGLINESTATUS,
    payload: string
}

export interface ConfirmTimetableChanges {
    type: ViewSpecificationActionTypes.CONFIRM_TIMETABLECHANGES
    payload: ReleaseTimetableViewModel
}

export type ViewSpecificationsActions =
    GetAdditionalCalculations
    | GetSpecification
    | GetDatasets
    | GetReleaseTimetable
    | GetFundingLineStructureAction
    | GetProfileVariationPointers
    | SetProfileVariationPointers
    | ChangeFundingLineStatusAction
    | ConfirmTimetableChanges;

export const getAdditionalCalculations: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationState, null, ViewSpecificationsActions>> = (specificationId: string, status: string, pageNumber: number, searchTerm: string) => {
    const searchRequest: CalculationSearchRequestViewModel = {
        searchTerm: searchTerm,
        pageNumber: pageNumber,
        calculationType: 'Additional',
        specificationId: specificationId,
        status: status
    };

    return async (dispatch: Dispatch) => {
        const response = await getCalculationsService(searchRequest);
        dispatch({
            type: ViewSpecificationActionTypes.GET_ADDITIONALCALCULATIONS,
            payload: response.data as CalculationSummary
        });
    }
};

export const getSpecification: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationState, null, ViewSpecificationsActions>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await getSpecificationSummaryService(specificationId);
        dispatch({
            type: ViewSpecificationActionTypes.GET_SPECIFICATION,
            payload: response.data as SpecificationSummary
        });
    }
};

export const getDatasetBySpecificationId: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationState, null, ViewSpecificationsActions>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await getDatasetBySpecificationIdService(specificationId);
        dispatch({
            type: ViewSpecificationActionTypes.GET_DATASETS,
            payload: response.data as DatasetSummary
        });
    }
};

export const getReleaseTimetable: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationState, null, ViewSpecificationsActions>> =
    (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        let response = await getReleaseTimetableForSpecificationService(specificationId);

        let releaseTimetableSummary = response.data as ReleaseTimetableSummary;

        let output = createReleaseTimetableViewModel(releaseTimetableSummary.content);

        dispatch({
            type: ViewSpecificationActionTypes.GET_RELEASETIMETABLE,
            payload: output as ReleaseTimetableViewModel
        });
    }
};

export const getFundingLineStructure:
    ActionCreator<ThunkAction<Promise<any>, IFundingLineStructureState, null, FundingLineStructureAction>> =
    (specificationId: string, fundingPeriodId: string, fundingStreamId: string) => {
        return async (dispatch: Dispatch) => {
            const response = await getFundingLineStructureService(specificationId, fundingPeriodId, fundingStreamId);
            dispatch({
                type: ViewSpecificationActionTypes.GET_FUNDINGLINESTRUCTURE,
                payload: response.data as IFundingStructureItem[]
            });
        }
    };

export const getProfileVariationPointers: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationState, null, ViewSpecificationsActions>> =
    (specificationId: string) => {
        return async (dispatch: Dispatch) => {
            let response = await getProfileVariationPointersService(specificationId);

            dispatch({
                type: ViewSpecificationActionTypes.GET_PROFILEVARIATIONPOINTER,
                payload: response.data as ProfileVariationPointer[]
            });
        }
    };

export const setProfileVariationPointers: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationState, null, ViewSpecificationsActions>> =
    (specificationId: string, profileVariationPointer: ProfileVariationPointer[]) => {
        return async (dispatch: Dispatch) => {
            let response = await setProfileVariationPointersService(specificationId, profileVariationPointer);

            dispatch({
                type: ViewSpecificationActionTypes.SET_PROFILEVARIATIONPOINTER,
                payload: response.data as ProfileVariationPointer[]
            });
        }
    };

export const changeFundingLineState:
    ActionCreator<ThunkAction<Promise<any>, IFundingLineStructureState, null, FundingLineStructureAction>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await changeFundingLineStateService(specificationId);
        let publishStatusModelResult = response.data as PublishStatusModel;
        dispatch({
            type: ViewSpecificationActionTypes.CHANGE_FUNDINGLINESTATUS,
            payload: publishStatusModelResult.publishStatus as PublishStatus
        });
    }
};

export const confirmTimetableChanges: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationState, null, ViewSpecificationsActions>> =
    (releaseTimetable: SaveReleaseTimetableViewModel) => {
    return async (dispatch: Dispatch) => {
        const response = await saveReleaseTimetableForSpecificationService(releaseTimetable);

        let output = createReleaseTimetableViewModel(response.data);

        dispatch({
            type: ViewSpecificationActionTypes.CONFIRM_TIMETABLECHANGES,
            payload: output as ReleaseTimetableViewModel
        });
    }
};

function createReleaseTimetableViewModel(content: Content)
{
    let releaseDate: Date = new Date(content.earliestPaymentAvailableDate);
    let navisionDate: Date = new Date(content.externalPublicationDate);

    let statementDate: Date = new Date(content.externalPublicationDate);
    let statementHours: string = statementDate.getHours() < 10 ? `0${statementDate.getHours()}` : `${statementDate.getHours()}`;
    let statementMinutes: string = statementDate.getMinutes() < 10 ? `0${statementDate.getMinutes()}` : `${statementDate.getMinutes()}`;
    let statementDay = statementDate.getDate();
    let statementMonth = statementDate.getMonth();
    let statementYear = statementDate.getFullYear();
    let statementTime = `${statementHours}:${statementMinutes}`;

    let paymentDate: Date = new Date(content.earliestPaymentAvailableDate);
    let fundingHours: string = paymentDate.getHours() < 10 ? `0${paymentDate.getHours()}` : `${paymentDate.getHours()}`;
    let fundingMinutes: string = paymentDate.getMinutes() < 10 ? `0${paymentDate.getMinutes()}` : `${paymentDate.getMinutes()}`;
    let fundingDay = paymentDate.getDate();
    let fundingMonth = paymentDate.getMonth();
    let fundingYear = paymentDate.getFullYear();
    let fundingTime = `${fundingHours}:${fundingMinutes}`;

    let output: ReleaseTimetableViewModel = {
        navisionDate: {
            day: !isNaN(navisionDate.getDate()) ? statementDay.toString() : "",
            month: !isNaN(navisionDate.getMonth()) ? statementMonth.toString() : "",
            year: !isNaN(navisionDate.getFullYear()) ? statementYear.toString() : "",
            time: !isNaN(navisionDate.getTime()) ? statementTime : ""
        },
        releaseDate: {
            day: !isNaN(releaseDate.getDate()) ? fundingDay.toString() : "",
            month: !isNaN(releaseDate.getMonth()) ? fundingMonth.toString() : "",
            year: !isNaN(releaseDate.getFullYear()) ? fundingYear.toString() : "",
            time: !isNaN(releaseDate.getTime()) ? fundingTime : ""
        }
    };

    return output;
}
