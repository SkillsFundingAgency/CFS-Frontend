import {DatasetState} from "../../states/DatasetState";
import {reduceDatasetState} from "../../reducers/datasetReducer";
import {DatasetActionTypes} from "../../actions/DatasetActions";

const initialState: DatasetState = {
    dataSchemas:  [],
};

describe('ViewSpecificationReducer ', () => {
    it('should handle GET_DATASETSCHEMAS', () => {
        const expectedState = {};
        expect(
            reduceDatasetState(initialState, {
                type: DatasetActionTypes.GET_DATASETSCHEMAS,
            })
        ).toEqual(expectedState);
    });
});

