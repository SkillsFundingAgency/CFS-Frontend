import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {cleanup, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {getDatasetBySpecificationIdService} from "../../../services/datasetService";

const renderDatasets = () => {
    const {Datasets} = require('../../../components/Specifications/Datasets');
    return render(<MemoryRouter initialEntries={['/Datasets/SPEC123']}>
        <Switch>
            <Route path="/Datasets/:specificationId" component={Datasets}/>
        </Switch>
    </MemoryRouter>)
}

beforeAll(() => {
    function mockDatasetBySpecificationIdService() {
        const datasetBySpecificationIdService = jest.requireActual('../../../services/datasetService');
        return {
            ...datasetBySpecificationIdService,
            getDatasetBySpecificationIdService: jest.fn(() => Promise.resolve({
                data: {
                    statusCode: 1,
                    content: [{
                        definition: {
                            description: "",
                            id: "",
                            name: ""
                        },
                        relationshipDescription: "",
                        isProviderData: false,
                        id: "",
                        name: ""
                    }]
                }
            }))
        }
    }

    jest.mock('../../../services/datasetService', () => mockDatasetBySpecificationIdService());
})

afterEach(cleanup);

describe("<VariationManagement /> ", () => {
    it("calls datasetBySpecificationIdService from the specificationService", async () => {
        const {getDatasetBySpecificationIdService} = require('../../../services/datasetService');
        renderDatasets();
        await waitFor(() => expect(getDatasetBySpecificationIdService).toBeCalled())
    });
});