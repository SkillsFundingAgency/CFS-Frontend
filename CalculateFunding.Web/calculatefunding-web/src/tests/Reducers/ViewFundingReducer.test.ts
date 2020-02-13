import {IViewFundingState} from "../../states/IViewFundingState";
import {ProvidersEntity} from "../../types/publishedProvider";
import {ViewFundingActionTypes} from "../../actions/viewFundingAction";
import {reduceViewFundingState} from "../../reducers/viewFundingReducer";

const initialState: IViewFundingState = {
    specifications: {
        name: "",
        id: "",
        templateIds: {
            PSG: ""
        },
        publishedResultsRefreshedAt: null,
        providerVersionId: "",
        lastCalculationUpdatedAt: "",
        fundingStreams: [],
        fundingPeriod: {
            id: "",
            name: ""
        },
        isSelectedForFunding: false,
        description: "",
        approvalStatus: ""
    },
    fundingStreams: [],
    selectedFundingPeriods: [],
    specificationSelected: false,
    publishedProviderResults: {
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        pagerState: {
            currentPage: 1,
            displayNumberOfPages: 0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0,
        },
        providers: [] as ProvidersEntity[],
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0,
        filteredFundingAmount: 0,
        canPublish: false,
        canApprove: false,
        totalFundingAmount: 0,
        totalProvidersToApprove: 0,
        totalProvidersToPublish: 0,
    },
    latestRefreshDateResults: '',
    approveFundingJobId: '',
    releaseFundingJobId: '',
    refreshFundingJobId: '',
    filterTypes: [],
    pageState: "IDLE",
    userPermission: {
        canAdministerFundingStream: false,
        canApproveFunding: false,
        canApproveSpecification: false,
        canChooseFunding: false,
        canCreateQaTests: false,
        canCreateSpecification: false,
        canDeleteCalculations: false,
        canDeleteQaTests: false,
        canDeleteSpecification: false,
        canEditCalculations: false,
        canEditQaTests: false,
        canEditSpecification: false,
        canMapDatasets: false,
        canRefreshFunding: false,
        canReleaseFunding: false,
        specificationId: "",
        userId: ""
    },
    jobCurrentlyInProgress: ''
};

