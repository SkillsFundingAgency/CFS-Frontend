import {IUserState} from "../states/IUserState";
import {Reducer} from "redux";
import {hasConfirmedSkillsStateKey, UserActions, UserActionTypes} from '../actions/userAction';

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
                updateSkillsInLocalStorage(action.payload);
                return {...state, hasConfirmedSkills: action.payload};
            case UserActionTypes.UPDATE_USER_CONFIRMED_SKILLS:
                updateSkillsInLocalStorage(action.payload);
                return {...state, hasConfirmedSkills: action.payload};
            default:
                return state;
        }
    };

const updateSkillsInLocalStorage = (hasConfirmedSkills: boolean) => {
    if (hasConfirmedSkills) {
        localStorage.setItem(hasConfirmedSkillsStateKey, hasConfirmedSkills.toString());
    } else {
        localStorage.removeItem(hasConfirmedSkillsStateKey);
    }
};