import {FundingStreamPermissions} from "../types/FundingStreamPermissions";
import {ActionCreator} from "redux";
import {ThunkAction} from "redux-thunk";
import axios from "axios";
import {IUserState} from "../states/IUserState";
import {Identity} from "../types/Identity";

export const hasConfirmedSkillsStateKey = "hasConfirmedSkillsState";

export enum UserActionEvent {
    GET_USER = 'userActionGetUser',
    CREATE_ACCOUNT = 'userActionCreateAccount',
    GET_FUNDING_STREAM_PERMISSIONS = 'getFundingStreamPermissions',
    GET_HAS_USER_CONFIRMED_SKILLS = 'getHasUserConfirmedSkills',
    UPDATE_USER_CONFIRMED_SKILLS = 'updateUserConfirmedSkills'
}

export type IUserActions =
    ICreateAccountAction |
    IFundingStreamPermissionsAction |
    IHasUserConfirmedSkillsAction |
    IUpdateUserConfirmedSkillsAction |
    IGetUserAction;

export interface IGetUserAction {
    type: UserActionEvent.GET_USER;
    payload: string
}

export interface ICreateAccountAction {
    type: UserActionEvent.CREATE_ACCOUNT;
    userName: string
}

export interface IFundingStreamPermissionsAction {
    type: UserActionEvent.GET_FUNDING_STREAM_PERMISSIONS;
    payload: FundingStreamPermissions[]
}

export interface IHasUserConfirmedSkillsAction {
    type: UserActionEvent.GET_HAS_USER_CONFIRMED_SKILLS;
    payload: boolean
}

export interface IUpdateUserConfirmedSkillsAction {
    type: UserActionEvent.UPDATE_USER_CONFIRMED_SKILLS;
    payload: boolean
}

export const userActionGetUser: ActionCreator<ThunkAction<Promise<any>, IUserState, null, IUserActions>> = () => {
    return async (dispatch, getState) => {
        if (getState().userName != null && getState().userName !== "") {
            return;
        }
        try {
            const response = await axios(`/api/account/IsAuthenticated`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            });
            const result =  response.data as Identity;
            dispatch({
                type: UserActionEvent.GET_USER,
                payload: result.name?? ""
            });
        }
        catch (ex)
        {
            dispatch({
                type: UserActionEvent.GET_USER,
                payload: ""
            });
        }
    }
};

export const getUserFundingStreamPermissions: ActionCreator<ThunkAction<Promise<any>, IUserState, null, IUserActions>> = () => {
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
            type: UserActionEvent.GET_FUNDING_STREAM_PERMISSIONS,
            payload: response.data as FundingStreamPermissions[]
        });
    }
};

export const getHasUserConfirmedSkills: ActionCreator<ThunkAction<Promise<any>, IUserState, null, IUserActions>> = () => {
    return async (dispatch, getState) => {
        if (getState().hasConfirmedSkills === true) {
            return;
        }
        
        let hasConfirmed: boolean | undefined = undefined;

        const valueInLocalStorage = localStorage.getItem(hasConfirmedSkillsStateKey);
        if (valueInLocalStorage) {
            hasConfirmed = JSON.parse(valueInLocalStorage as string);
        }

        if (hasConfirmed !== true) {
            const response = await axios.get(`/api/account/hasConfirmedSkills`);
            hasConfirmed = response.status === 200;
        }

        dispatch({
            type: UserActionEvent.GET_HAS_USER_CONFIRMED_SKILLS,
            payload: hasConfirmed === true
        });
    }
};

export const updateUserConfirmedSkills: ActionCreator<ThunkAction<Promise<any>, IUserState, null, IUserActions>> = (hasConfirmed: boolean) => {
    return async dispatch => {
        if (hasConfirmed) {
            const response = await axios.put(`/api/account/hasConfirmedSkills`);
            dispatch({
                type: UserActionEvent.UPDATE_USER_CONFIRMED_SKILLS,
                payload: response.status === 200
            });
        } else {
            dispatch({
                type: UserActionEvent.UPDATE_USER_CONFIRMED_SKILLS,
                payload: false
            });
        }
    }
};
