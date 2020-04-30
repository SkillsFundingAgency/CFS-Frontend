import {IUserPermissionsState} from "../states/IUserPermissionsState";
import {UserPermissionsActions, UserPermissionsActionTypes} from "../actions/UserPermissionsActions";
import {Reducer} from "redux";

const initialState: IUserPermissionsState = {
    fundingStreamPermissions: []
};

export const reduceUserPermissionsState: Reducer<IUserPermissionsState, UserPermissionsActions> =
    (state: IUserPermissionsState = initialState, action: UserPermissionsActions): IUserPermissionsState => {
        switch (action.type) {
            case UserPermissionsActionTypes.GET_FUNDING_STREAM_PERMISSIONS:
                return {...state, fundingStreamPermissions: action.payload};
            default:
                return state;
        }
    }
