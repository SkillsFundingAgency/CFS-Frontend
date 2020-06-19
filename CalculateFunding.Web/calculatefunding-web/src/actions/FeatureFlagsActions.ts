import axiosInstance from "../services/axiosInterceptor"
import {ThunkAction} from "redux-thunk";
import {ActionCreator, Action} from "redux";
import {FeatureFlag} from "../types/FeatureFlag";
import { IStoreState } from '../reducers/rootReducer';

export enum FeatureFlagsActionTypes {
    GET_FEATUREFLAGS = 'getFeatureFlags'
}

export interface GetFeatureFlagsAction extends Action<string> {
    type: FeatureFlagsActionTypes.GET_FEATUREFLAGS,
    payload: Array<FeatureFlag>
}

export const getFeatureFlags: ActionCreator<ThunkAction<Promise<void>, IStoreState, unknown, GetFeatureFlagsAction>> = () => {
    return async dispatch => {
        const response = await axiosInstance('/api/featureflags', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        dispatch({
            type: FeatureFlagsActionTypes.GET_FEATUREFLAGS,
            payload: response.data as FeatureFlag[]
        });
    }
};