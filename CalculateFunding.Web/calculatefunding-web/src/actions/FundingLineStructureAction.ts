import axios from 'axios';
import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {IFundingLineStructureState} from "../states/IFundingLineStructureState";
import {IFundingStructureItem} from "../types/FundingStructureItem";
import {Specification} from "../types/viewFundingTypes";
import {PublishStatus, PublishStatusModel} from "../types/PublishStatusModel";

export enum FundingLineStructureActionTypes {
    GET_FUNDINGLINESTRUCTURE = 'getFundingLineStructure',
    GET_SPECIFICATIONBYID = 'getSpecificationById',
    CHANGE_FUNDINGLINESTATUS = 'changeFundingLineState'
}

export interface IGetFundingLineStructureAction {
    type: FundingLineStructureActionTypes.GET_FUNDINGLINESTRUCTURE;
    payload: IFundingStructureItem[]
}

export interface IGetSpecificationAction {
    type: FundingLineStructureActionTypes.GET_SPECIFICATIONBYID;
    payload: Specification
}

export interface ChangeFundingLineStatusAction {
    type: FundingLineStructureActionTypes.CHANGE_FUNDINGLINESTATUS,
    payload: string
}

export type FundingLineStructureAction =
    IGetSpecificationAction
    | IGetFundingLineStructureAction
    | ChangeFundingLineStatusAction;

export const getFundingLineStructure:
    ActionCreator<ThunkAction<Promise<any>, IFundingLineStructureState, null, FundingLineStructureAction>> =
    (specificationId: string, fundingStreamId: string) => {
        return async (dispatch: Dispatch) => {
            const response = await axios(`/api/fundingstructures/specifications/${specificationId}/fundingstreams/${fundingStreamId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            dispatch({
                type: FundingLineStructureActionTypes.GET_FUNDINGLINESTRUCTURE,
                payload: response.data as IFundingStructureItem[]
            });
        }
    };

export const getSpecificationById:
    ActionCreator<ThunkAction<Promise<any>, IFundingLineStructureState, null, FundingLineStructureAction>> = (specificationId:string) => {
    return async (dispatch: Dispatch) => {
        const response = await axios(`/api/specs/specification-summary-by-id/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        dispatch({
            type: FundingLineStructureActionTypes.GET_SPECIFICATIONBYID,
            payload: response.data as Specification
        });
    }
};

export const changeFundingLineState:
    ActionCreator<ThunkAction<Promise<any>, IFundingLineStructureState, null, FundingLineStructureAction>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const publishStatusEditModel: PublishStatusModel = {
            publishStatus: PublishStatus.Approved
        };

        const response = await axios(`api/specs/${specificationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: publishStatusEditModel
        });

        let publishStatusModelResult = response.data as PublishStatusModel;

        dispatch({
            type: FundingLineStructureActionTypes.CHANGE_FUNDINGLINESTATUS,
            payload: publishStatusModelResult.publishStatus as PublishStatus
        });
    }
};