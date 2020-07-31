import {ActionCreator, Dispatch} from "redux";
import {ThunkAction} from "redux-thunk";
import {SpecificationState} from "../states/SpecificationState";
import {getAllSpecificationsService} from "../services/specificationService";
import {SpecificationListResults} from "../types/Specifications/SpecificationListResults";
import {SpecificationSearchRequestViewModel} from "../types/SpecificationSearchRequestViewModel";

export enum SpecificationActionTypes {
    GET_ALLSPECIFICATIONS = 'getAllSpecifications'
}

export interface GetAllSpecifications {
    type: SpecificationActionTypes.GET_ALLSPECIFICATIONS
    payload: SpecificationListResults
}

export type SpecificationActions = GetAllSpecifications

export const getAllSpecifications: ActionCreator<ThunkAction<Promise<any>, SpecificationState, null, SpecificationActions>> = (searchRequestViewModel: SpecificationSearchRequestViewModel) => {
    return async (dispatch: Dispatch) => {
        const response = await getAllSpecificationsService(searchRequestViewModel);
        dispatch({
            type: SpecificationActionTypes.GET_ALLSPECIFICATIONS,
            payload: response.data as SpecificationListResults
        });
    }
};