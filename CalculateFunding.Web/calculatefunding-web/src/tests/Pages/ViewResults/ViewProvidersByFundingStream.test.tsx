import {render, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {getFundingStreamByIdService} from "../../../services/policyService";
import {getProvidersByFundingStreamService} from "../../../services/providerService";

function renderComponent() {
    const {ViewProvidersByFundingStream} = require('../../../pages/ViewResults/ViewProvidersByFundingStream')
    return render(<MemoryRouter initialEntries={['/ViewResults/ViewProvidersByFundingStream/DSG']}>
        <Switch>
            <Route path="/ViewResults/ViewProvidersByFundingStream/:fundingStreamId"
                   component={ViewProvidersByFundingStream}/>
        </Switch>
    </MemoryRouter>)
}

function mockPolicyService() {
    const policyService = jest.requireActual('../../../services/policyService');
    return {
        ...policyService,
        getFundingStreamByIdService: jest.fn(() => Promise.resolve({
            data: {"shortName":"PE and Sport","id":"PSG","name":"PE and Sport Premium Grant"}
        }))
    }
}

function mockProviderService() {
    const providerService = jest.requireActual('../../../services/providerService');
    return {
        ...providerService,
        getProvidersByFundingStreamService: jest.fn(() => Promise.resolve({
            data: {
        "totalCount": 1234,
            "startItemNumber": 1,
            "endItemNumber": 100,
            "items": [
            {
                "id": "id-123",
                "providerVersionId": "psg-2020-10-05",
                "providerId": "10011694",
                "name": "Testing School",
                "urn": "133175",
                "ukprn": "10011694",
                "upin": "",
                "establishmentNumber": "8236",
                "dfeEstablishmentNumber": "9318236",
                "authority": "Oxfordshire",
                "providerType": "Other types",
                "providerSubType": "Miscellaneous",
                "dateOpened": null,
                "dateClosed": null,
                "providerProfileIdType": "",
                "laCode": "931",
                "navVendorNo": "",
                "crmAccountId": "",
                "legalName": "",
                "status": "Open",
                "phaseOfEducation": "Not applicable",
                "reasonEstablishmentOpened": "Not applicable",
                "reasonEstablishmentClosed": "Not applicable",
                "successor": null,
                "trustStatus": "NotApplicable",
                "trustName": "",
                "trustCode": "",
                "town": "Oxford",
                "postcode": "OX1 1UP",
                "rscRegionName": "North-West London and South-Central England",
                "rscRegionCode": "",
                "localGovernmentGroupTypeName": "",
                "localGovernmentGroupTypeCode": "",
                "countryName": "England ",
                "countryCode": "E92000001 ",
                "street": "5 Cambridge Terrace",
                "locality": "",
                "address3": "",
                "paymentOrganisationIdentifier": null,
                "paymentOrganisationName": null
            },
            {
                "id": "id-456",
                "providerVersionId": "psg-2020-10-05",
                "providerId": "10069434",
                "name": "Second Test School",
                "urn": "133270",
                "ukprn": "10069434",
                "upin": "",
                "establishmentNumber": "3366",
                "dfeEstablishmentNumber": "8943366",
                "authority": "Telford and Wrekin",
                "providerType": "Local authority maintained schools",
                "providerSubType": "Community school",
                "dateOpened": "2007-09-01T00:00:00+00:00",
                "dateClosed": null,
                "providerProfileIdType": "",
                "laCode": "894",
                "navVendorNo": "",
                "crmAccountId": "",
                "legalName": "",
                "status": "Open",
                "phaseOfEducation": "Primary",
                "reasonEstablishmentOpened": "Result of Amalgamation",
                "reasonEstablishmentClosed": "Not applicable",
                "successor": null,
                "trustStatus": "NotApplicable",
                "trustName": "",
                "trustCode": "",
                "town": "Telford",
                "postcode": "TF3 2BF",
                "rscRegionName": "West Midlands",
                "rscRegionCode": "",
                "localGovernmentGroupTypeName": "",
                "localGovernmentGroupTypeCode": "",
                "countryName": "England ",
                "countryCode": "E92000001 ",
                "street": "Brunel Road",
                "locality": "Malinslee",
                "address3": "",
                "paymentOrganisationId": null,
                "paymentOrganisationName": null
            }
        ],
            "facets": [
            {
                "name": "providerType",
                "facetValues": [
                    {
                        "name": "Local authority maintained schools",
                        "count": 1234
                    },
                    {
                        "name": "Academies",
                        "count": 5678
                    }
                ]
            },
            {
                "name": "providerSubType",
                "facetValues": [
                    {
                        "name": "Community school",
                        "count": 1234
                    },
                    {
                        "name": "Academy converter",
                        "count": 5678
                    }
                ]
            },
            {
                "name": "authority",
                "facetValues": [
                    {
                        "name": "Does not apply",
                        "count": 1234
                    },
                    {
                        "name": "Kent",
                        "count": 5678
                    }
                ]
            },
            {
                "name": "providerId",
                "facetValues": [
                    {
                        "name": "10000001",
                        "count": 1
                    },
                    {
                        "name": "10000002",
                        "count": 1
                    }
                ]
            },
            {
                "name": "providerVersionId",
                "facetValues": [
                    {
                        "name": "psg-2010-04-15",
                        "count": 1234
                    },
                    {
                        "name": "psg-2020-04-08",
                        "count": 5678
                    }
                ]
            }
        ],
            "pagerState": {
            "displayNumberOfPages": 4,
                "previousPage": null,
                "nextPage": 5,
                "lastPage": 332,
                "pages": [
                1,
                2,
                3,
                4
            ],
                "currentPage": 1
        }
    }
        })),
    }
}

describe("<ViewProvidersByFundingStream />", () => {
    beforeAll(() => {
            jest.mock('../../../services/providerService', () => mockProviderService());
            jest.mock('../../../services/policyService', () => mockPolicyService());
        }
    );
    afterEach(() => jest.clearAllMocks());

    it('calls the getFundingStreamByIdService once.', async () => {
        const {getFundingStreamByIdService} = require('../../../services/policyService');
        renderComponent();
        await waitFor(() => expect(getFundingStreamByIdService).toBeCalledTimes(1));
    });

    it('calls the getProvidersByFundingStreamService once.', async () => {
        const {getProvidersByFundingStreamService} = require('../../../services/providerService');
        renderComponent();
        await waitFor(() => expect(getProvidersByFundingStreamService).toBeCalledTimes(1));
    });
});

describe("<ViewProvidersByFundingStream /> ", () => {
    beforeAll(() => {
            jest.mock('../../../services/providerService', () => mockProviderService());
            jest.mock('../../../services/policyService', () => mockPolicyService());
        }
    );
    afterEach(() => jest.clearAllMocks());

    it("has the relevant breadcrumbs", async () => {
        const {container} = renderComponent();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item').length).toBe(4));
    });

    it("has the Calculate funding breadcrumb", async () => {
        const {container} = renderComponent();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item')[0].textContent).toBe("Calculate funding"));
    });

    it("has the View results breadcrumb", async () => {
        const {container} = renderComponent();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item')[1].textContent).toBe("View results"));
    });

    it("has the Funding stream breadcrumb", async () => {
        const {container} = renderComponent();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item')[2].textContent).toBe("Funding stream"));
    });

    it("has the View provider results breadcrumb", async () => {
        const {container} = renderComponent();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item')[3].textContent).toBe("View provider results"));
    });

    it("finds the H1 title", async () => {
        const {container} = renderComponent();
        await waitFor(() => expect(container.querySelector("h1.govuk-heading-xl")?.textContent).toContain("View provider results"));
    });
});

