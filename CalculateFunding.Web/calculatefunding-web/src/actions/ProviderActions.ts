import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {ProviderSummary, ProviderTransactionSummary} from "../types/ProviderSummary";
import {getProviderByIdAndVersionService, getProviderTransactionsService} from "../services/providerService";
import {ProviderState} from "../states/ProviderState";

export enum ProviderActionTypes {
    GET_PROVIDERBYIDANDVERSION = 'getProviderByIdAndVersion',
    GET_PUBLISHEDPROVIDERTRANSACTIONS = 'getPublishedProviderTransactions'
}

export interface GetProvidersByIdAndVersion {
    type: ProviderActionTypes.GET_PROVIDERBYIDANDVERSION
    payload: ProviderSummary
}

export interface GetPublishedProviderTransactions {
    type: ProviderActionTypes.GET_PUBLISHEDPROVIDERTRANSACTIONS
    payload: ProviderTransactionSummary
}

export type ProviderActions = GetProvidersByIdAndVersion | GetPublishedProviderTransactions;

export const getProviderByIdAndVersion: ActionCreator<ThunkAction<Promise<any>, ProviderState, null, ProviderActions>> = (providerId: string, providerVersionId:string) => {
    return async (dispatch: Dispatch) => {
        const response = await getProviderByIdAndVersionService(providerId, providerVersionId);
        dispatch({
            type: ProviderActionTypes.GET_PROVIDERBYIDANDVERSION,
            payload: response.data as ProviderSummary
        });
    }
};
export const getPublishedProviderTransactions: ActionCreator<ThunkAction<Promise<any>, ProviderState, null, ProviderActions>> = (providerId: string, specificationId:string) => {
    return async (dispatch: Dispatch) => {
        const response = await getProviderTransactionsService(specificationId, providerId);
        dispatch({
            type: ProviderActionTypes.GET_PUBLISHEDPROVIDERTRANSACTIONS,
            payload: response.data as ProviderTransactionSummary
        });
    }
};