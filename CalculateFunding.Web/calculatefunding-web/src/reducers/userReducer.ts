import {IUserState} from "../states/IUserState";
import {Reducer} from "redux";
import {UserActions, UserActionTypes} from '../actions/userAction';

const initialState: IUserState = {
    isLoggedIn: false,
    userName: '',
    hasConfirmedSkills: undefined,
    fundingStreamPermissions: []
};

export const reduceUserState: Reducer<IUserState, UserActions> =
    (state: IUserState = initialState, action: UserActions): IUserState => {
    switch (action.type) {
        case UserActionTypes.CREATE_ACCOUNT:
            return {...state, isLoggedIn: true, userName: action.userName};
        case UserActionTypes.GET_FUNDING_STREAM_PERMISSIONS:
            return {...state, fundingStreamPermissions: action.payload};
        case UserActionTypes.GET_HAS_USER_CONFIRMED_SKILLS:
            return {...state, hasConfirmedSkills: action.payload};
        case UserActionTypes.UPDATE_USER_CONFIRMED_SKILLS:
            return {...state, hasConfirmedSkills: action.payload};
        default:
            return state;
    }
};