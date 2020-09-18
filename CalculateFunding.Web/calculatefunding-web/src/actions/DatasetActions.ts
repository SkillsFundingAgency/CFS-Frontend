import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {DatasetState} from "../states/DatasetState";
import {DatasetDefinitions} from "../types/DatasetDefinitions";
import {getDatasetDefinitionsService} from "../services/datasetService";

export enum DatasetActionTypes {
    GET_DATASETSCHEMAS = 'getDatasetSchema',
}

export interface GetDataSchemaAction {
    type: DatasetActionTypes.GET_DATASETSCHEMAS;
    payload: DatasetDefinitions[]
}

export type DatasetActions = GetDataSchemaAction;

export const getDatasetSchema:
    ActionCreator<ThunkAction<Promise<any>, DatasetState, null, DatasetActions>> =
    () => {
        return async (dispatch: Dispatch) => {
            const response = await getDatasetDefinitionsService();
            dispatch({
                type: DatasetActionTypes.GET_DATASETSCHEMAS,
                payload: response.data as DatasetDefinitions[]
            });
        }
    };