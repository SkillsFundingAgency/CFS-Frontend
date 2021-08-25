import React from 'react';
import {MemoryRouter, Route, Switch} from "react-router";
import {ViewProviderResults} from "../../../pages/ViewResults/ViewProviderResults";
import {ProviderSummary} from "../../../types/ProviderSummary";
import {ProviderVersionQueryResult} from "../../../hooks/Providers/useProviderVersion";
import {act, render, screen, waitFor} from "@testing-library/react";
import * as providerVersionHook from "../../../hooks/Providers/useProviderVersion";
import userEvent from "@testing-library/user-event";

describe("<ViewProviderResults />", () => {
    beforeEach(async () => {
        mockProviderService();
        mockSpecificationService();
        await renderPage();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("displays provider details", async () => {
        expect(screen.getAllByText("Hogwarts School of Witchcraft and Wizardry").length).toBe(2);
        expect(screen.getByText("ukprn test")).toBeInTheDocument()
    })

    it("displays provider data establishment details", async () => {
        const providerDataTab= await screen.findByTestId("tab-provider-data") as HTMLLabelElement;
        act(() => userEvent.click(providerDataTab));

        expect(screen.getByText("establishmentNumberTest")).toBeInTheDocument()
        expect((await screen.findByTestId("successors") as HTMLDListElement).textContent).toBe("successors1, successors2")
        expect((await screen.findByTestId("predecessors") as HTMLDListElement).textContent).toBe("predecessors1, predecessors2")
    });
});

const renderPage = async () => {
    const {ViewProviderResults} = require('../../../pages/ViewResults/ViewProviderResults');
    const page = render(<MemoryRouter initialEntries={['/ViewResults/ViewProviderResults/Hog/1619']}>
        <Switch>
            <Route path="/ViewResults/ViewProviderResults/:providerId/:fundingStreamId"
                   component={ViewProviderResults}/>
        </Switch>
    </MemoryRouter>)

    await waitFor(() => {
        expect(screen.getByText("Loading provider details")).not.toBeVisible()
    });

    return page;
}

const testProvider: ProviderSummary = {
    authority: "",
    countryCode: "",
    countryName: "",
    crmAccountId: "",
    dfeEstablishmentNumber: "",
    establishmentNumber: "establishmentNumberTest",
    id: "Hog-1",
    laCode: "",
    legalName: "",
    name: "Hogwarts School of Witchcraft and Wizardry",
    navVendorNo: "",
    phaseOfEducation: "",
    postcode: "",
    providerId: "Hog",
    providerProfileIdType: "",
    providerSubType: "",
    providerType: "",
    providerVersionId: "",
    reasonEstablishmentClosedCode: "",
    reasonEstablishmentOpenedCode: "",
    rscRegionCode: "",
    rscRegionName: "",
    status: "",
    successor: "",
    town: "",
    trustCode: "",
    trustName: "",
    trustStatus: "",
    ukprn: "ukprn test",
    upin: "",
    urn: "",
    paymentOrganisationIdentifier: "",
    paymentOrganisationName: "",
    censusWardCode: "",
    censusWardName: "",
    companiesHouseNumber: "",
    dateClosed: "",
    dateOpened: "",
    districtCode: "",
    districtName: "",
    governmentOfficeRegionCode: "",
    governmentOfficeRegionName: "",
    groupIdNumber: "",
    localAuthorityName: "",
    localGovernmentGroupTypeCode: "",
    localGovernmentGroupTypeName: "",
    middleSuperOutputAreaCode: "",
    middleSuperOutputAreaName: "",
    officialSixthFormCode: "",
    officialSixthFormName: "",
    parliamentaryConstituencyCode: "",
    parliamentaryConstituencyName: "",
    paymentOrganisationCompanyHouseNumber: "",
    paymentOrganisationLaCode: "",
    paymentOrganisationTrustCode: "",
    paymentOrganisationType: "",
    paymentOrganisationUkprn: "",
    paymentOrganisationUpin: "",
    paymentOrganisationUrn: "",
    phaseOfEducationCode: "",
    previousEstablishmentNumber: "",
    previousLaCode: "",
    previousLaName: "",
    providerSubTypeCode: "",
    providerTypeCode: "",
    statusCode: "",
    statutoryHighAge: "",
    statutoryLowAge: "",
    wardCode: "",
    wardName: "",
    predecessors: ["predecessors1", "predecessors2"],
    successors: ["successors1", "successors2"]
};
const providerResult: ProviderVersionQueryResult = {
    providerVersion: testProvider,
    isLoadingProviderVersion: false,
    errorLoadingProviderVersion: null,
    isErrorLoadingProviderVersion: false,
    isFetchingProviderVersion: false,
};
jest.spyOn(providerVersionHook, 'useProviderVersion').mockImplementation(() => (providerResult));
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
jest.mock("../../../components/AdminNav");

const mockProviderService = () => {
    jest.mock("../../../services/providerService", () => {
        const service = jest.requireActual("../../../services/providerService");
        return {
            ...service,
            getProviderResultsService: jest.fn(() => Promise.resolve({
                data: {
                    id: "1",
                    name: "privider name",
                    lastEditDate: new Date(),
                    fundingPeriod: "funding period",
                    fundingStreamIds: ["1619"],
                    fundingPeriodEnd: new Date()
                }
            }))
        }
    });
}

const mockSpecificationService = () => {
    jest.mock("../../../services/specificationService", () => {
        const service = jest.requireActual("../../../services/specificationService");
        return {
            ...service,
            getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                data: {
                    name: "test spec",
                    id: "test spec id",
                    approvalStatus: "",
                    isSelectedForFunding: true,
                    description: "",
                    fundingPeriod: "funding period",
                    fundingStreamIds: ["1619"],
                    providerSnapshotId: 11,
                    templateIds: {[""]: ""},
                    dataDefinitionRelationshipIds: []
                }
            }))
        }
    });
}
