import {DatasetState} from "../states/DatasetState";
import {DatasetActions, DatasetActionTypes} from "../actions/DatasetActions";

const initialState: DatasetState = {
    dataSchemas: [{
        name: "",
        id:"",
        description: "",
        tableDefinitions: []
    }]
};

export function reduceDatasetState(state: DatasetState = initialState, action: DatasetActions): DatasetState {
    switch (action.type) {
        case DatasetActionTypes.GET_DATASETSCHEMAS:
            return {...state, dataSchemas: action.payload};
        default:
            return state;
    }
}