import '@testing-library/jest-dom/extend-expect';
import React from "react";
import {MemoryRouter} from "react-router";
import {render, screen, waitFor} from "@testing-library/react";
import * as errorHook from "../../../hooks/useErrors";
import {Route, Switch} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";
describe("<DataRelationships />", () => {

    beforeEach(async () => {
        mockDatasetrelationships();
        await renderPage();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("service call checks ", () => {
        it("calls the correct services on initial page load", async () => {
            const {searchDatasetRelationships} = require('../../../services/datasetRelationshipsService');
            await waitFor(() => expect(searchDatasetRelationships).toBeCalledTimes(1));
        })
    });

    describe("render page ", () => {
        it("displays dataset relationship items", async () => {
            const listTable = screen.getByTestId("datarelationship-table") as HTMLTableElement;
            expect(listTable.rows.length).toBe(3);
        })

        it("displays link to mapping data source file", async () => {
            const link = screen.getByText("Map data source file") as HTMLLinkElement;
            expect(link.href).toContain(`/Datasets/SelectDataSource/${mockSpecificationDatasetRelationshipsViewModel.items[1].relationshipId}`);
        })

        it("No data source files uploaded to map to", async () => {
            expect(screen.getByText("No data source files uploaded to map to")).toBeInTheDocument();
        })
    });
});

const mockErrorHook = jest.spyOn(errorHook, 'useErrors');
mockErrorHook.mockImplementation(() => {
    return {
        errors: [],
        clearErrorMessages: fieldNames => {},
        addErrorMessage: (errorMessage, description, fieldName, suggestion) => {},
        addError: ({error, description, fieldName, suggestion}) => {},
        addValidationErrors: ({validationErrors, message, description, fieldName}) => {}
    }
});

const mockSpecificationDatasetRelationshipsViewModel = {
    items: [
        {
            definitionId: "",
            definitionName: "definitionName 1",
            definitionDescription: "definitionDescription 1",
            datasetName: "",
            relationshipDescription: "",
            datasetVersion: 0,
            datasetId: "",
            relationshipId: "",
            relationName: "relationName 1",
            isProviderData: false,
            datasetPhrase: "",
            linkPhrase: "",
            isLatestVersion: false,
            lastUpdatedDate: Date,
            lastUpdatedAuthorName: "",
            hasDataSourceFileToMap: false
        },
        {
            definitionId: "",
            definitionName: "definitionName 2",
            definitionDescription: "definitionDescription 2",
            datasetName: "",
            relationshipDescription: "",
            datasetVersion: 0,
            datasetId: "",
            relationshipId: "2",
            relationName: "relationName 2",
            isProviderData: false,
            datasetPhrase: "",
            linkPhrase: "Map data source file",
            isLatestVersion: false,
            lastUpdatedDate: Date,
            lastUpdatedAuthorName: "",
            hasDataSourceFileToMap: true
        }
    ],
    specification: {
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [],
        providerVersionId: "",
        description: "",
        isSelectedForFunding: false,
        approvalStatus: "",
        templateIds: {[""]: []},
        id: "",
        name: "test spec",
        lastEditedDate: Date,
        dataDefinitionRelationshipIds: []
    },
    specificationTrimmedViewModel: {
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [],
        description: "",
        publishStatus: 0,
        id: "",
        name: "",
    }
}

const mockDatasetrelationships = () => {
    jest.mock("../../../services/datasetRelationshipsService", () => {
        const service = jest.requireActual("../../../services/datasetRelationshipsService");
        return {
            ...service,
            searchDatasetRelationships: jest.fn(() => Promise.resolve({
                data: mockSpecificationDatasetRelationshipsViewModel
            }))
        }
    });
}

const renderPage = async () => {
    const {DataRelationships} = require('../../../pages/Datasets/DataRelationships');
    const component = render(<MemoryRouter initialEntries={['/Datasets/DataRelationships/spec123']}>
        <QueryClientProvider client={new QueryClient()}>
            <Switch>
                <Route path="/Datasets/DataRelationships/:specificationId" component={DataRelationships} />
            </Switch>
        </QueryClientProvider>
    </MemoryRouter>);
    await waitFor(() => {
        expect(screen.getByText("Loading datasets")).toBeInTheDocument();
    });
    return component;
};