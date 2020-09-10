import {reduceViewSpecificationState} from "../../reducers/viewSpecificationReducer";
import {ViewSpecificationActionTypes} from "../../actions/ViewSpecificationsActions";
import {ViewSpecificationState} from "../../states/ViewSpecificationState";
import {FundingStructureType} from "../../types/FundingStructureItem";
import {FundingLineStructureActionTypes} from "../../actions/FundingLineStructureAction";
import React from "react";

const initialState: ViewSpecificationState = {
    additionalCalculations: {
        totalCount: 0,
        results: [],
        totalResults: 0,
        totalErrorResults: 0,
        currentPage: 0,
        lastPage: 0,
        startItemNumber: 0,
        endItemNumber: 0,
        pagerState: {
            displayNumberOfPages: 0,
            previousPage: 0,
            nextPage: 0,
            lastPage: 0,
            pages: [],
            currentPage: 0,
        },
        facets: [],
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
    },
    fundingLineStructureResult: [],
    fundingLineStatusResult: "",
    profileVariationPointerResult: []
};

describe('ViewSpecificationReducer ', () => {
    it('should handle GET_ADDITIONALCALCULATIONS', () => {
        const expectedState = {
            "additionalCalculations": {
                "currentPage": 0,
                "endItemNumber": 1,
                "facets": [],
                "lastPage": 0,
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
                "results": [],
                "startItemNumber": 1,
                "totalCount": 1,
                "totalErrorResults": 0,
                "totalResults": 1,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStatusResult": "",
            "fundingLineStructureResult": [],
            "profileVariationPointerResult": [],
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
                    totalCount: 1,
                    results: [],
                    totalResults: 1,
                    totalErrorResults: 0,
                    currentPage: 0,
                    lastPage: 0,
                    startItemNumber: 1,
                    endItemNumber: 1,
                    pagerState: {
                        displayNumberOfPages: 2,
                        previousPage: 0,
                        nextPage: 2,
                        lastPage: 2,
                        pages: [2],
                        currentPage: 1,
                    },
                    facets: [],
                }
            })
        ).toEqual(expectedState);

    });

    it('should handle GET_SPECIFICATION', () => {
        const expectedState = {
            "additionalCalculations": {
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "lastPage": 0,
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "results": [],
                "startItemNumber": 0,
                "totalCount": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStatusResult": "",
            "fundingLineStructureResult": [],
            "profileVariationPointerResult": [],
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
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "lastPage": 0,
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "results": [],
                "startItemNumber": 0,
                "totalCount": 0,
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
            "fundingLineStatusResult": "",
            "fundingLineStructureResult": [],
            "profileVariationPointerResult": [],
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
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "lastPage": 0,
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "results": [],
                "startItemNumber": 0,
                "totalCount": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStatusResult": "",
            "fundingLineStructureResult": [],
            "profileVariationPointerResult": [],
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
        };

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
        const expectedState = {
            "additionalCalculations": {
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "lastPage": 0,
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "results": [],
                "startItemNumber": 0,
                "totalCount": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStatusResult": "",
            "fundingLineStructureResult": [],
            "profileVariationPointerResult": [],
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
        const expectedState =
            {
                "additionalCalculations": {
                    "currentPage": 0,
                    "endItemNumber": 0,
                    "facets": [],
                    "lastPage": 0,
                    "pagerState": {
                        "currentPage": 0,
                        "displayNumberOfPages": 0,
                        "lastPage": 0,
                        "nextPage": 0,
                        "pages": [],
                        "previousPage": 0,
                    },
                    "results": [],
                    "startItemNumber": 0,
                    "totalCount": 0,
                    "totalErrorResults": 0,
                    "totalResults": 0,
                },
                "datasets": {
                    "content": [],
                    "statusCode": 0,
                },
                "fundingLineStatusResult": "",
                "fundingLineStructureResult": [
                    {
                        "calculationId": "test calculationId",
                        "calculationPublishStatus": "",
                        "expanded": false,
                        "fundingStructureItems": [],
                        "level": 1,
                        "name": "test funding line",
                        "parentName": "",
                        "type": "Calculation",
                    },
                ],
                "profileVariationPointerResult": [],
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
                    type : FundingStructureType.Calculation,
                    fundingStructureItems: [],
                    parentName: "",
                    expanded: false
                }]
            })
        ).toEqual(expectedState);
    });

    it('should handle GET_PROFILEVARIATIONPOINTER', () => {
        const expectedState = {
            "additionalCalculations": {
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "lastPage": 0,
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "results": [],
                "startItemNumber": 0,
                "totalCount": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStatusResult": "",
            "fundingLineStructureResult": [],
            "profileVariationPointerResult": [
                {
                    "fundingLineId": "testFundingLineId",
                    "fundingStreamId": "testFundingStreamId",
                    "occurrence": 55,
                    "periodType": "testPeriodType",
                    "typeValue": "testTypeValue",
                    "year": 2022,
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
        const expectedState = {
            "additionalCalculations": {
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "lastPage": 0,
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "results": [],
                "startItemNumber": 0,
                "totalCount": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStatusResult": "",
            "fundingLineStructureResult": [],
            "profileVariationPointerResult": [
                {
                    "fundingLineId": "testFundingLineId",
                    "fundingStreamId": "testFundingStreamId",
                    "occurrence": 55,
                    "periodType": "testPeriodType",
                    "typeValue": "testTypeValue",
                    "year": 2022,
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
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "lastPage": 0,
                "pagerState": {
                    "currentPage": 0,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "results": [],
                "startItemNumber": 0,
                "totalCount": 0,
                "totalErrorResults": 0,
                "totalResults": 0,
            },
            "datasets": {
                "content": [],
                "statusCode": 0,
            },
            "fundingLineStatusResult": "test specificationId",
            "fundingLineStructureResult": [],
            "profileVariationPointerResult": [],
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

