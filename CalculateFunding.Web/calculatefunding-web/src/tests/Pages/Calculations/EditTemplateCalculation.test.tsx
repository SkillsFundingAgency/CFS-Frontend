import React from "react";
import {EditTemplateCalculationRouteProps} from "../../../pages/Calculations/EditTemplateCalculation";
import {createMemoryHistory, createLocation} from 'history';
import {match} from 'react-router';
import {MemoryRouter} from 'react-router-dom';
import {render, waitFor, fireEvent} from '@testing-library/react';
import {CircularReferenceError} from "../../../types/Calculations/CircularReferenceError";
import '@testing-library/jest-dom/extend-expect';

const history = createMemoryHistory();

const matchMock: match<EditTemplateCalculationRouteProps> = {
    isExact: true,
    path: "",
    url: "",
    params: {
        calculationId: "123",
        fundingLineItem: "item"
    }
};

const location = createLocation(matchMock.url);

jest.mock("../../../components/GdsMonacoEditor", () => <></>);

describe("<EditTemplateCalculation>", () => {
    beforeEach(() => {
        function mockFunctions(mockCircularReferenceErrors: CircularReferenceError[]) {
            const originalService = jest.requireActual('../../../services/calculationService');
            return {
                ...originalService,
                getCalculationCircularDependencies: jest.fn(() => Promise.resolve({
                    data: mockCircularReferenceErrors
                }))
            }
        }
        jest.mock('../../../services/calculationService', () => mockFunctions(mockCircularReferenceErrors));
    });

    it("renders CircularReferenceErrors when there are circular reference errors", async () => {
        const {EditTemplateCalculation} = require("../../../pages/Calculations/EditTemplateCalculation");
        const {getByText, getByTestId} = render(
            <MemoryRouter>
                <EditTemplateCalculation
                    excludeMonacoEditor={true}
                    history={history}
                    location={location}
                    match={matchMock} />
            </MemoryRouter>);

        fireEvent.click(getByTestId("build"));

        await waitFor(() => {
            expect(getByText("Calculations are not able to run due to the following problem")).toBeInTheDocument();
        });
    });
});

describe("<EditTemplateCalculation>", () => {
    beforeEach(() => {
        function mockFunctions(mockCircularReferenceErrors: CircularReferenceError[]) {
            const originalService = jest.requireActual('../../../services/calculationService');
            return {
                ...originalService,
                getCalculationCircularDependencies: jest.fn(() => Promise.resolve({
                    data: mockCircularReferenceErrors
                }))
            }
        }
        jest.mock('../../../services/calculationService', () => mockFunctions([]));
    });

    it("does not render CircularReferenceErrors when there are no circular reference errors", async () => {
        const {EditTemplateCalculation} = require("../../../pages/Calculations/EditTemplateCalculation");
        const {queryByTestId, getByTestId} = render(
            <MemoryRouter>
                <EditTemplateCalculation
                    excludeMonacoEditor={true}
                    history={history}
                    location={location}
                    match={matchMock} />
            </MemoryRouter>);

        fireEvent.click(getByTestId("build"));

        await waitFor(() => {
            expect(queryByTestId("Calculations are not able to run due to the following problem")).toBeNull();
        });
    });
});

const mockCircularReferenceErrors: CircularReferenceError[] = [{
    "node": {
        "calculationid": "f3d3fa7a-df89-445c-b150-2cece75de664",
        "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
        "calculationName": "Total Allocation",
        "calculationType": "Template",
        "fundingStream": "PSG"
    },
    "relationships": [{
        "source": {
            "calculationid": "f3d3fa7a-df89-445c-b150-2cece75de664",
            "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
            "calculationName": "Total Allocation",
            "calculationType": "Template",
            "fundingStream": "PSG"
        },
        "target": {
            "calculationid": "b58b38d7-60a6-48c7-8cf9-50e7737a5016",
            "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
            "calculationName": "Pupil rate threshold",
            "calculationType": "Template",
            "fundingStream": "PSG"
        }
    }]
},
{
    "node": {
        "calculationid": "b58b38d7-60a6-48c7-8cf9-50e7737a5016",
        "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
        "calculationName": "Pupil rate threshold",
        "calculationType": "Template",
        "fundingStream": "PSG"
    }, "relationships": [{
        "source": {
            "calculationid": "b58b38d7-60a6-48c7-8cf9-50e7737a5016",
            "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
            "calculationName": "Pupil rate threshold",
            "calculationType": "Template", "fundingStream": "PSG"
        },
        "target": {
            "calculationid": "9995b57e-1033-4f54-a4e2-d5b3cb691353",
            "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
            "calculationName": "Eligible Pupils",
            "calculationType": "Template",
            "fundingStream": "PSG"
        }
    }]
}, {
    "node": {
        "calculationid": "9995b57e-1033-4f54-a4e2-d5b3cb691353",
        "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
        "calculationName": "Eligible Pupils",
        "calculationType": "Template",
        "fundingStream": "PSG"
    }, "relationships": [{
        "source": {
            "calculationid": "9995b57e-1033-4f54-a4e2-d5b3cb691353",
            "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
            "calculationName": "Eligible Pupils",
            "calculationType": "Template",
            "fundingStream": "PSG"
        },
        "target": {
            "calculationid": "f3d3fa7a-df89-445c-b150-2cece75de664",
            "specificationId": "36e5c7db-45a1-400a-b436-700f8d512650",
            "calculationName": "Total Allocation",
            "calculationType": "Template",
            "fundingStream": "PSG"
        }
    }]
}];