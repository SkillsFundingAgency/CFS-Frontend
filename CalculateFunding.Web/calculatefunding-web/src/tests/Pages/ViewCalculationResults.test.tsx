import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {cleanup, fireEvent, render, waitFor, waitForDomChange} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as useLatestSpecificationJobWithMonitoringHook from "../../hooks/useLatestSpecificationJobWithMonitoring";
import {getCalculationProvidersService} from "../../services/calculationService";
import userEvent from "@testing-library/user-event";

jest.spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(
    () => ({
        anyJobsRunning: false,
        hasJob: false,
        hasActiveJob: false,
        hasFailedJob: false,
        hasJobError: false,
        isCheckingForJob: true,
        isFetched: false,
        isFetching: false,
        isMonitoring: false,
        jobError: "",
        jobInProgressMessage: "",
        latestJob: undefined
    }));

const renderViewCalculationResultsPage = () => {
    const {ViewCalculationResults} = require('../../pages/ViewCalculationResults');
    return render(<MemoryRouter initialEntries={['/ViewCalculationResults/12345']}>
        <Switch>
            <Route path="/ViewCalculationResults/:calculationId" component={ViewCalculationResults} />
        </Switch>
    </MemoryRouter>)
};

beforeAll(() => {
    function mockSummary() {
        const specService = jest.requireActual('../../services/specificationService');
        return {
            ...specService,
            getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                data: {
                    name: "string",
                    id: "123",
                    approvalStatus: "Cal",
                    isSelectedForFunding: true,
                    description: "sgdsg",
                    providerVersionId: "sgds",
                    fundingStreams: [],
                    fundingPeriod: {}
                }
            }))
        }
    }
    function mockCalculationService() {
        const calculationService = jest.requireActual('../../services/calculationService');
        return {
            ...calculationService,
            getCalculationByIdService: jest.fn(() => Promise.resolve({
                data: {
                    id: "C123",
                    name: "Calc123",
                    fundingStreamId: "PSG",
                    specificationId: "Spec123",
                    specificationName: "Spec123",
                    valueType: "TEST",
                    calculationType: "Additional",
                    namespace: "TestNamespace",
                    wasTemplateCalculation: true,
                    description: "Test Description",
                    status: "Draft",
                    lastUpdatedDate: new Date(),
                    lastUpdatedDateDisplay: "Now"
                }
            })),
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

    jest.mock('../../services/calculationService', () => mockCalculationService());
    jest.mock('../../services/specificationService', () => mockSummary());
});

afterEach(cleanup);
afterEach(() => jest.clearAllMocks())

describe("<ViewCalculationResults /> service call checks ", () => {
    it("it calls the calculationService", async () => {
        const {getCalculationByIdService} = require('../../services/calculationService');
        const {getCalculationProvidersService} = require('../../services/calculationService');
        const {getSpecificationSummaryService} = require('../../services/specificationService');
        renderViewCalculationResultsPage();
        await waitFor(() => expect(getCalculationByIdService).toBeCalledTimes(1))
        await waitFor(() => expect(getCalculationProvidersService).toBeCalledTimes(1))
        await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1))
    });
});

describe('<ViewCalculationResults /> page render checks ', () => {
    it('the breadcrumbs are correct', async () => {
        const {queryAllByText} = renderViewCalculationResultsPage();
        await waitFor(() => expect(queryAllByText('Calc123')[0]).toHaveClass("govuk-breadcrumbs__list-item"));
    });

    it('the page header is correct', async () => {
        const {queryAllByText} = renderViewCalculationResultsPage();
        await waitFor(() => expect(queryAllByText('Calc123')[1]).toHaveClass("govuk-heading-xl"));
    });

    it('the view calculation button exists', async () => {
        const {container} = renderViewCalculationResultsPage();
        await waitFor(() => expect(container.querySelector('#view-calculation-button')).toBeInTheDocument())
    });

    it('the calculation results are populated', async () => {
        const {container} = renderViewCalculationResultsPage();
        await waitFor(() => expect(container.querySelectorAll('.govuk-accordion__section')).toHaveLength(2))
    })

    it("search filters exist", async () => {
        const {container} = renderViewCalculationResultsPage();
        await waitFor(() => expect(container.querySelector('#search-options-providers')).toBeInTheDocument())
        await waitFor(() => expect(container.querySelector('#search-options-UKPRN')).toBeInTheDocument())
        await waitFor(() => expect(container.querySelector('#search-options-UPIN')).toBeInTheDocument())
        await waitFor(() => expect(container.querySelector('#search-options-URN')).toBeInTheDocument())
    });
});

describe('<ViewCalculationResults /> search filters checks', () => {
    it("search value changes when searching for providerName", async () => {
        const {getCalculationProvidersService} = require('../../services/calculationService');
        const {container} = renderViewCalculationResultsPage();
        const searchQuery = "9";

        await userEvent.type(container.querySelector('#providerName') as HTMLInputElement, searchQuery);

        await waitFor(() => expect(getCalculationProvidersService).toBeCalledWith( {"calculationId": "12345", "calculationValueType": "", "errorToggle": "", "facetCount": 0, "includeFacets": true, "localAuthority": [], "pageNumber": 1, "pageSize": 50, "providerSubType": [], "providerType": []
            , "resultsStatus": [], "searchFields": [], "searchMode": 1, "searchTerm": searchQuery}
        ))
    });

    it("search value changes when searching for urn", async () => {
        const {getCalculationProvidersService} = require('../../services/calculationService');
        const {container} = renderViewCalculationResultsPage();
        const searchQuery = "9";

        fireEvent.click(container.querySelector('#search-options-URN') as HTMLInputElement)
        await userEvent.type(container.querySelector('#urn') as HTMLInputElement, searchQuery);

        await waitFor(() => expect(getCalculationProvidersService).toBeCalledWith( {"calculationId": "12345", "calculationValueType": "", "errorToggle": "", "facetCount": 0, "includeFacets": true, "localAuthority": [], "pageNumber": 1, "pageSize": 50, "providerSubType": [], "providerType": []
            , "resultsStatus": [], "searchFields": [], "searchMode": 1, "searchTerm": searchQuery}));
    });
})


