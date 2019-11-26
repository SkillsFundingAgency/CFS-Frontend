import axios from 'axios';
import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {IFundingLineStructureState} from "../states/IFundingLineStructureState";
import {IFundingStructureItem} from "../types/FundingStructureItem";
import {Specification} from "../types/viewFundingTypes";

export enum FundingLineStructureActionTypes {
    GET_FUNDINGLINESTRUCTURE = 'getFundingLineStructure',
    GET_SPECIFICATIONBYID = 'getSpecificationById'
}

export interface IGetFundingLineStructureAction {
    type: FundingLineStructureActionTypes.GET_FUNDINGLINESTRUCTURE;
    payload: IFundingStructureItem[]
}

export interface IGetSpecificationAction {
    type: FundingLineStructureActionTypes.GET_SPECIFICATIONBYID;
    payload: Specification
}

export type FundingLineStructureAction =
    IGetSpecificationAction
    | IGetFundingLineStructureAction;

export const getFundingLineStructure:
    ActionCreator<ThunkAction<Promise<any>, IFundingLineStructureState, null, FundingLineStructureAction>> = () => {
    return async (dispatch: Dispatch) => {
        // Workaround for getting specificationId and FundingStreamId until final solution
        const params = new URLSearchParams(window.location.search);
        const specificationIdQuery = params.get('specificationId');
        const fundingStreamIdQuery = params.get('fundingStreamId');

        const response = await axios(`api/fundingstructures/specifications/${specificationIdQuery}/fundingstreams/${fundingStreamIdQuery}`, {
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
    ActionCreator<ThunkAction<Promise<any>, IFundingLineStructureState, null, FundingLineStructureAction>> = () => {
    return async (dispatch: Dispatch) => {
        const params = new URLSearchParams(window.location.search);
        const specificationIdQuery = params.get('specificationId');
        const response = await axios(`api/specs/specification-summary-by-id/${specificationIdQuery}`, {
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