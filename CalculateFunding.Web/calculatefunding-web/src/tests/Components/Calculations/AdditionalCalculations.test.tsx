import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {cleanup, render, waitFor, screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

const renderAdditionalCalculation = () => {
    const {AdditionalCalculations} = require('../../../components/Calculations/AdditionalCalculations');
    return render(<MemoryRouter initialEntries={['/AdditionalCalculations/SPEC123']}>
        <Switch>
            <Route path="/AdditionalCalculations/:specificationId" component={AdditionalCalculations}/>
        </Switch>
    </MemoryRouter>)
}

afterEach(cleanup);
afterEach(() => jest.clearAllMocks());

beforeEach(() =>{
    function mockAdditionalCalculationsService(){
        const calculationService = jest.requireActual('../../../services/calculationService');
        return {
            ...calculationService,
            getCalculationsService: jest.fn(() => Promise.resolve({
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
                    results:
                        [
                            {
                                id: "d67ab7df-7d8e-4a16-aa8c-797f0902f191",
                                name: "Pupils",
                                fundingStreamId: "N/A",
                                specificationId: "3c9fa5d6-8018-4cf0-bb9c-f4807a5cc44f",
                                specificationName: "Rob training test DSG",
                                valueType: "Number",
                                calculationType: "Additional",
                                namespace: "Additional",
                                wasTemplateCalculation: false,
                                description: null,
                                status: "Draft",
                                lastUpdatedDate: new Date(),
                                lastUpdatedDateDisplay: ""
                            },
                            {
                                id: "7931bc31-2f20-4502-a3ac-3ccdeadc491e",
                                name: "Calculation With Circular Reference Error",
                                fundingStreamId: "N/A",
                                specificationId: "3c9fa5d6-8018-4cf0-bb9c-f4807a5cc44f",
                                specificationName: "Rob training test DSG",
                                valueType: "Number",
                                calculationType: "Additional",
                                namespace: "Additional",
                                wasTemplateCalculation: false,
                                description: null,
                                status: "Draft",
                                lastUpdatedDate: new Date(),
                                lastUpdatedDateDisplay: ""
                            }
                        ]
                }
            })),
            getCalculationCircularDependencies: jest.fn(() => Promise.resolve({
                data: [
                    {
                        node: {
                            calculationid: "7931bc31-2f20-4502-a3ac-3ccdeadc491e",
                            specificationId: "",
                            calculationName: "",
                            calculationType: "",
                            fundingStream: "",
                        },
                        relationships: []
                    }
                ]
            }))
        }
    }

    jest.mock('../../../services/calculationService', () => mockAdditionalCalculationsService());
});

describe("<AdditionalCalculations /> service call checks ", () => {
    it("it calls the services correct number of times", async () => {
        const {getCalculationsService, getCalculationCircularDependencies} = require('../../../services/calculationService');
        renderAdditionalCalculation();
        await waitFor(() => expect(getCalculationsService).toBeCalledTimes(1))
        await waitFor(() => expect(getCalculationCircularDependencies).toBeCalledTimes(1))
    });
});

describe('<AdditionalCalculations /> page render ', () => {
    it('shows the Additional Calculations title', async () => {
        renderAdditionalCalculation();
        expect(await screen.findByText("Additional calculations")).toBeInTheDocument();
    });

    it('additional calculations are displayed', async () => {
        renderAdditionalCalculation();
        expect(await screen.findByText("Pupils")).toBeInTheDocument(1);
        expect(await screen.findByText("Calculation With Circular Reference Error")).toBeInTheDocument(1);
    });

    it('error message is displayed for calculations with circular reference error', async () => {
        renderAdditionalCalculation();
        const calculationLinkWithRefError = await screen.findByText("Calculation With Circular Reference Error");
        expect(calculationLinkWithRefError.parentElement?.innerHTML).toContain("circular reference detected in calculation script");
    });

    it('error message is not displayed for calculations without circular reference error', async () => {
        renderAdditionalCalculation();
        const calculationLinkWithRefError = await screen.findByText("Pupils");
        expect(calculationLinkWithRefError.parentElement?.innerHTML).not.toContain("circular reference detected in calculation script");
    });

    it('error status is displayed for calculations with circular reference error', async () => {
        renderAdditionalCalculation();
        const calculationLinkWithRefError = await screen.findByText("Calculation With Circular Reference Error");
        expect(calculationLinkWithRefError.parentElement?.nextElementSibling?.textContent).toBe("Error");
    });

    it('error status is not displayed for calculations without circular reference error', async () => {
        renderAdditionalCalculation();
        const calculationLinkWithRefError = await screen.findByText("Pupils");
        expect(calculationLinkWithRefError.parentElement?.nextElementSibling?.textContent).toBe("Draft");
    });
});