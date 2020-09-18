import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {Calculation} from "../types/CalculationSummary";
import {ViewCalculationState} from "../states/ViewCalculationState";
import {getCalculationByIdService, getCalculationProvidersService} from "../services/calculationService";
import {CalculationProviderResultList} from "../types/CalculationProviderResult";
import {CalculationProviderSearchRequestViewModel} from "../types/calculationProviderSearchRequestViewModel";

export enum ViewCalculationResultsActionTypes {
    GET_CALCULATIONRESULTS = 'getCalculationResults',
    GET_CALCULATIONBYID='getCalculationById'
}

export interface GetCalculationResults {
    type: ViewCalculationResultsActionTypes.GET_CALCULATIONRESULTS;
    payload: CalculationProviderResultList
}

export interface GetCalculationById {
    type: ViewCalculationResultsActionTypes.GET_CALCULATIONBYID;
    payload: Calculation
}

export type ViewCalculationResultsActions = GetCalculationResults | GetCalculationById;

export const getCalculationResults: ActionCreator<ThunkAction<Promise<any>, ViewCalculationState, null, ViewCalculationResultsActions>> = (calculationProviderSearchRequestViewModel:CalculationProviderSearchRequestViewModel) => {
    return async (dispatch: Dispatch) => {
        const response = await getCalculationProvidersService(calculationProviderSearchRequestViewModel);

        dispatch({
            type: ViewCalculationResultsActionTypes.GET_CALCULATIONRESULTS,
            payload: response.data as CalculationProviderResultList
        });
    }
};

export const getCalculationById: ActionCreator<ThunkAction<Promise<any>, ViewCalculationState, null, ViewCalculationResultsActions>> = (calculationId:string)=>{
    return async (dispatch: Dispatch) =>
    {
        const response = await getCalculationByIdService(calculationId);

        dispatch({
            type: ViewCalculationResultsActionTypes.GET_CALCULATIONBYID,
            payload: response.data as Calculation
        })
    }
};