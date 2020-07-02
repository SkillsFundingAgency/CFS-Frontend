import {ActionCreator} from "redux";
import {ThunkAction} from "redux-thunk";
import axios from "axios"
import {IUserPermissionsState} from "../states/IUserPermissionsState";
import {FundingStreamPermissions} from "../types/FundingStreamPermissions";

export enum UserPermissionsActionTypes {
    GET_FUNDING_STREAM_PERMISSIONS = 'getFundingStreamPermissions'
}

export type UserPermissionsActions = IFundingStreamPermissionsAction;

export interface IFundingStreamPermissionsAction {
    type: UserPermissionsActionTypes.GET_FUNDING_STREAM_PERMISSIONS;
    payload: FundingStreamPermissions[]
}

export function fundingStreamPermissionsAction(fundingStreamPermissions: FundingStreamPermissions[]): IFundingStreamPermissionsAction {
    return {
        type: UserPermissionsActionTypes.GET_FUNDING_STREAM_PERMISSIONS,
        payload: fundingStreamPermissions
    };
}

export const getUserFundingStreamPermissions: ActionCreator<ThunkAction<Promise<any>, IUserPermissionsState, null, UserPermissionsActions>> = () => {
    return async (dispatch, getState) => {
        const state = getState();
        
        if (state.fundingStreamPermissions && state.fundingStreamPermissions.length > 0) {
            return;
        }

        const response = await axios(`/api/users/permissions/fundingstreams`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch({
            type: UserPermissionsActionTypes.GET_FUNDING_STREAM_PERMISSIONS,
            payload: response.data as FundingStreamPermissions[]
        });
    }
};