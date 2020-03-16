import {DatasetState} from "../states/DatasetState";
import {DatasetAction, DatasetActionTypes} from "../actions/DatasetActions";

const initialState: DatasetState = {
    dataSchemas: [{
        name: "",
        id:"",
        description: "",
        tableDefinitions: []
    }]
};

export function reduceDatasetState(state: DatasetState = initialState, action: DatasetAction): DatasetState {
    switch (action.type) {
        case DatasetActionTypes.GET_DATASETSCHEMAS:
            return {...state, dataSchemas: action.payload};
        default:
            return state;
    }
}