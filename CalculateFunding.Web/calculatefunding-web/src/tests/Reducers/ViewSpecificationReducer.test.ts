import {reduceViewSpecificationState} from "../../reducers/viewSpecificationReducer";
import {ViewSpecificationActionTypes} from "../../actions/ViewSpecificationsActions";
import {ViewSpecificationState} from "../../states/ViewSpecificationState";
import {FundingStructureType} from "../../types/FundingStructureItem";
import {FundingLineStructureActionTypes} from "../../actions/FundingLineStructureAction";

const initialState: ViewSpecificationState = {
    additionalCalculations: {
        calculations: [],
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        pagerState: {
            currentPage: 0,
            displayNumberOfPages: 0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0
        },
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0
    },
    specification: {
        name: "",
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [{
            name: "",
            id: ""
        }],
        id: "",
        isSelectedForFunding: false,
        providerVersionId: ""
    },
    datasets: {
        content: [],
        statusCode: 0
    },
    releaseTimetable: {
        navisionDate: {
            day: "",
            month: "",
            year: "",
            time: ""
        },
        releaseDate: {
            day: "",
            month: "",
            year: "",
            time: ""
        }
    }
};

describe('ViewSpecificationReducer ', () => {
    it('should handle GET_ADDITIONALCALCULATIONS', () => {
        const expectedState = {
            "additionalCalculations": {
                "calculations": [],
                "currentPage": 1,
                "endItemNumber": 1,
                "facets": [],
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 2,
                    "lastPage": 2,
                    "nextPage": 2,
                    "pages": [
                        2,
                    ],
                    "previousPage": 0,
                },
                "startItemNumber": 1,
                "totalErrorResults": 0,
                "totalResults": 1,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "releaseTimetable": {
                "navisionDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
                "releaseDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
            },
            "specification": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [
                    {
                        "id": "",
                        "name": "",
                    },
                ],
                "id": "",
                "isSelectedForFunding": false,
                "name": "",
                "providerVersionId": "",
            },
        };
        expect(
            reduceViewSpecificationState(initialState, {
                type: ViewSpecificationActionTypes.GET_ADDITIONALCALCULATIONS,
                payload: {
                    totalResults: 1,
                    endItemNumber: 1,
                    startItemNumber: 1,
                    pagerState: {
                        previousPage: 0,
                        pages: [2],
                        nextPage: 2,
                        displayNumberOfPages: 2,
                        lastPage: 2,
                        currentPage: 1
                    },
                    totalErrorResults: 0,
                    facets: [],
                    currentPage: 1,
                    calculations: [],
                }
            })
        ).toEqual(expectedState);

    });

    it('should handle GET_SPECIFICATION', () => {
        const expectedState = {
            "additionalCalculations": {
                "calculations": [],
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "releaseTimetable": {
                "navisionDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
                "releaseDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
            },
            "specification": {
                "approvalStatus": "Draft",
                "description": "TEST-SPEC-DESCRIPTION",
                "fundingPeriod": {
                    "id": "TEST-FUNDING-ID",
                    "name": "TEST-FUNDING-PERIOD",
                },
                "fundingStreams": [],
                "id": "TEST-SPEC_ID",
                "isSelectedForFunding": true,
                "name": "TEST-SPEC-NAME",
                "providerVersionId": "PROVIDER-VERSION-ID",
            },
        };
        expect(
            reduceViewSpecificationState(initialState, {
                type: ViewSpecificationActionTypes.GET_SPECIFICATION,
                payload: {
                    fundingStreams: [],
                    fundingPeriod: {
                        name: "TEST-FUNDING-PERIOD",
                        id: "TEST-FUNDING-ID"
                    },
                    name: "TEST-SPEC-NAME",
                    providerVersionId: "PROVIDER-VERSION-ID",
                    id: "TEST-SPEC_ID",
                    approvalStatus: "Draft",
                    isSelectedForFunding: true,
                    description: "TEST-SPEC-DESCRIPTION"
                }
            })
        ).toEqual(expectedState);
    });

    it('should handle GET_DATASETS', () => {
        const expectedState = {
            "additionalCalculations": {
                "calculations": [],
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [
                    {
                        "definition": {
                            "description": "Test definition description",
                            "id": "Test definition id",
                            "name": "Test definition name",
                        },
                        "id": "Test dataset",
                        "isProviderData": false,
                        "name": "Test name",
                        "relationshipDescription": "Test relationship description",
                    },
                ],
                "statusCode": 200,
            },
            "releaseTimetable": {
                "navisionDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
                "releaseDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
            },
            "specification": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [
                    {
                        "id": "",
                        "name": "",
                    },
                ],
                "id": "",
                "isSelectedForFunding": false,
                "name": "",
                "providerVersionId": "",
            },
        };

        expect(
            reduceViewSpecificationState(initialState, {
                type: ViewSpecificationActionTypes.GET_DATASETS,
                payload: {
                    statusCode: 200, content: [{
                        id: "Test dataset",
                        definition: {
                            name: "Test definition name",
                            description: "Test definition description",
                            id: "Test definition id"
                        },
                        relationshipDescription: "Test relationship description",
                        name: "Test name",
                        isProviderData: false,
                    }]
                }
            })
        ).toEqual(expectedState);
    });

    it('should handle GET_RELEASETIMETABLE', () => {
        const expectedState = {
                "additionalCalculations": {
                    "calculations": [],
                    "currentPage": 0,
                    "endItemNumber": 0,
                    "facets": [],
                    "pagerState": {
                        "currentPage": 0,
                        "displayNumberOfPages": 0,
                        "lastPage": 0,
                        "nextPage": 0,
                        "pages": [],
                        "previousPage": 0,
                    },
                    "startItemNumber": 0,
                    "totalErrorResults": 0,
                    "totalResults": 0,
                },
                "datasets": {
                    "content": [],
                    "statusCode": 0,
                },
                "releaseTimetable": {
                    "navisionDate": {
                        "day": "26",
                        "month": "10",
                        "time": "01:20",
                        "year": "1985",
                    },
                    "releaseDate": {
                        "day": "21",
                        "month": "1",
                        "time": "03:56",
                        "year": "2015",
                    },
                },
                "specification": {
                    "approvalStatus": "",
                    "description": "",
                    "fundingPeriod": {
                        "id": "",
                        "name": "",
                    },
                    "fundingStreams": [
                        {
                            "id": "",
                            "name": "",
                        },
                    ],
                    "id": "",
                    "isSelectedForFunding": false,
                    "name": "",
                    "providerVersionId": "",
                },
            }
        ;

        expect(
            reduceViewSpecificationState(initialState, {
                type: ViewSpecificationActionTypes.GET_RELEASETIMETABLE,
                payload: {
                    releaseDate: {
                        time: "03:56",
                        day: "21",
                        month: "1",
                        year: "2015"
                    },
                    navisionDate: {
                        time: "01:20",
                        day: "26",
                        month: "10",
                        year: "1985"
                    }
                }
            })
        ).toEqual(expectedState);
    });

    it('should handle CONFIRM_TIMETABLECHANGES', () => {
        const expectedState =   {
            "additionalCalculations":  {
                "calculations":  [],
                "currentPage": 0,
                "endItemNumber": 0,
                "facets":  [],
                "pagerState":  {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages":  [],
                    "previousPage": 0,
                },
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets":  {
                "content":  [],
                "statusCode": 0,
            },
            "releaseTimetable":  {
                "navisionDate":  {
                    "day": "26",
                    "month": "10",
                    "time": "01:20",
                    "year": "1985",
                },
                "releaseDate":  {
                    "day": "21",
                    "month": "1",
                    "time": "03:56",
                    "year": "2015",
                },
            },
            "specification":  {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod":  {
                    "id": "",
                    "name": "",
                },
                "fundingStreams":  [
                    {
                        "id": "",
                        "name": "",
                    },
                ],
                "id": "",
                "isSelectedForFunding": false,
                "name": "",
                "providerVersionId": "",
            },
        };

        expect(
            reduceViewSpecificationState(initialState, {
                type: ViewSpecificationActionTypes.CONFIRM_TIMETABLECHANGES,
                payload: {
                    releaseDate: {
                        time: "03:56",
                        day: "21",
                        month: "1",
                        year: "2015"
                    },
                    navisionDate: {
                        time: "01:20",
                        day: "26",
                        month: "10",
                        year: "1985"
                    }
                }
            })
        ).toEqual(expectedState);
    });

    it('should handle GET_FUNDINGLINESTRUCTURE', () => {
        const expectedState = {
            "additionalCalculations": {
                "calculations": [],
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStructureResult": [
                {
                    "calculationId": "test calculationId",
                    "calculationPublishStatus": "",
                    "fundingStructureItems": [],
                    "level": 1,
                    "name": "test funding line",
                    "parentName": "",
                    "type": 1,
                },
            ],
            "releaseTimetable": {
                "navisionDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
                "releaseDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
            },
            "specification": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [
                    {
                        "id": "",
                        "name": "",
                    },
                ],
                "id": "",
                "isSelectedForFunding": false,
                "name": "",
                "providerVersionId": "",
            },
        };

        expect(
            reduceViewSpecificationState(initialState, {
                type: ViewSpecificationActionTypes.GET_FUNDINGLINESTRUCTURE,
                payload: [{
                    level : 1,
                    name : "test funding line",
                    calculationId : "test calculationId",
                    calculationPublishStatus : "",
                    type : FundingStructureType.calculation,
                    parentName: "",
                    fundingStructureItems: []
                }]
            })
        ).toEqual(expectedState);
    });

    it('should handle GET_PROFILEVARIATIONPOINTER', () => {
        const expectedState =      {
            "additionalCalculations":  {
                "calculations":  [],
                "currentPage": 0,
                "endItemNumber": 0,
                "facets":  [],
                "pagerState":  {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages":  [],
                    "previousPage": 0,
                },
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets":  {
                "content":  [],
                "statusCode": 0,
            },
            "profileVariationPointerResult":  [
                {
                    "fundingLineId": "testFundingLineId",
                    "fundingStreamId": "testFundingStreamId",
                    "occurrence": 55,
                    "periodType": "testPeriodType",
                    "typeValue": "testTypeValue",
                    "year": 2022,
                },
            ],
            "releaseTimetable":  {
                "navisionDate":  {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
                "releaseDate":  {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
            },
            "specification":  {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod":  {
                    "id": "",
                    "name": "",
                },
                "fundingStreams":  [
                    {
                        "id": "",
                        "name": "",
                    },
                ],
                "id": "",
                "isSelectedForFunding": false,
                "name": "",
                "providerVersionId": "",
            },
        };

        expect(
            reduceViewSpecificationState(initialState, {
                type: ViewSpecificationActionTypes.GET_PROFILEVARIATIONPOINTER,
                payload:
                    [
                        {
                            fundingStreamId: "testFundingStreamId",
                            fundingLineId: "testFundingLineId",
                            periodType: "testPeriodType",
                            typeValue: "testTypeValue",
                            year: 2022,
                            occurrence: 55,
                        }
                    ]
            })
        ).toEqual(expectedState);
    });

    it('should handle SET_PROFILEVARIATIONPOINTER', () => {
        const expectedState =      {
            "additionalCalculations":  {
                "calculations":  [],
                "currentPage": 0,
                "endItemNumber": 0,
                "facets":  [],
                "pagerState":  {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages":  [],
                    "previousPage": 0,
                },
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets":  {
                "content":  [],
                "statusCode": 0,
            },
            "profileVariationPointerResult":  [
                {
                    "fundingLineId": "testFundingLineId",
                    "fundingStreamId": "testFundingStreamId",
                    "occurrence": 55,
                    "periodType": "testPeriodType",
                    "typeValue": "testTypeValue",
                    "year": 2022,
                },
            ],
            "releaseTimetable":  {
                "navisionDate":  {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
                "releaseDate":  {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
            },
            "specification":  {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod":  {
                    "id": "",
                    "name": "",
                },
                "fundingStreams":  [
                    {
                        "id": "",
                        "name": "",
                    },
                ],
                "id": "",
                "isSelectedForFunding": false,
                "name": "",
                "providerVersionId": "",
            },
        };

        expect(
            reduceViewSpecificationState(initialState, {
                type: ViewSpecificationActionTypes.SET_PROFILEVARIATIONPOINTER,
                payload:
                    [
                        {
                            fundingStreamId: "testFundingStreamId",
                            fundingLineId: "testFundingLineId",
                            periodType: "testPeriodType",
                            typeValue: "testTypeValue",
                            year: 2022,
                            occurrence: 55,
                        }
                    ]
            })
        ).toEqual(expectedState);
    });

    it('should handle CHANGE_FUNDINGLINESTATUS', () => {
        const expectedState = {
            "additionalCalculations": {
                "calculations": [],
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStatusResult": "test specificationId",
            "releaseTimetable": {
                "navisionDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
                "releaseDate": {
                    "day": "",
                    "month": "",
                    "time": "",
                    "year": "",
                },
            },
            "specification": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [
                    {
                        "id": "",
                        "name": "",
                    },
                ],
                "id": "",
                "isSelectedForFunding": false,
                "name": "",
                "providerVersionId": "",
            },
        };

        expect(
            reduceViewSpecificationState(initialState, {
                type: FundingLineStructureActionTypes.CHANGE_FUNDINGLINESTATUS,
                payload: "test specificationId"
            })
        ).toEqual(expectedState);
    });
});

