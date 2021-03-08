import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {cleanup, render, waitFor, screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {getDatasetBySpecificationIdService} from "../../../services/datasetService";

const renderDatasets = () => {
    const {Datasets} = require('../../../components/Specifications/Datasets');
    return render(<MemoryRouter initialEntries={['/Datasets/SPEC123']}>
        <Switch>
            <Route path="/Datasets/:specificationId">
                <Datasets specificationId={"SPEC123"} />
            </Route>
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

    it('renders the map data source file to data set link correctly', async () => {
        renderDatasets();
        const button = await screen.findByRole("link", {name: /Map data source file to data set/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Datasets/DataRelationships/SPEC123");
    });

    it('renders the create dataset link correctly', async () => {
        renderDatasets();
        const button = await screen.findByRole("link", {name: /Create dataset/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Datasets/CreateDataset/SPEC123");
    });
});