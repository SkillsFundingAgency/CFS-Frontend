import React from "react";
import {match} from 'react-router';
import {MemoryRouter} from 'react-router-dom';
import {render, waitFor, cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {CreateAdditionalCalculation, CreateAdditionalCalculationRouteProps} from "../../../pages/Calculations/CreateAdditionalCalculation";

const matchMock: match<CreateAdditionalCalculationRouteProps> = {
    isExact: true,
    path: "",
    url: "",
    params: {
        specificationId: "SPEC123",
    }
};

function renderCreateAdditionalCalculation() {
    const {CreateAdditionalCalculation} = require("../../../pages/Calculations/CreateAdditionalCalculation");
    return render(<MemoryRouter>
        <CreateAdditionalCalculation
            excludeMonacoEditor={true}
            history={history}
            location={location}
            match={matchMock}/>
    </MemoryRouter>);
}

beforeEach(() => {
    function mockSpecificationService() {
        const specificationService = jest.requireActual('../../../services/specificationService');
        return {
            ...specificationService,
            getSpecificationSummaryService: jest.fn((specificationId) => Promise.resolve({
                data: {
                    name: "Specification 123",
                    id: "SPEC123",
                    approvalStatus: "Approved",
                    isSelectedForFunding: false,
                    description: "Test Description",
                    providerVersionId: "1",
                    fundingStreams: [],
                    fundingPeriod: {
                        id: "FP321",
                        name: "FPERIOD"
                    }
                }
            }))
        }
    }

    jest.mock('../../../services/specificationService', () => mockSpecificationService());
    jest.mock("../../../components/GdsMonacoEditor", () => <></>);
});

afterEach(cleanup);

describe("<CreateAdditionalCalculation> ", () => {
    it("renders the H1 title", async () => {
        const {container} = renderCreateAdditionalCalculation();
        await waitFor(() => {
            expect(container.querySelector("h1")).toHaveTextContent("Create additional calculation");
        });
    });

    it("renders the calculation name label", async () => {
        const {container} = renderCreateAdditionalCalculation();
        await waitFor(() => {
            expect(container.querySelector("label#calculation-name-label")).toHaveTextContent("Calculation name");
        });
    });

    it("renders the calculation value label", async () => {
        const {container} = renderCreateAdditionalCalculation();
        await waitFor(() => {
            expect(container.querySelector("label#calculation-value-label")).toHaveTextContent("Value type");
        });
    });

    it("renders the build source button", async () => {
        const {container} = renderCreateAdditionalCalculation();
        await waitFor(() => {
            expect(container.querySelector("button#build-calculation-button")).toHaveTextContent("Build calculation");
        });
    });

    it("renders the build source button as enabled", async () => {
        const {container} = renderCreateAdditionalCalculation();
        await waitFor(() => {
            expect(container.querySelector("button#build-calculation-button")).toBeEnabled();
        });
    });

    it("renders the save calculation button as disabled", async () => {
        const {container} = renderCreateAdditionalCalculation();
        await waitFor(() => {
            expect(container.querySelector("button#save-calculation-button")).toBeDisabled();
        });
    });
});
