import React from "react";
import {MemoryRouter} from "react-router";
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {AdditionalCalculations} from "../../../components/Calculations/AdditionalCalculations";

beforeAll(() =>{
    function mockAdditionalCalculationsService(){
        const additionalCalcsService = jest.requireActual('../../../services/calculationService');
        return {
            ...additionalCalcsService,
            getCalculationsService: jest.fn(() => {
                Promise.resolve({
                    data: {
                        "totalCount":2,
                        "totalErrorCount":0,
                        "facets":[],
                        "results":
                            [
                                {
                                    "id":"d67ab7df-7d8e-4a16-aa8c-797f0902f191",
                                    "name":"Pupils",
                                    "fundingStreamId":"N/A",
                                    "specificationId":"3c9fa5d6-8018-4cf0-bb9c-f4807a5cc44f",
                                    "specificationName":"Rob training test DSG",
                                    "valueType":"Number",
                                    "calculationType":"Additional",
                                    "namespace":"Additional",
                                    "wasTemplateCalculation":false,
                                    "description":null,
                                    "status":"Draft",
                                    "lastUpdatedDate":"2020-09-30T17:51:13.292+01:00"
                                },
                                {
                                    "id":"7931bc31-2f20-4502-a3ac-3ccdeadc491e",
                                    "name":"Pupils 2",
                                    "fundingStreamId":"N/A",
                                    "specificationId":"3c9fa5d6-8018-4cf0-bb9c-f4807a5cc44f",
                                    "specificationName":"Rob training test DSG",
                                    "valueType":"Number",
                                    "calculationType":"Additional",
                                    "namespace":"Additional",
                                    "wasTemplateCalculation":false,
                                    "description":null,
                                    "status":"Draft",
                                    "lastUpdatedDate":"2020-09-30T17:49:25.791+01:00"
                                }
                                ]
                    }
                })
            })
        }
    }

    jest.mock('../../../services/calculationService', () => mockAdditionalCalculationsService());
})

afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    }
)
const renderAdditionalCalculation = () => {
    return render(<MemoryRouter><AdditionalCalculations specificationId={"Spec123"}/></MemoryRouter>);
}

describe('<Additional Calculations />', () => {
    it('shows the Additional Calculations title', async () => {
        renderAdditionalCalculation();
        const headline = await screen.findByText("Additional calculations");
        expect(headline).toBeInTheDocument();
    });
});