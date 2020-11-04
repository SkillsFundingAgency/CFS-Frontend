import React from 'react';
import {createBrowserHistory, createLocation} from "history";
import {match, MemoryRouter} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import {
    CalculationVersionHistory,
    CalculationVersionHistoryRoute
} from "../../../pages/Calculations/CalculationVersionHistory";
import {render, screen} from "@testing-library/react";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {CalculationDetails} from "../../../types/CalculationDetails";
import {ValueType} from "../../../types/ValueType";
import {CalculationType} from "../../../types/CalculationSearchResponse";
import {PublishStatus} from "../../../types/PublishStatusModel";
import * as calcHook from "../../../hooks/Calculations/useCalculation";
import * as specHook from "../../../hooks/useSpecificationSummary";

const history = createBrowserHistory();
const location = createLocation("", "", "", {search: "", pathname: "", hash: "", key: "", state: ""});

function renderPage() {
    const {CalculationVersionHistory} = require("../../../pages/Calculations/CalculationVersionHistory");
    return render(
        <MemoryRouter>
            <CalculationVersionHistory match={mockRoute} history={history} location={location}/>
        </MemoryRouter>);
}

describe("<CalculationVersionHistory> tests", () => {
    beforeEach(() => {
        mockSpecification();
        mockCalculation();

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
    publishStatus: PublishStatus.Draft,
    lastUpdated: new Date(),
    author: null,
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
