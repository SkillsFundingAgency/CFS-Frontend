import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {ProviderSummary, ProviderTransactionSummary} from "../types/ProviderSummary";
import {getProviderByIdAndVersionService, getProviderTransactionsService, getProfilingService} from "../services/providerService";
import {ProviderState} from "../states/ProviderState";
import {Profiling} from "../types/Profiling";

export enum ProviderActionTypes {
    GET_PROVIDERBYIDANDVERSION = 'getProviderByIdAndVersion',
    GET_PUBLISHEDPROVIDERTRANSACTIONS = 'getPublishedProviderTransactions',
    GET_PROFILING = 'getProfiling'
}

export interface GetProvidersByIdAndVersion {
    type: ProviderActionTypes.GET_PROVIDERBYIDANDVERSION
    payload: ProviderSummary
}

export interface GetPublishedProviderTransactions {
    type: ProviderActionTypes.GET_PUBLISHEDPROVIDERTRANSACTIONS
    payload: ProviderTransactionSummary
}

export interface GetProfiling {
    type: ProviderActionTypes.GET_PROFILING
    payload: Profiling
}

export type ProviderActions = GetProvidersByIdAndVersion | GetPublishedProviderTransactions | GetProfiling;

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

export const getProfiling: ActionCreator<ThunkAction<Promise<any>, ProviderState, null, ProviderActions>> = (fundingStreamId: string, fundingPeriodId: string, providerId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await getProfilingService(fundingStreamId, fundingPeriodId, providerId);
        dispatch({
            type: ProviderActionTypes.GET_PROFILING,
            payload: response.data as Profiling
        });
    }
};
