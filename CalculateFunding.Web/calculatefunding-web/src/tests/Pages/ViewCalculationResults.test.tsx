import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {act, render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as useLatestSpecificationJobWithMonitoringHook from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {getCalculationProvidersService} from "../../services/calculationService";
import userEvent from "@testing-library/user-event";
import {CalculationDetails} from "../../types/CalculationDetails";
import {ValueType} from "../../types/ValueType";
import {CalculationType} from "../../types/CalculationSearchResponse";
import {PublishStatus} from "../../types/PublishStatusModel";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {CalculationProviderSearchRequestViewModel} from "../../types/calculationProviderSearchRequestViewModel";
import * as calcHook from "../../hooks/Calculations/useCalculation";
import * as specHook from "../../hooks/useSpecificationSummary";

const latestSpecJobMonitorResult: LatestSpecificationJobWithMonitoringResult = {
    hasJob: false,
    hasActiveJob: false,
    hasFailedJob: false,
    hasJobError: false,
    isCheckingForJob: true,
    isFetched: false,
    isFetching: false,
    isMonitoring: false,
    jobError: "",
    latestJob: undefined,
    jobStatus: undefined
};
jest.spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(
    () => (latestSpecJobMonitorResult));

const renderViewCalculationResultsPage = () => {
    const {ViewCalculationResults} = require('../../pages/ViewCalculationResults');
    return render(<MemoryRouter initialEntries={[`/ViewCalculationResults/${testCalc1.id}`]}>
        <Switch>
            <Route path="/ViewCalculationResults/:calculationId" component={ViewCalculationResults}/>
        </Switch>
    </MemoryRouter>)
};

describe("<ViewCalculationResults />", () => {

    beforeEach(() => {
        mockCalculation();
        mockSpecification();
        jest.mock('../../services/calculationService', () => mockCalculationService());
    });

    afterEach(() => jest.clearAllMocks())

    describe("<ViewCalculationResults /> service call checks ", () => {
        it("it calls the calculationService", async () => {
            const {getCalculationProvidersService} = require('../../services/calculationService');

            renderViewCalculationResultsPage();

            await waitFor(() => expect(getCalculationProvidersService).toBeCalledTimes(1));
        });
    });
    
    describe('<ViewCalculationResults /> page render checks ', () => {

        it('renders the calculation name in heading', async () => {
            renderViewCalculationResultsPage();
            expect(await screen.findByRole('heading', {name: testCalc1.name}));
        });

        it('renders the view calculation button link correctly', async () => {
            renderViewCalculationResultsPage();

            const button = await screen.findByRole("button", {name: /View calculation/}) as HTMLInputElement;
            expect(button).toBeInTheDocument();
            expect(button.getAttribute("href")).toBe("/Specifications/EditCalculation/" + testCalc1.id);
        });

        it('the calculation results are populated', async () => {
            const {container} = renderViewCalculationResultsPage();
            await waitFor(() => expect(container.querySelectorAll('.govuk-accordion__section')).toHaveLength(2))
        });

        it("search filters exist", async () => {
            const {container} = renderViewCalculationResultsPage();
            expect(container.querySelector('#search-options-providers')).toBeInTheDocument();
            expect(container.querySelector('#search-options-UKPRN')).toBeInTheDocument();
            expect(container.querySelector('#search-options-UPIN')).toBeInTheDocument();
            expect(container.querySelector('#search-options-URN')).toBeInTheDocument();
        });
    });

    describe('<ViewCalculationResults /> search filters checks', () => {
        it("search value changes when searching for providerName", async () => {
            const {getCalculationProvidersService} = require('../../services/calculationService');
            const {container} = renderViewCalculationResultsPage();
            const searchQuery = "9";

            const expected1: CalculationProviderSearchRequestViewModel = {
                calculationId: testCalc1.id,
                calculationValueType: testCalc1.valueType,
                errorToggle: "",
                facetCount: 0,
                includeFacets: true,
                localAuthority: [],
                pageNumber: 1,
                pageSize: 50,
                providerSubType: [],
                providerType: [],
                resultsStatus: [],
                searchFields: [],
                searchMode: 1,
                searchTerm: ""
            };
            await waitFor(() => expect(getCalculationProvidersService).toBeCalledWith(expected1))

            act(() => {
                userEvent.type(container.querySelector('#providerName') as HTMLInputElement, searchQuery);
            });

            const expected2: CalculationProviderSearchRequestViewModel = {
                ...expected1,
                searchTerm: searchQuery
            };
            await waitFor(() => expect(getCalculationProvidersService).toBeCalledWith(expected2))
        });

        it("search value changes when searching for urn", async () => {
            const {getCalculationProvidersService} = require('../../services/calculationService');
            const searchQuery = "9";

            const {container} = renderViewCalculationResultsPage();

            await act(() => {
                userEvent.click(container.querySelector('#search-options-URN') as HTMLInputElement);
            });

            await act(() => {
                userEvent.type(container.querySelector('#urn') as HTMLInputElement, searchQuery);
            });

            await waitFor(() => expect(getCalculationProvidersService)
                .toBeCalledWith({
                    "calculationId": testCalc1.id,
                    "calculationValueType": testCalc1.valueType,
                    "errorToggle": "",
                    "facetCount": 0,
                    "includeFacets": true,
                    "localAuthority": [],
                    "pageNumber": 1,
                    "pageSize": 50,
                    "providerSubType": [],
                    "providerType": [],
                    "resultsStatus": [],
                    "searchFields": [],
                    "searchMode": 1,
                    "searchTerm": searchQuery
                }));
        });
    });
});


const fundingStream: FundingStream = {
    name: "FS123",
    id: "Wizard Training Scheme"
};
const fundingPeriod: FundingPeriod = {
    id: "FP123",
    name: "2019-20"
};
const testSpec1: SpecificationSummary = {
    name: "test spec name",
    id: "3567357",
    approvalStatus: "Cal",
    isSelectedForFunding: true,
    description: "sgdsg",
    providerVersionId: "sgds",
    fundingStreams: [fundingStream],
    fundingPeriod: fundingPeriod,
    dataDefinitionRelationshipIds: [],
    templateIds: {}
};
const testCalc1: CalculationDetails = {
    id: "C123",
    name: "Calc123",
    fundingStreamId: "PSG",
    specificationId: testSpec1.id,
    valueType: ValueType.Number,
    calculationType: CalculationType.Additional,
    namespace: "TestNamespace",
    wasTemplateCalculation: true,
    description: "Test Description",
    publishStatus: PublishStatus.Draft,
    lastUpdated: new Date(),
    author: null,
    sourceCode: "",
    sourceCodeName: ""
};

const mockCalculation = () => jest.spyOn(calcHook, 'useCalculation')
    .mockImplementation(() => ({
        calculation: testCalc1,
        isLoadingCalculation: false
    }));
const mockSpecification = () => jest.spyOn(specHook, 'useSpecificationSummary')
    .mockImplementation(() => ({
        specification: testSpec1,
        isLoadingSpecification: false,
        errorCheckingForSpecification: null,
        haveErrorCheckingForSpecification: false,
        isFetchingSpecification: false,
        isSpecificationFetched: true
    }));

function mockCalculationService() {
    const calculationService = jest.requireActual('../../services/calculationService');
    return {
        ...calculationService,
        getCalculationProvidersService: jest.fn(() => Promise.resolve({
            data:
                {
                    "calculationProviderResults": [
                        {
                            "id": "68f64680-4675-4179-904f-4d59ba13853a_10056716",
                            "providerId": "10056716",
                            "providerName": "ACE Schools Plymouth",
                            "specificationId": "68f64680-4675-4179-904f-4d59ba13853a",
                            "specificationName": "GAG test spec1",
                            "lastUpdatedDate": "2020-09-30T13:49:11.948+01:00",
                            "localAuthority": "Plymouth",
                            "providerType": "Academies",
                            "providerSubType": "Academy alternative provision converter",
                            "ukprn": "10056716",
                            "urn": "142835",
                            "upin": "",
                            "openDate": "2016-06-01T00:00:00+00:00",
                            "establishmentNumber": "1106",
                            "calculationId": "6797ed27-cd7f-4001-9e5c-95ea41a205f4",
                            "calculationName": "Primary Basic Entitlement Rate",
                            "calculationResult": null,
                            "calculationExceptionType": "",
                            "calculationExceptionMessage": "",
                            "lastUpdatedDateDisplay": "30 September 01:49 pm",
                            "dateOpenedDisplay": "01 June 12:00 am",
                            "calculationResultDisplay": "Excluded"
                        },
                        {
                            "id": "68f64680-4675-4179-904f-4d59ba13853a_10083778",
                            "providerId": "10083778",
                            "providerName": "ACE Tiverton Special School",
                            "specificationId": "68f64680-4675-4179-904f-4d59ba13853a",
                            "specificationName": "GAG test spec1",
                            "lastUpdatedDate": "2020-09-30T13:16:26.101+01:00",
                            "localAuthority": "Devon",
                            "providerType": "Free Schools",
                            "providerSubType": "Free schools special",
                            "ukprn": "10083778",
                            "urn": "147064",
                            "upin": "",
                            "openDate": "2019-09-02T00:00:00+00:00",
                            "establishmentNumber": "7009",
                            "calculationId": "6797ed27-cd7f-4001-9e5c-95ea41a205f4",
                            "calculationName": "Primary Basic Entitlement Rate",
                            "calculationResult": null,
                            "calculationExceptionType": "",
                            "calculationExceptionMessage": "",
                            "lastUpdatedDateDisplay": "30 September 01:16 pm",
                            "dateOpenedDisplay": "02 September 12:00 am",
                            "calculationResultDisplay": "Excluded"
                        }
                    ],
                    "totalResults": 8676,
                    "totalErrorResults": 0,
                    "currentPage": 1,
                    "startItemNumber": 1,
                    "endItemNumber": 50,
                    "pagerState": {
                        "displayNumberOfPages": 4,
                        "previousPage": null,
                        "nextPage": 5,
                        "lastPage": 174,
                        "pages": [
                            1,
                            2,
                            3,
                            4
                        ],
                        "currentPage": 1
                    },
                    "facets": [
                        {
                            "name": "calculationId",
                            "facetValues": [
                                {
                                    "name": "09044408-6793-46d9-8f3c-2368f400e27b",
                                    "count": 21618
                                },
                                {
                                    "name": "9b24a816-31f4-45d3-a3d5-4168a35876a7",
                                    "count": 21618
                                }
                            ]
                        },
                        {
                            "name": "calculationName",
                            "facetValues": [
                                {
                                    "name": "APT Approved Additional Premises costs to exclude",
                                    "count": 8676
                                },
                                {
                                    "name": "APT NEWISB Rates",
                                    "count": 8676
                                }
                            ]
                        },
                        {
                            "name": "specificationName",
                            "facetValues": [
                                {
                                    "name": "GAG test spec1",
                                    "count": 8676
                                }
                            ]
                        },
                        {
                            "name": "specificationId",
                            "facetValues": [
                                {
                                    "name": "68f64680-4675-4179-904f-4d59ba13853a",
                                    "count": 8676
                                }
                            ]
                        },
                        {
                            "name": "providerName",
                            "facetValues": [
                                {
                                    "name": "St Joseph's Catholic Primary School",
                                    "count": 15
                                },
                                {
                                    "name": "St Mary's Catholic Primary School",
                                    "count": 14
                                }
                            ]
                        },
                        {
                            "name": "providerType",
                            "facetValues": [
                                {
                                    "name": "Academies",
                                    "count": 8183
                                },
                                {
                                    "name": "Free Schools",
                                    "count": 492
                                }
                            ]
                        },
                        {
                            "name": "providerSubType",
                            "facetValues": [
                                {
                                    "name": "Academy converter",
                                    "count": 5764
                                },
                                {
                                    "name": "Academy sponsor led",
                                    "count": 2282
                                }
                            ]
                        },
                        {
                            "name": "providerId",
                            "facetValues": [
                                {
                                    "name": "10001992",
                                    "count": 1
                                },
                                {
                                    "name": "10003498",
                                    "count": 1
                                }
                            ]
                        },
                        {
                            "name": "localAuthority",
                            "facetValues": [
                                {
                                    "name": "Essex",
                                    "count": 288
                                },
                                {
                                    "name": "Kent",
                                    "count": 254
                                }
                            ]
                        },
                        {
                            "name": "fundingLineId",
                            "facetValues": [
                                {
                                    "name": "10",
                                    "count": 7576
                                },
                                {
                                    "name": "11",
                                    "count": 7576
                                }
                            ]
                        },
                        {
                            "name": "fundingLineName",
                            "facetValues": [
                                {
                                    "name": "AllocationProtection",
                                    "count": 7576
                                },
                                {
                                    "name": "AlternativeProvision",
                                    "count": 7576
                                }
                            ]
                        }
                    ]
                }
        }))
    }
}

