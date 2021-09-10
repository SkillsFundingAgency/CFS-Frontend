import axios from "axios";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";

import { IStoreState } from "../reducers/rootReducer";
import { FeatureFlag } from "../types/FeatureFlag";

export enum FeatureFlagsActionTypes {
  GET_FEATUREFLAGS = "getFeatureFlags",
}

export interface GetFeatureFlagsAction extends Action<string> {
  type: FeatureFlagsActionTypes.GET_FEATUREFLAGS;
  payload: Array<FeatureFlag>;
}

export const getFeatureFlags: ActionCreator<
  ThunkAction<Promise<void>, IStoreState, unknown, GetFeatureFlagsAction>
> = () => {
  return async (dispatch) => {
    const response = await axios("/api/featureflags", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch({
      type: FeatureFlagsActionTypes.GET_FEATUREFLAGS,
      payload: response.data as FeatureFlag[],
    });
  };
};
