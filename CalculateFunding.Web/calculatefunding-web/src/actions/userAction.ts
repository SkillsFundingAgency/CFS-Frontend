import {FundingStreamPermissions} from "../types/FundingStreamPermissions";
import {ActionCreator} from "redux";
import {ThunkAction} from "redux-thunk";
import axios from "axios";
import {IUserState} from "../states/IUserState";

export const hasConfirmedSkillsStateKey = "hasConfirmedSkillsState";

export enum UserActionTypes {
    CREATE_ACCOUNT = 'userActionCreateAccount',
    GET_FUNDING_STREAM_PERMISSIONS = 'getFundingStreamPermissions',
    GET_HAS_USER_CONFIRMED_SKILLS = 'getHasUserConfirmedSkills',
    UPDATE_USER_CONFIRMED_SKILLS = 'updateUserConfirmedSkills'
}

export type UserActions =
    ICreateAccountAction |
    IFundingStreamPermissionsAction |
    IHasUserConfirmedSkillsAction |
    IUpdateUserConfirmedSkillsAction;

export interface ICreateAccountAction {
    type: UserActionTypes.CREATE_ACCOUNT;
    userName: string
}

export interface IFundingStreamPermissionsAction {
    type: UserActionTypes.GET_FUNDING_STREAM_PERMISSIONS;
    payload: FundingStreamPermissions[]
}

export interface IHasUserConfirmedSkillsAction {
    type: UserActionTypes.GET_HAS_USER_CONFIRMED_SKILLS;
    payload: boolean
}

export interface IUpdateUserConfirmedSkillsAction {
    type: UserActionTypes.UPDATE_USER_CONFIRMED_SKILLS;
    payload: boolean
}

export function createCreateAccountAction(userName: string): ICreateAccountAction {
    return {
        type: UserActionTypes.CREATE_ACCOUNT,
        userName: userName
    };
}

export function fundingStreamPermissionsAction(fundingStreamPermissions: FundingStreamPermissions[]): IFundingStreamPermissionsAction {
    return {
        type: UserActionTypes.GET_FUNDING_STREAM_PERMISSIONS,
        payload: fundingStreamPermissions
    };
}

export function updateUserConfirmedSkillsAction(success: boolean): IUpdateUserConfirmedSkillsAction {
    return {
        type: UserActionTypes.UPDATE_USER_CONFIRMED_SKILLS,
        payload: success
    };
}

export const getUserFundingStreamPermissions: ActionCreator<ThunkAction<Promise<any>, IUserState, null, UserActions>> = () => {
        return async (dispatch, getState) => {
            const state = getState();
            if (state.fundingStreamPermissions && state.fundingStreamPermissions.length > 0) {
                return;
            }
            const response = await axios(`/api/users/permissions/fundingstreams`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            });
            dispatch({
                type: UserActionTypes.GET_FUNDING_STREAM_PERMISSIONS,
                payload: response.data as FundingStreamPermissions[]
            });
        }
    }
;

export const getHasUserConfirmedSkills: ActionCreator<ThunkAction<Promise<any>, IUserState, null, UserActions>> = () => {
    return async (dispatch, getState) => {
        if (getState().hasConfirmedSkills !== undefined) {
            return;
        }
        let hasConfirmed: boolean | undefined = undefined;
        
        const valueInLocalStorage = localStorage.getItem(hasConfirmedSkillsStateKey);
        if (valueInLocalStorage) {
            hasConfirmed = JSON.parse(valueInLocalStorage as string);
        }
        
        if (hasConfirmed === undefined) {
            const response = await axios.get(`/api/account/hasConfirmedSkills`);
            hasConfirmed = response.status === 200;
        }
        
        dispatch({
            type: UserActionTypes.GET_HAS_USER_CONFIRMED_SKILLS,
            payload: hasConfirmed
        });
    }
};

export const updateUserConfirmedSkills: ActionCreator<ThunkAction<Promise<any>, IUserState, null, UserActions>> = () => {
    return async dispatch => {
        const response = await axios.put(`/api/account/hasConfirmedSkills`);
        dispatch({
            type: UserActionTypes.UPDATE_USER_CONFIRMED_SKILLS,
            payload: response.status === 200
        });
    }
};
