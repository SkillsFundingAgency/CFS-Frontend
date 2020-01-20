import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {CalculationSummary} from "../types/CalculationSummary";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import {
    getAdditionalCalculationsForSpecificationService,
    getSpecificationSummaryService
} from "../services/specificationService";
import {ViewSpecificationState} from "../states/ViewSpecificationState";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {getDatasetBySpecificationIdService} from "../services/datasetService";
import {DatasetSummary} from "../types/DatasetSummary";

export enum ViewSpecificationActionTypes {
    GET_ADDITIONALCALCULATIONS = 'getAdditionalCalculations',
    GET_SPECIFICATION= 'getSpecification',
    GET_DATASETS = 'getDatasetBySpecificationId'
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

export type ViewSpecificationsActions =
    GetAdditionalCalculations | GetSpecification | GetDatasets;

export const getAdditionalCalculations: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationState, null, ViewSpecificationsActions>> = (specificationId: string, status: string, pageNumber: number, searchTerm: string) => {
    const searchRequest: CalculationSearchRequestViewModel = {
        searchTerm: searchTerm,
        pageNumber: pageNumber,
        calculationType: 'Additional',
        specificationId: specificationId,
        status: status
    };

    return async (dispatch: Dispatch) => {
        const response = await getAdditionalCalculationsForSpecificationService(searchRequest);
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
