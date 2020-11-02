import axios from "axios"
import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {ViewSpecificationResultsState} from "../states/ViewSpecificationResultsState";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {CalculationSearchResponse} from "../types/CalculationSearchResponse";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import {searchForCalculationsService} from "../services/calculationService";

export enum ViewSpecificationResultsActionTypes {
    GET_SPECIFICATIONSUMMARY = 'getSpecificationSummary',
    GET_TEMPLATECALCULATIONS = 'getTemplateCalculations',
    GET_ADDITIONALCALCULATIONS = 'getAdditionalCalculations'
}

export interface GetSpecificationAction {
    type: ViewSpecificationResultsActionTypes.GET_SPECIFICATIONSUMMARY;
    payload: SpecificationSummary
}

export interface GetTemplateCalculations {
    type: ViewSpecificationResultsActionTypes.GET_TEMPLATECALCULATIONS;
    payload: CalculationSearchResponse
}

export interface GetAdditionalCalculations {
    type: ViewSpecificationResultsActionTypes.GET_ADDITIONALCALCULATIONS
    payload: CalculationSearchResponse
}

export type ViewSpecificationResultsActions =
    GetSpecificationAction |
    GetTemplateCalculations |
    GetAdditionalCalculations

export const getSpecificationSummary: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationResultsState, null, ViewSpecificationResultsActions>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await axios(`/api/specs/specification-summary-by-id/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        dispatch({
            type: ViewSpecificationResultsActionTypes.GET_SPECIFICATIONSUMMARY,
            payload: response.data as SpecificationSummary
        });
    }
};
export const getTemplateCalculations: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationResultsState, null, ViewSpecificationResultsActions>> = (specificationId: string, status: string, pageNumber: number, searchTerm: string) => {
    const searchRequest: CalculationSearchRequestViewModel = {
        searchTerm: searchTerm,
        pageNumber: pageNumber,
        calculationType: 'Template',
        specificationId: specificationId,
        status: status
    };

    return async (dispatch: Dispatch) => {
        const response = await searchForCalculationsService(searchRequest);
        dispatch({
            type: ViewSpecificationResultsActionTypes.GET_TEMPLATECALCULATIONS,
            payload: response.data as CalculationSearchResponse
        });
    }
};
export const getAdditionalCalculations: ActionCreator<ThunkAction<Promise<any>, ViewSpecificationResultsState, null, ViewSpecificationResultsActions>> = (specificationId: string, status: string, pageNumber: number, searchTerm: string) => {
    const searchRequest: CalculationSearchRequestViewModel = {
        searchTerm: searchTerm,
        pageNumber: pageNumber,
        calculationType: 'Additional',
        specificationId: specificationId,
        status: status
    };

    return async (dispatch: Dispatch) => {
        const response = await searchForCalculationsService(searchRequest);
        dispatch({
            type: ViewSpecificationResultsActionTypes.GET_ADDITIONALCALCULATIONS,
            payload: response.data as CalculationSearchResponse
        });
    }
};