describe('ViewFundingReducer ', () => {
    it('should handle GET_SPECIFICATIONS', () => {
        const expectedState =
            {
                "approveFundingJobId": "",
                "filterTypes": [],
                "fundingStreams": [],
                "jobCurrentlyInProgress": "",
                "latestRefreshDateResults": "",
                "pageState": "IDLE",
                "publishedProviderResults": {
                    "canApprove": false,
                    "canPublish": false,
                    "currentPage": 0,
                    "endItemNumber": 0,
                    "facets": [],
                    "filteredFundingAmount": 0,
                    "pagerState": {
                        "currentPage": 1,
                        "displayNumberOfPages": 0,
                        "lastPage": 0,
                        "nextPage": 0,
                        "pages": [],
                        "previousPage": 0,
                    },
                    "providers": [],
                    "startItemNumber": 0,
                    "totalErrorResults": 0,
                    "totalFundingAmount": 0,
                    "totalProvidersToApprove": 0,
                    "totalProvidersToPublish": 0,
                    "totalResults": 0,
                },
                "refreshFundingJobId": "",
                "releaseFundingJobId": "",
                "selectedFundingPeriods": [],
                "specificationSelected": false,
                "specifications": {
                    "approvalStatus": "Draft",
                    "description": "TEST-SPEC-DESCRIPTION",
                    "fundingPeriod": {
                        "id": "TEST-FUNDING-ID",
                        "name": "TEST-FUNDING-PERIOD",
                    },
                    "fundingStreams": [],
                    "id": "TEST-SPEC_ID",
                    "isSelectedForFunding": true,
                    "lastCalculationUpdatedAt": null,
                    "name": "TEST-SPEC-NAME",
                    "providerVersionId": "PROVIDER-VERSION-ID",
                    "publishedResultsRefreshedAt": null,
                    "templateIds": {
                        "PSG": "",
                    },
                },
                "userPermission": {
                    "canAdministerFundingStream": false,
                    "canApproveFunding": false,
                    "canApproveSpecification": false,
                    "canChooseFunding": false,
                    "canCreateQaTests": false,
                    "canCreateSpecification": false,
                    "canDeleteCalculations": false,
                    "canDeleteQaTests": false,
                    "canDeleteSpecification": false,
                    "canEditCalculations": false,
                    "canEditQaTests": false,
                    "canEditSpecification": false,
                    "canMapDatasets": false,
                    "canRefreshFunding": false,
                    "canReleaseFunding": false,
                    "specificationId": "",
                    "userId": "",
                },
            };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.GET_SPECIFICATIONS,
                payload: {

                    fundingPeriod: {
                        name: "TEST-FUNDING-PERIOD",
                        id: "TEST-FUNDING-ID"
                    },
                    fundingStreams: [],
                    providerVersionId: "PROVIDER-VERSION-ID",
                    description: "TEST-SPEC-DESCRIPTION",
                    isSelectedForFunding: true,
                    approvalStatus: "Draft",
                    publishedResultsRefreshedAt: null,
                    lastCalculationUpdatedAt: null,
                    templateIds: {
                        PSG: ""
                    },
                    id: "TEST-SPEC_ID",
                    name: "TEST-SPEC-NAME"
                }
            })
        ).toEqual(expectedState);
    });

    it('should handle GET_FUNDINGSTREAMS', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [],
            "fundingStreams": [{
                "id": "TEST-FUNDING-STREAM-ID",
                "name": "TEST-FUNDING-STREAM-NAME",
            }],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": false,
                "canPublish": false,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "filteredFundingAmount": 0,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "providers": [],
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalFundingAmount": 0,
                "totalProvidersToApprove": 0,
                "totalProvidersToPublish": 0,
                "totalResults": 0,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.GET_FUNDINGSTREAMS,
                payload:
                    [{
                        id: "TEST-FUNDING-STREAM-ID",
                        name: "TEST-FUNDING-STREAM-NAME"
                    }]
            })
        ).toEqual(expectedState);

    });

    it('should handle GET_SELECTEDFUNDINGPERIODS', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": false,
                "canPublish": false,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "filteredFundingAmount": 0,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "providers": [],
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalFundingAmount": 0,
                "totalProvidersToApprove": 0,
                "totalProvidersToPublish": 0,
                "totalResults": 0,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [
                {
                    "id": "TEST-FUNDING-PERIOD-ID",
                    "name": "TEST-FUNDING-PERIOD-NAME",
                },
            ],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.GET_SELECTEDFUNDINGPERIODS,
                payload:
                    [{
                        id: "TEST-FUNDING-PERIOD-ID",
                        name: "TEST-FUNDING-PERIOD-NAME"
                    }]
            })
        ).toEqual(expectedState);

    });

    it('should handle GET_PUBLISHEDPROVIDERRESULTS', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [
                {
                    "facetValues": [
                        {
                            "count": 1,
                            "name": "",
                        },
                    ],
                    "name": "test filterTypes name",
                },
            ],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": true,
                "canPublish": true,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [
                    {
                        "facetValues": [
                            {
                                "count": 1,
                                "name": "",
                            },
                        ],
                        "name": "test facets name",
                    },
                ],
                "filteredFundingAmount": 4,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 2,
                    "lastPage": 3,
                    "nextPage": 4,
                    "pages": [
                        1,
                        2,
                    ],
                    "previousPage": 6,
                },
                "providers": [
                    {
                        "fundingPeriodId": "test fundingPeriodId",
                        "fundingStatus": "test fundingStatus",
                        "fundingStreamId": "test fundingStreamId",
                        "fundingValue": 1,
                        "id": "test providers id",
                        "localAuthority": "test localAuthority",
                        "providerName": "test providerName",
                        "providerType": "test providerType",
                        "specificationId": "test specificationId",
                        "ukprn": "test ukprn",
                    },
                ],
                "startItemNumber": 1,
                "totalErrorResults": 2,
                "totalFundingAmount": 5,
                "totalProvidersToApprove": 6,
                "totalProvidersToPublish": 7,
                "totalResults": 3,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": true,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.GET_PUBLISHEDPROVIDERRESULTS,
                payload:
                    {
                        currentPage: 0,
                        endItemNumber: 0,
                        facets:
                            [{
                                name: "test facets name",
                                facetValues: [{
                                    name: "",
                                    count: 1
                                }]
                            }],
                        pagerState: {
                            currentPage: 1,
                            displayNumberOfPages: 2,
                            lastPage: 3,
                            nextPage: 4,
                            pages: [1, 2],
                            previousPage: 6
                        },
                        providers: [{
                            fundingPeriodId: "test fundingPeriodId",
                            fundingStatus: "test fundingStatus",
                            fundingStreamId: "test fundingStreamId",
                            fundingValue: 1,
                            id: "test providers id",
                            localAuthority: "test localAuthority",
                            providerName: "test providerName",
                            providerType: "test providerType",
                            specificationId: "test specificationId",
                            ukprn: "test ukprn",
                        }],
                        startItemNumber: 1,
                        totalErrorResults: 2,
                        totalResults: 3,
                        filteredFundingAmount: 4,
                        canPublish: true,
                        canApprove: true,
                        totalFundingAmount: 5,
                        totalProvidersToApprove: 6,
                        totalProvidersToPublish: 7
                    },
                success: true,
                filterTypes: [{
                    name: "test filterTypes name",
                    facetValues: [{
                        name: "",
                        count: 1
                    }]
                }]
            })
        ).toEqual(expectedState);

    });

    it('should handle GET_LATESTREFRESHDATE', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [
                {
                    "facetValues": [
                        {
                            "count": 1,
                            "name": "",
                        },
                    ],
                    "name": "test filterTypes name",
                },
            ],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": true,
                "canPublish": true,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [
                    {
                        "facetValues": [
                            {
                                "count": 1,
                                "name": "",
                            },
                        ],
                        "name": "test facets name",
                    },
                ],
                "filteredFundingAmount": 4,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 2,
                    "lastPage": 3,
                    "nextPage": 4,
                    "pages": [
                        1,
                        2,
                    ],
                    "previousPage": 6,
                },
                "providers": [
                    {
                        "fundingPeriodId": "test fundingPeriodId",
                        "fundingStatus": "test fundingStatus",
                        "fundingStreamId": "test fundingStreamId",
                        "fundingValue": 1,
                        "id": "test providers id",
                        "localAuthority": "test localAuthority",
                        "providerName": "test providerName",
                        "providerType": "test providerType",
                        "specificationId": "test specificationId",
                        "ukprn": "test ukprn",
                    },
                ],
                "startItemNumber": 1,
                "totalErrorResults": 2,
                "totalFundingAmount": 5,
                "totalProvidersToApprove": 6,
                "totalProvidersToPublish": 7,
                "totalResults": 3,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": true,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.GET_PUBLISHEDPROVIDERRESULTS,
                payload:
                    {
                        currentPage: 0,
                        endItemNumber: 0,
                        facets:
                            [{
                                name: "test facets name",
                                facetValues: [{
                                    name: "",
                                    count: 1
                                }]
                            }],
                        pagerState: {
                            currentPage: 1,
                            displayNumberOfPages: 2,
                            lastPage: 3,
                            nextPage: 4,
                            pages: [1, 2],
                            previousPage: 6
                        },
                        providers: [{
                            fundingPeriodId: "test fundingPeriodId",
                            fundingStatus: "test fundingStatus",
                            fundingStreamId: "test fundingStreamId",
                            fundingValue: 1,
                            id: "test providers id",
                            localAuthority: "test localAuthority",
                            providerName: "test providerName",
                            providerType: "test providerType",
                            specificationId: "test specificationId",
                            ukprn: "test ukprn",
                        }],
                        startItemNumber: 1,
                        totalErrorResults: 2,
                        totalResults: 3,
                        filteredFundingAmount: 4,
                        canPublish: true,
                        canApprove: true,
                        totalFundingAmount: 5,
                        totalProvidersToApprove: 6,
                        totalProvidersToPublish: 7
                    },
                success: true,
                filterTypes: [{
                    name: "test filterTypes name",
                    facetValues: [{
                        name: "",
                        count: 1
                    }]
                }]
            })
        ).toEqual(expectedState);
    });

    it('should handle FILTER_PUBLISHEDPROVIDERRESULTS', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": true,
                "canPublish": true,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [
                    {
                        "facetValues": [
                            {
                                "count": 1,
                                "name": "",
                            },
                        ],
                        "name": "test facets name",
                    },
                ],
                "filteredFundingAmount": 4,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 2,
                    "lastPage": 3,
                    "nextPage": 4,
                    "pages": [
                        1,
                        2,
                    ],
                    "previousPage": 6,
                },
                "providers": [
                    {
                        "fundingPeriodId": "test fundingPeriodId",
                        "fundingStatus": "test fundingStatus",
                        "fundingStreamId": "test fundingStreamId",
                        "fundingValue": 1,
                        "id": "test providers id",
                        "localAuthority": "test localAuthority",
                        "providerName": "test providerName",
                        "providerType": "test providerType",
                        "specificationId": "test specificationId",
                        "ukprn": "test ukprn",
                    },
                ],
                "startItemNumber": 1,
                "totalErrorResults": 2,
                "totalFundingAmount": 5,
                "totalProvidersToApprove": 6,
                "totalProvidersToPublish": 7,
                "totalResults": 3,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.FILTER_PUBLISHEDPROVIDERRESULTS,
                payload:
                    {
                        currentPage: 0,
                        endItemNumber: 0,
                        facets:
                            [{
                                name: "test facets name",
                                facetValues: [{
                                    name: "",
                                    count: 1
                                }]
                            }],
                        pagerState: {
                            currentPage: 1,
                            displayNumberOfPages: 2,
                            lastPage: 3,
                            nextPage: 4,
                            pages: [1, 2],
                            previousPage: 6
                        },
                        providers: [{
                            fundingPeriodId: "test fundingPeriodId",
                            fundingStatus: "test fundingStatus",
                            fundingStreamId: "test fundingStreamId",
                            fundingValue: 1,
                            id: "test providers id",
                            localAuthority: "test localAuthority",
                            providerName: "test providerName",
                            providerType: "test providerType",
                            specificationId: "test specificationId",
                            ukprn: "test ukprn",
                        }],
                        startItemNumber: 1,
                        totalErrorResults: 2,
                        totalResults: 3,
                        filteredFundingAmount: 4,
                        canPublish: true,
                        canApprove: true,
                        totalFundingAmount: 5,
                        totalProvidersToApprove: 6,
                        totalProvidersToPublish: 7
                    }
            })
        ).toEqual(expectedState);
    });

    it('should handle REFRESH_FUNDING', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": false,
                "canPublish": false,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "filteredFundingAmount": 0,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "providers": [],
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalFundingAmount": 0,
                "totalProvidersToApprove": 0,
                "totalProvidersToPublish": 0,
                "totalResults": 0,
            },
            "refreshFundingJobId": "test refreshFundingJobId",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.REFRESH_FUNDING,
                payload:"test refreshFundingJobId"
            })
        ).toEqual(expectedState);
    });

    it('should handle APPROVE_FUNDING', () => {
        const expectedState = {
            "approveFundingJobId": "test specificationId",
            "filterTypes": [],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": false,
                "canPublish": false,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "filteredFundingAmount": 0,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "providers": [],
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalFundingAmount": 0,
                "totalProvidersToApprove": 0,
                "totalProvidersToPublish": 0,
                "totalResults": 0,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.APPROVE_FUNDING,
                payload:"test specificationId"
            })
        ).toEqual(expectedState);
    });

    it('should handle RELEASE_FUNDING', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": false,
                "canPublish": false,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "filteredFundingAmount": 0,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "providers": [],
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalFundingAmount": 0,
                "totalProvidersToApprove": 0,
                "totalProvidersToPublish": 0,
                "totalResults": 0,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "test specificationId",
            "selectedFundingPeriods": [],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.RELEASE_FUNDING,
                payload:"test specificationId"
            })
        ).toEqual(expectedState);
    });

    it('should handle CHANGE_PAGESTATE', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "test state",
            "publishedProviderResults": {
                "canApprove": false,
                "canPublish": false,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "filteredFundingAmount": 0,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "providers": [],
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalFundingAmount": 0,
                "totalProvidersToApprove": 0,
                "totalProvidersToPublish": 0,
                "totalResults": 0,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.CHANGE_PAGESTATE,
                payload:"test state"
            })
        ).toEqual(expectedState);
    });

    it('should handle GET_USERPERMISSION', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": false,
                "canPublish": false,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "filteredFundingAmount": 0,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "providers": [],
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalFundingAmount": 0,
                "totalProvidersToApprove": 0,
                "totalProvidersToPublish": 0,
                "totalResults": 0,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": true,
                "canApproveFunding": true,
                "canApproveSpecification": true,
                "canChooseFunding": true,
                "canCreateQaTests": true,
                "canCreateSpecification": true,
                "canDeleteCalculations": true,
                "canDeleteQaTests": true,
                "canDeleteSpecification": true,
                "canEditCalculations": true,
                "canEditQaTests": true,
                "canEditSpecification": true,
                "canMapDatasets": true,
                "canRefreshFunding": true,
                "canReleaseFunding": true,
                "specificationId": "test specificationId",
                "userId": "test userId",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.GET_USERPERMISSION,
                payload:{
                    canCreateQaTests:true,
                    canReleaseFunding: true,
                    canApproveFunding: true,
                    canRefreshFunding: true,
                    canChooseFunding:true,
                    canMapDatasets: true,
                    canDeleteCalculations: true,
                    canEditCalculations:true,
                    canDeleteSpecification:true,
                    canApproveSpecification: true,
                    canEditSpecification: true,
                    canCreateSpecification:true,
                    canAdministerFundingStream: true,
                    userId: "test userId",
                    specificationId: "test specificationId",
                    canEditQaTests: true,
                    canDeleteQaTests:true
                }
            })
        ).toEqual(expectedState);
    });

    it('should handle GET_LATESTJOBFORSPECIFICATION', () => {
        const expectedState = {
            "approveFundingJobId": "",
            "filterTypes": [],
            "fundingStreams": [],
            "jobCurrentlyInProgress": "test specificationId",
            "latestRefreshDateResults": "",
            "pageState": "IDLE",
            "publishedProviderResults": {
                "canApprove": false,
                "canPublish": false,
                "currentPage": 0,
                "endItemNumber": 0,
                "facets": [],
                "filteredFundingAmount": 0,
                "pagerState": {
                    "currentPage": 1,
                    "displayNumberOfPages": 0,
                    "lastPage": 0,
                    "nextPage": 0,
                    "pages": [],
                    "previousPage": 0,
                },
                "providers": [],
                "startItemNumber": 0,
                "totalErrorResults": 0,
                "totalFundingAmount": 0,
                "totalProvidersToApprove": 0,
                "totalProvidersToPublish": 0,
                "totalResults": 0,
            },
            "refreshFundingJobId": "",
            "releaseFundingJobId": "",
            "selectedFundingPeriods": [],
            "specificationSelected": false,
            "specifications": {
                "approvalStatus": "",
                "description": "",
                "fundingPeriod": {
                    "id": "",
                    "name": "",
                },
                "fundingStreams": [],
                "id": "",
                "isSelectedForFunding": false,
                "lastCalculationUpdatedAt": "",
                "name": "",
                "providerVersionId": "",
                "publishedResultsRefreshedAt": null,
                "templateIds": {
                    "PSG": "",
                },
            },
            "userPermission": {
                "canAdministerFundingStream": false,
                "canApproveFunding": false,
                "canApproveSpecification": false,
                "canChooseFunding": false,
                "canCreateQaTests": false,
                "canCreateSpecification": false,
                "canDeleteCalculations": false,
                "canDeleteQaTests": false,
                "canDeleteSpecification": false,
                "canEditCalculations": false,
                "canEditQaTests": false,
                "canEditSpecification": false,
                "canMapDatasets": false,
                "canRefreshFunding": false,
                "canReleaseFunding": false,
                "specificationId": "",
                "userId": "",
            },
        };

        expect(
            reduceViewFundingState(initialState, {
                type: ViewFundingActionTypes.GET_LATESTJOBFORSPECIFICATION,
                payload: "test specificationId"
            })
        ).toEqual(expectedState);
    });
});

