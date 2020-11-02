import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {render, screen, waitFor, waitForElementToBeRemoved} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as circularRefErrorsHook from "../../../hooks/Calculations/useCalculationCircularDependencies";
import {CalculationCircularDependenciesQueryResult} from "../../../hooks/Calculations/useCalculationCircularDependencies";
import {CalculationSearchResult, CalculationType} from "../../../types/CalculationSearchResponse";
import {ValueType} from "../../../types/ValueType";
import {PublishStatus} from "../../../types/PublishStatusModel";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {SpecificationSummary} from "../../../types/SpecificationSummary";

const renderComponent = () => {
    const {AdditionalCalculations} = require('../../../components/Calculations/AdditionalCalculations');
    return render(<MemoryRouter initialEntries={['/AdditionalCalculations/SPEC123']}>
        <Switch>
            <Route path="/AdditionalCalculations/:specificationId" component={AdditionalCalculations}/>
        </Switch>
    </MemoryRouter>)
}


describe('<AdditionalCalculations /> tests', () => {

    describe("<AdditionalCalculations /> service call checks ", () => {
        afterEach(() => jest.clearAllMocks());

        it("it calls the services correct number of times", async () => {
            jest.mock('../../../services/calculationService', () => mockCalculationService());
            const {searchForCalculationsService} = require('../../../services/calculationService');
            renderComponent();
            await waitFor(() => expect(searchForCalculationsService).toBeCalledTimes(1))
        });
    });
    
    
    describe('<AdditionalCalculations /> without circular ref error', () => {
        beforeEach(() => {
            jest.mock('../../../services/calculationService', () => mockCalculationService());
            mockNoCircularRefErrors();
            renderComponent();
        });

        afterEach(() => jest.clearAllMocks());

        it('additional calculations are displayed', async () => {
            expect(await screen.findByText(testCalc1.name)).toBeInTheDocument();
            expect(await screen.findByText(testCalc2.name)).toBeInTheDocument();
        });

        it('renders non-error statuses for calculations', async () => {
            expect(await screen.findByText(testCalc1.status)).toBeInTheDocument();
            expect(await screen.findByText(testCalc2.status)).toBeInTheDocument();
            expect(screen.queryByText("Error")).not.toBeInTheDocument();
        });

        it('does not render error message', async () => {
            expect(await screen.queryAllByText(/circular reference detected in calculation script/)).toHaveLength(0);
        });
    });

    describe('<AdditionalCalculations /> with circular ref error', () => {
        beforeEach(() => {
            jest.mock('../../../services/calculationService', () => mockCalculationService());
            mockCircularRefErrors();
            renderComponent();
        });

        afterEach(() => jest.clearAllMocks());

        it('additional calculations are displayed', async () => {
            expect(await screen.findByText(testCalc1.name)).toBeInTheDocument();
            expect(await screen.findByText(testCalc2.name)).toBeInTheDocument();
        });

        it('error message is displayed once for calculation with circular reference error', async () => {
            expect(await screen.findAllByText(/circular reference detected in calculation script/)).toHaveLength(1);
        });

        it('error status is displayed for calculation without circular reference error', async () => {
            expect(await screen.queryByText(testCalc2.status)).not.toBeInTheDocument();
            expect(await screen.findByText(testCalc1.status)).toBeInTheDocument();
        });
    })

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
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: fundingPeriod,
    fundingStreams: [fundingStream],
    id: "ABC123",
    isSelectedForFunding: true,
    providerVersionId: "",
    dataDefinitionRelationshipIds: []
};
const testCalc1: CalculationSearchResult = {
    calculationType: CalculationType.Additional,
    description: undefined,
    fundingStreamId: fundingStream.id,
    id: "54723",
    lastUpdatedDate: new Date(),
    name: "Test Calc 1",
    namespace: "blah-blah",
    status: PublishStatus.Draft,
    specificationId: testSpec.id,
    valueType: ValueType.Currency,
    specificationName: testSpec.name,
    wasTemplateCalculation: false
}
const testCalc2: CalculationSearchResult = {
    calculationType: CalculationType.Additional,
    description: "Lorem ipsum",
    fundingStreamId: fundingStream.id,
    id: "96363",
    lastUpdatedDate: new Date(),
    name: "Test Calc 2",
    namespace: "blah-blah",
    status: PublishStatus.Updated,
    specificationId: testSpec.id,
    valueType: ValueType.Percentage,
    specificationName: testSpec.name,
    wasTemplateCalculation: false
}
const withCircularRefErrorsResult: CalculationCircularDependenciesQueryResult = {
    circularReferenceErrors: [{
        node: {
            calculationid: testCalc2.id,
            calculationName: testCalc2.name,
            calculationType: testCalc2.calculationType,
            fundingStream: fundingStream.id,
            specificationId: testSpec.id
        },
        relationships: []
    }],
    isLoadingCircularDependencies: false
}

const noCircularRefErrorsResult: CalculationCircularDependenciesQueryResult = {
    circularReferenceErrors: [],
    isLoadingCircularDependencies: false
}
const mockCircularRefErrors = () => jest.spyOn(circularRefErrorsHook, 'useCalculationCircularDependencies')
    .mockImplementation(() => (withCircularRefErrorsResult));
const mockNoCircularRefErrors = () => jest.spyOn(circularRefErrorsHook, 'useCalculationCircularDependencies')
    .mockImplementation(() => (noCircularRefErrorsResult));
const mockCalculationService = () => {
    const calculationService = jest.requireActual('../../../services/calculationService');
    return {
        ...calculationService,
        searchForCalculationsService: jest.fn(() => Promise.resolve({
            status: 200,
            data: {
                totalCount: 2,
                totalResults: 2,
                totalErrorResults: 0,
                currentPage: 1,
                lastPage: 1,
                startItemNumber: 0,
                endItemNumber: 0,
                pagerState: {
                    displayNumberOfPages: 0,
                    previousPage: 0,
                    nextPage: 0,
                    lastPage: 0,
                    pages: [],
                    currentPage: 0
                },
                facets: [],
                results: [testCalc1, testCalc2]
            }
        }))
    }
}