import {IUserState} from "../states/IUserState";
import {Reducer} from "redux";
import {hasConfirmedSkillsStateKey, IUserActions, UserActionEvent} from '../actions/userAction';

const initialState: IUserState = {
    isLoggedIn: false,
    userName: '',
    hasConfirmedSkills: undefined,
    fundingStreamPermissions: []
};

export const reduceUserState: Reducer<IUserState, IUserActions> =
    (state: IUserState = initialState, action: IUserActions): IUserState => {
        switch (action.type) {
            case UserActionEvent.GET_USER:
                return {...state, userName: action.payload};
            case UserActionEvent.CREATE_ACCOUNT:
                return {...state, isLoggedIn: true, userName: action.userName};
            case UserActionEvent.GET_FUNDING_STREAM_PERMISSIONS:
                return {...state, fundingStreamPermissions: action.payload};
            case UserActionEvent.GET_HAS_USER_CONFIRMED_SKILLS:
                updateSkillsInSessionStorage(action.payload);
                return {...state, hasConfirmedSkills: action.payload};
            case UserActionEvent.UPDATE_USER_CONFIRMED_SKILLS:
                updateSkillsInSessionStorage(action.payload);
                return {...state, hasConfirmedSkills: action.payload};
            default:
                return state;
        }
    };

const updateSkillsInSessionStorage = (hasConfirmedSkills: boolean) => {
    if (hasConfirmedSkills) {
        sessionStorage.setItem(hasConfirmedSkillsStateKey, hasConfirmedSkills.toString());
    } else {
        sessionStorage.removeItem(hasConfirmedSkillsStateKey);
    }
};

