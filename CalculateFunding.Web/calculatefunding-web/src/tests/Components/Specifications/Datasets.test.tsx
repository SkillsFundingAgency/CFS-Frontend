import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {cleanup, render, waitFor, screen, act} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

const renderDatasets = async() => {
    const {Datasets} = require('../../../components/Specifications/Datasets');
    const page = render(<MemoryRouter initialEntries={['/Datasets/SPEC123']}>
        <Switch>
            <Route path="/Datasets/:specificationId">
                <Datasets specificationId={"SPEC123"} />
            </Route>
        </Switch>
    </MemoryRouter>)

    await waitFor(() => {
        expect(screen.getByText("Loading datasets")).not.toBeVisible()
    });

    return page;
}

beforeAll(() => {
    function mockDatasetBySpecificationIdService() {
        const datasetBySpecificationIdService = jest.requireActual('../../../services/datasetService');
        return {
            ...datasetBySpecificationIdService,
            getDatasetBySpecificationIdService: jest.fn(() => Promise.resolve({
                status: 200,
                data: {
                    statusCode: 1,
                    content: [{
                        definition: {
                            description: "",
                            id: "",
                            name: "definition1"
                        },
                        relationshipDescription: "",
                        isProviderData: false,
                        converterEligible: false,
                        converterEnabled: false,
                        id: "",
                        name: ""
                    },
                    {
                        definition: {
                            description: "",
                            id: "",
                            name: "definition2"
                        },
                        relationshipDescription: "",
                        isProviderData: false,
                        converterEligible: true,
                        converterEnabled: false,
                        id: "Con123",
                        name: ""
                    }]
                }
            }))
        }
    }

    jest.mock('../../../services/datasetService', () => mockDatasetBySpecificationIdService());
})

afterEach(cleanup);

describe("<Datasets /> ", () => {
    beforeEach(async() => {
        await renderDatasets();
    });

    it("calls datasetBySpecificationIdService from the specificationService", async () => {
        const {getDatasetBySpecificationIdService} = require('../../../services/datasetService');
        expect(getDatasetBySpecificationIdService).toBeCalled();
    });

    it('renders definitions correctly', async()=>{
        expect(await screen.findByText(/definition1/)).toBeInTheDocument();
    })

    it('renders the map data source file to data set link correctly', async () => {
        const button = await screen.findByRole("link", {name: /Map data source file to data set/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Datasets/DataRelationships/SPEC123");
    });

    it('renders the create dataset link correctly', async () => {
        const button = await screen.findByRole("link", {name: /Create dataset/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Datasets/CreateDataset/SPEC123");
    });
});