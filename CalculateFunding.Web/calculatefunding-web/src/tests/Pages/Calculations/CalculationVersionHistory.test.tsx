import React from 'react';
import {createBrowserHistory, createLocation} from "history";
import {match, MemoryRouter} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import {CalculationVersionHistory, CalculationVersionHistoryRoute} from "../../../pages/Calculations/CalculationVersionHistory";
import {render, screen, waitFor, within} from "@testing-library/react";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {CalculationDetails} from "../../../types/CalculationDetails";
import {ValueType} from "../../../types/ValueType";
import {CalculationType} from "../../../types/CalculationSearchResponse";
import {PublishStatus} from "../../../types/PublishStatusModel";
import * as calcHook from "../../../hooks/Calculations/useCalculation";
import * as specHook from "../../../hooks/useSpecificationSummary";
import {CalculationVersionHistorySummary} from "../../../types/Calculations/CalculationVersionHistorySummary";
import {QueryClient, QueryClientProvider} from "react-query";
import {CalculationDataType} from "../../../types/Calculations/CalculationCompilePreviewResponse";

const history = createBrowserHistory();
const location = createLocation("", "", "", {search: "", pathname: "", hash: "", key: "", state: ""});

function renderPage() {
    const {CalculationVersionHistory} = require("../../../pages/Calculations/CalculationVersionHistory");
    return render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
            <CalculationVersionHistory match={mockRoute} history={history} location={location}/>
            </QueryClientProvider>
        </MemoryRouter>);
}

describe("<CalculationVersionHistory> tests", () => {
    beforeEach(() => {
        mockSpecification();
        mockCalculation();
        mockCalcService();

        renderPage();
    });
    afterEach(() => jest.clearAllMocks());

    it("does not render any errors", async () => {
        expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
    });

    it('renders the view specification breadcrumb link correctly', async () => {
        const link = screen.getByRole("link", {name: testSpec.name}) as HTMLAnchorElement;
        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe("/ViewSpecification/" + testSpec.id);
    });

    it('renders breadcrumb with calculation name', async () => {
        const listItems = screen.getAllByRole("listitem").map(el => el.textContent);
        expect(listItems).toContain(testCalc.name);
    });

    it("renders the calculation name as heading", async () => {
        expect(screen.getByRole("heading", {name: testCalc.name})).toBeInTheDocument();
    });

    it('renders the back link correctly', async () => {
        const link = screen.getByRole("link", {name: /Back/}) as HTMLAnchorElement;
        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(`/Specifications/EditCalculation/${testCalc.id}`);
    });

    it('calls the calculation versions correctly', async () => {
        await waitFor(() => expect(mockCalcVersionCall).toHaveBeenCalledWith(testCalc.id));
    });

    it('renders the calculation versions correctly', async () => {
        await waitFor(() => expect(mockCalcVersionCall).toHaveBeenCalledWith(testCalc.id));
        
        const resultsTableBody = screen.getByTestId("calc-versions");
        expect(resultsTableBody).toBeInTheDocument();
        mockTestCalcVersions.map(calcVersion => {
            const row = screen.getByText(calcVersion.version.toString()).closest("tr") as HTMLTableRowElement;
            expect(within(row).getByText(calcVersion.publishStatus)).toBeInTheDocument();
            expect(within(row).getByText(calcVersion.author.name)).toBeInTheDocument();
        })
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
const testSpec: SpecificationSummary = {
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
const testCalc: CalculationDetails = {
    id: "C123",
    name: "Calc123",
    fundingStreamId: fundingStream.id,
    specificationId: testSpec.id,
    valueType: ValueType.Number,
    calculationType: CalculationType.Additional,
    namespace: "TestNamespace",
    wasTemplateCalculation: true,
    description: "Test Description",
    publishStatus: PublishStatus.Approved,
    lastUpdated: new Date(),
    author: null,
    dataType: CalculationDataType.Boolean,
    sourceCode: "",
    sourceCodeName: ""
};
const mockRoute: match<CalculationVersionHistoryRoute> = {
    params: {
        calculationId: testCalc.id,
    },
    isExact: true,
    path: "",
    url: ""
};

const mockCalculation = () => jest.spyOn(calcHook, 'useCalculation')
    .mockImplementation(() => ({
        calculation: testCalc,
        isLoadingCalculation: false
    }));
const mockSpecification = () => jest.spyOn(specHook, 'useSpecificationSummary')
    .mockImplementation(() => ({
        specification: testSpec,
        isLoadingSpecification: false,
        errorCheckingForSpecification: null,
        haveErrorCheckingForSpecification: false,
        isFetchingSpecification: false,
        isSpecificationFetched: true
    }));
const mockTestCalcVersions: CalculationVersionHistorySummary[] = [{
    calculationId: "Calc0001",
    calculationType: testCalc.calculationType,
    description: "lorem ipsum",
    author: {id: "123", name: "Bob"},
    lastUpdated: new Date(),
    name: testCalc.name,
    namespace: "Blah blah",
    publishStatus: PublishStatus.Draft,
    sourceCode: "a + b",
    sourceCodeName: "blah",
    version: 34252,
    wasTemplateCalculation: false
}, {
    calculationId: testCalc.id,
    calculationType: testCalc.calculationType,
    description: null,
    author: {id: "", name: "TestUser3"},
    lastUpdated: new Date(),
    name: testCalc.name,
    namespace: "Blah blah",
    publishStatus: PublishStatus.Approved,
    sourceCode: "a + b + c",
    sourceCodeName: "blah",
    version: 99999,
    wasTemplateCalculation: false
}];
const mockCalcVersionCall =  jest.fn(() => Promise.resolve({
    data: mockTestCalcVersions,
    status: 200
}))
const mockCalcService = () => {
    jest.mock("../../../services/calculationService", () => {
        const mockService = jest.requireActual("../../../services/calculationService");

        return {
            ...mockService,
            getCalculationVersionHistoryService: mockCalcVersionCall
        }
    });
};