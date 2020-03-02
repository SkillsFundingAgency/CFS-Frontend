import {SpecificationState} from "../../states/SpecificationState";
import {reduceSpecificationState} from "../../reducers/specificationReducer";
import {SpecificationActionTypes} from "../../actions/SpecificationActions";
import {Specification} from "../../types/viewFundingTypes";
import {SpecificationListResults} from "../../types/SpecificationListResults";

const initialState: SpecificationState = {
    specificationListResults : {
        totalPages: 0,
        totalItems: 0,
        totalErrorItems: 0,
        pageSize:0,
        pageNumber:0,
        items:[],
        facets:[]
    }
};

describe('SpecificationReducer ', () => {
    it('should handle GET_ALLSPECIFICATIONS', () => {
        const testDate = new Date();

        const expectedState = {
            specificationListResults: {
                totalPages: 10,
                totalItems: 500,
                totalErrorItems: 0,
                pageSize:50,
                pageNumber:1,
                items: [{status: "Draft", name: "Item1", lastUpdatedDate: testDate, id:"",
                    fundingStreamNames:[],
                    fundingStreamIds:[],
                    fundingPeriodName:"",
                    fundingPeriodId:"",
                    description:""}, {}],
                facets:[],
            }
        };
        expect(reduceSpecificationState(initialState, {
                type: SpecificationActionTypes.GET_ALLSPECIFICATIONS,
                payload: {
                    totalPages: 10,
                    totalItems: 500,
                    totalErrorItems: 0,
                    pageSize:50,
                    pageNumber:1,
                    items: [{status: "Draft", name: "Item1", lastUpdatedDate: testDate, id:"",
                    fundingStreamNames:[],
                    fundingStreamIds:[],
                    fundingPeriodName:"",
                    fundingPeriodId:"",
                    description:""}, {}],
                    facets:[],
                } as SpecificationListResults
            })).toEqual(expectedState);

    });
});

