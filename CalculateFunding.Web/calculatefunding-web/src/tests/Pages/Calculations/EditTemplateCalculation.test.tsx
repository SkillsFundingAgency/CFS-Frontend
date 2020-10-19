import React from "react";
import {EditTemplateCalculationRouteProps} from "../../../pages/Calculations/EditTemplateCalculation";
import {createMemoryHistory, createLocation} from 'history';
import {match} from 'react-router';
import {MemoryRouter} from 'react-router-dom';
import {render, waitFor, fireEvent} from '@testing-library/react';
import {CircularReferenceError} from "../../../types/Calculations/CircularReferenceError";
import '@testing-library/jest-dom/extend-expect';
import {CalculationTypes} from "../../../types/Calculations/CreateAdditonalCalculationViewModel";
import {PublishStatus} from "../../../types/PublishStatusModel";
import {SpecificationSummary} from "../../../types/SpecificationSummary";

const history = createMemoryHistory();

const matchMock: match<EditTemplateCalculationRouteProps> = {
    isExact: true,
    path: "",
    url: "",
    params: {
        calculationId: "123"
    }
};

const location = createLocation(matchMock.url);

jest.mock("../../../components/GdsMonacoEditor", () => <></>);

describe("<EditTemplateCalculation>", () => {
    beforeEach(() => {
        function mockCalculationFunctions(mockCircularReferenceErrors: CircularReferenceError[], mockCalculation: any) {
            const originalService = jest.requireActual('../../../services/calculationService');
            return {
                ...originalService,
                getCalculationCircularDependencies: jest.fn(() => Promise.resolve({
                    data: mockCircularReferenceErrors
                })),
                getCalculationByIdService: jest.fn(() => Promise.resolve({
                    data: mockCalculation
                })),
                getIsUserAllowedToApproveCalculationService: jest.fn(() => Promise.resolve({
                    data: true
                }))
            }
        }
        function mockSpecificationFunctions(mockSpecificationSummary: SpecificationSummary) {
            const originalService = jest.requireActual('../../../services/specificationService');
            return {
                ...originalService,
                getSpecificationSummaryService: jest.fn((specificationId) => Promise.resolve({
                    data: mockSpecificationSummary
                }))
            }
        }
        jest.mock('../../../services/calculationService', () => mockCalculationFunctions(mockCircularReferenceErrors, mockCalculation));
        jest.mock('../../../services/specificationService', () => mockSpecificationFunctions(mockSpecificationSummary));
    });

    it("renders CircularReferenceErrors when there are circular reference errors", async () => {
        const {EditTemplateCalculation} = require("../../../pages/Calculations/EditTemplateCalculation");
        const {getByText} = render(
            <MemoryRouter>
                <EditTemplateCalculation
                    excludeMonacoEditor={true}
                    history={history}
                    location={location}
                    match={matchMock} />
            </MemoryRouter>);

        await waitFor(() => {
            expect(getByText("Calculations are not able to run due to the following problem")).toBeInTheDocument();
        });
    });

    it('enables approve button given user is allowed to approve calculation', async () => {
        const {EditTemplateCalculation} = require("../../../pages/Calculations/EditTemplateCalculation");
        const {getByText} = render(
            <MemoryRouter>
                <EditTemplateCalculation
                    excludeMonacoEditor={true}
                    history={history}
                    location={location}
                    match={matchMock} />
            </MemoryRouter>);

        await waitFor(() => {
            expect(getByText("Approve")).toBeInTheDocument();
            expect(getByText("Approve")).toBeEnabled();
        });
    });
});

describe("<EditTemplateCalculation>", () => {
    beforeEach(() => {
        function mockCalculationFunctions(mockCircularReferenceErrors: CircularReferenceError[], mockCalculation: any) {
            const originalService = jest.requireActual('../../../services/calculationService');
            return {
                ...originalService,
                getCalculationCircularDependencies: jest.fn(() => Promise.resolve({
                    data: mockCircularReferenceErrors
                })),
                getCalculationByIdService: jest.fn(() => Promise.resolve({
                    data: mockCalculation
                })),
                getIsUserAllowedToApproveCalculationService: jest.fn(() => Promise.resolve({
                    data: false
                }))
            }
        }
        function mockSpecificationFunctions(mockSpecificationSummary: SpecificationSummary) {
            const originalService = jest.requireActual('../../../services/specificationService');
            return {
                ...originalService,
                getSpecificationSummaryService: jest.fn((specificationId) => Promise.resolve({
                    data: mockSpecificationSummary
                }))
            }
        }
        jest.mock('../../../services/calculationService', () => mockCalculationFunctions([], mockCalculation));
        jest.mock('../../../services/specificationService', () => mockSpecificationFunctions(mockSpecificationSummary));
    });

    it("does not render CircularReferenceErrors when there are no circular reference errors", async () => {
        const {EditTemplateCalculation} = require("../../../pages/Calculations/EditTemplateCalculation");
        const {queryByTestId} = render(
            <MemoryRouter>
                <EditTemplateCalculation
                    excludeMonacoEditor={true}
                    history={history}
                    location={location}
                    match={matchMock} />
            </MemoryRouter>);

        await waitFor(() => {
            expect(queryByTestId("Calculations are not able to run due to the following problem")).toBeNull();
        });
    });

    it('disables approve button given user is allowed to approve calculation', async () => {
        const {EditTemplateCalculation} = require("../../../pages/Calculations/EditTemplateCalculation");
        const {getByText} = render(
            <MemoryRouter>
                <EditTemplateCalculation
                    excludeMonacoEditor={true}
                    history={history}
                    location={location}
                    match={matchMock} />
            </MemoryRouter>);

        await waitFor(() => {
            expect(getByText("Approve")).toBeInTheDocument();
            expect(getByText("Approve")).not.toBeEnabled();
        });
    });
});


const mockCalculation = {
    fundingStreamId: "1",
    sourceCode: "",
    specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
    valueType: CalculationTypes.Number,
    name: "",
    publishStatus: PublishStatus.Draft,
    lastUpdated: new Date(2020, 1, 1)
}

const mockSpecificationSummary: SpecificationSummary = {
    name: "spec",
    id: "36e5c7db-45a1-400a-b436-700f8d512650",
    approvalStatus: "Approved",
    isSelectedForFunding: false,
    description: "description",
    providerVersionId: "1",
    fundingStreams: [],
    fundingPeriod: {
        id: "321",
        name: "period"
    }
}

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