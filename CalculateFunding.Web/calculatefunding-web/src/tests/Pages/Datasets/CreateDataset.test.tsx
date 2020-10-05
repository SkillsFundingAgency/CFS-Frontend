import {cleanup, render, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import React from "react";

function renderCreateDatasetPage(){
    const {CreateDataset} = require('../../../pages/Datasets/CreateDataset');
    return render(<MemoryRouter initialEntries={['/Datasets/CreateDataset/SPEC123']}>
        <Switch>
            <Route path="/Datasets/CreateDataset/:specificationId" component={CreateDataset} />
        </Switch>
    </MemoryRouter> )
}

beforeAll(() => {
    function mockSpecificationService() {
        const specificationService = jest.requireActual('../../../services/specificationService');
        return {
            ...specificationService,
            getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                data: {
                    name: "Specification Name",
                    id: "SPEC123",
                    approvalStatus: "Draft",
                    isSelectedForFunding: true,
                    description: "Test Description",
                    providerVersionId: "PROVID123",
                    fundingStreams: ["PSG"],
                    fundingPeriod: {
                        id: "fp123",
                        name: "fp 123"
                    }
                }
            }))
        }
    }

    function mockDatasetService() {
        const specificationService = jest.requireActual('../../../services/datasetService');
        return {
            ...specificationService,
            getDatasetsForFundingStreamService: jest.fn(() => Promise.resolve({
                data: [
                    {"id":"1490999","name":"PE and Sport Grant","description":"PE and Sport Grant"},
                    {"id":"1221999","name":"PE and Sport Grant e2e","description":"PE and Sport Grant e2e"}
                    ]
            }))
        }
    }

    jest.mock('../../../services/specificationService', () => mockSpecificationService());
    jest.mock('../../../services/datasetService', () => mockDatasetService());
});

afterEach(cleanup);

describe("<CreateDataset /> service call checks ", () =>{
    it("it calls specification service", async()=> {
        const {getSpecificationSummaryService} = require('../../../services/specificationService');
        renderCreateDatasetPage();
        await waitFor(() => expect(getSpecificationSummaryService).toBeCalled())
    });
});

describe("<CreateDataset /> is rendered correctly ", () => {
   it("shows the Create Dataset title", async () => {
       const {container} = renderCreateDatasetPage();
       await waitFor(() => expect(container.querySelector("#create-dataset-headline")).toHaveClass("govuk-heading-xl"));
   });
});