import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {SelectSpecificationState} from "../states/SelectSpecificationState";
import {FundingPeriod, Specification} from "../types/viewFundingTypes";
import {
    getFundingPeriodsByFundingStreamIdService,
    getFundingStreamsService,
    getSpecificationsByFundingPeriodAndStreamIdService
} from "../services/specificationService";

export enum SelectSpecificationActionTypes {
    GET_FUNDINGSTREAMS = 'getAllFundingStreams',
    GET_FUNDINGPERIODSBYFUNDINGSTREAMID = 'getFundingPeriodsByFundingStreamId',
    GET_SPECIFICATIONSBYFUNDINGPERIODANDSTREAMID = 'getSpecificationsByFundingPeriodAndStreamId'
}

export interface getAllFundingStreams {
    type: SelectSpecificationActionTypes.GET_FUNDINGSTREAMS;
    payload: string[]
}

export interface getAllFundingPeriodsByFundingStreamId {
    type: SelectSpecificationActionTypes.GET_FUNDINGPERIODSBYFUNDINGSTREAMID;
    payload: FundingPeriod[]
}

export interface getAllSpecificationsByFundingPeriodAndStreamId {
    type: SelectSpecificationActionTypes.GET_SPECIFICATIONSBYFUNDINGPERIODANDSTREAMID;
    payload: Specification[]
}

export type SelectSpecificationActions =
      getAllFundingStreams
    | getAllFundingPeriodsByFundingStreamId
    | getAllSpecificationsByFundingPeriodAndStreamId

export const getFundingStreams: ActionCreator<ThunkAction<Promise<any>, SelectSpecificationState, null, SelectSpecificationActions>> =
    () => {
        return async (dispatch: Dispatch) => {
            const response = await getFundingStreamsService();
            dispatch({
                type: SelectSpecificationActionTypes.GET_FUNDINGSTREAMS,
                payload: response.data as string[]
            });
        }
    };

export const getFundingPeriodsByFundingStreamId: ActionCreator<ThunkAction<Promise<any>, SelectSpecificationState, null, SelectSpecificationActions>> =
    (fundingstreamId: string) => {
        return async (dispatch: Dispatch) => {
            const response = await getFundingPeriodsByFundingStreamIdService(fundingstreamId);
            dispatch({
                type: SelectSpecificationActionTypes.GET_FUNDINGPERIODSBYFUNDINGSTREAMID,
                payload: response.data as FundingPeriod[]
            })
        }
    };

export const getSpecificationsByFundingPeriodAndStreamId: ActionCreator<ThunkAction<Promise<any>, SelectSpecificationState, null, SelectSpecificationActions>> =
    (fundingStreamId: string, fundingPeriodId: string) => {
        return async (dispatch: Dispatch) => {
            const response = await getSpecificationsByFundingPeriodAndStreamIdService(fundingStreamId, fundingPeriodId);
            dispatch({
                type: SelectSpecificationActionTypes.GET_SPECIFICATIONSBYFUNDINGPERIODANDSTREAMID,
                payload: response.data as Specification[]
            })
        }
    };