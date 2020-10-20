import React from "react";
import {EditAdditionalCalculationRouteProps} from "../../../pages/Calculations/EditAdditionalCalculation";
import {createMemoryHistory, createLocation} from 'history';
import {match} from 'react-router';
import {MemoryRouter} from 'react-router-dom';
import {render, waitFor} from '@testing-library/react';
import {CircularReferenceError} from "../../../types/Calculations/CircularReferenceError";
import '@testing-library/jest-dom/extend-expect';
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {CalculationTypes} from "../../../types/Calculations/CreateAdditonalCalculationViewModel";
import {PublishStatus} from "../../../types/PublishStatusModel";

const history = createMemoryHistory();

const matchMock: match<EditAdditionalCalculationRouteProps> = {
    isExact: true,
    path: "",
    url: "",
    params: {
        calculationId: "123",
    }
};

const location = createLocation(matchMock.url);

jest.mock("../../../components/GdsMonacoEditor", () => <></>);

function renderEditAdditionalCalculation(){
    const {EditAdditionalCalculation} = require("../../../pages/Calculations/EditAdditionalCalculation");
    return render(
        <MemoryRouter>
            <EditAdditionalCalculation
                excludeMonacoEditor={true}
                history={history}
                location={location}
                match={matchMock} />
        </MemoryRouter>);
}
describe("<EditAdditionalCalculation>", () => {
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

        const {getByText} = renderEditAdditionalCalculation();

        await waitFor(() => {
            expect(getByText("Calculations are not able to run due to the following problem")).toBeInTheDocument();
        });
    });

    it("does not render CircularReferenceErrors when there are no circular reference errors", async () => {

        const {queryByTestId} = renderEditAdditionalCalculation();

        await waitFor(() => {
            expect(queryByTestId("Calculations are not able to run due to the following problem")).toBeNull();
        });
    });

    it("has a non-editable name field populated from the calculation service", async () =>{
        const {container} = renderEditAdditionalCalculation();

        await waitFor(() => {
            expect(container.querySelector("h2#calculation-name-title")).toHaveTextContent("Test Calculation Name");
        });
    })

    it("has a last update date populated from the calculation service", async () =>{
        const {container} = renderEditAdditionalCalculation();

        await waitFor(() => {
            expect(container.querySelector("span#last-saved-date")).toHaveTextContent("Last saved 1 February 2020 0:00 am");
        });
    })
});

const mockCalculation = {
    fundingStreamId: "1",
    sourceCode: "",
    specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
    valueType: CalculationTypes.Number,
    name: "Test Calculation Name",
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