import React from 'react';
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {SelectDataSourceRouteProps} from "../../../pages/Datasets/SelectDataSource";
import {render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {getDatasourcesByRelationshipIdService} from "../../../services/datasetService";
import * as hooks from "../../../hooks/useSpecificationPermissions";
import {SpecificationPermissions} from "../../../hooks/useSpecificationPermissions";
import {DatasourceRelationshipResponseViewModel} from "../../../types/Datasets/DatasourceRelationshipResponseViewModel";
import {SpecificationSummary} from "../../../types/SpecificationSummary";

jest.spyOn(global.console, 'info').mockImplementation(() => jest.fn());

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<SelectDataSourceRouteProps> = {
    params: {
        datasetRelationshipId: "123"
    },
    path: "",
    isExact: true,
    url: ""
};
const mockRelationshipData: DatasourceRelationshipResponseViewModel = {
    specificationId: "asdfga",
    datasets: [],
    definitionId: "asdfa",
    definitionName: "Definition name",
    relationshipId: "34524",
    relationshipName: "relationship name",
    specificationName: "Spec Name"
};
const mockSpecificationSummary: SpecificationSummary = {
    id: "asdfga",
    approvalStatus: "", description: "", fundingPeriod: {id: "", name: ""}, fundingStreams: [], isSelectedForFunding: false, name: "", providerVersionId: "",
};

function mockDatasetService() {
    const originalService = jest.requireActual("../../../services/datasetService");
    return {
        ...originalService,
        getDatasourcesByRelationshipIdService: jest.fn(() => Promise.resolve({
            data: mockRelationshipData
        })),
    }
}

function mockSpecificationService() {
    const originalService = jest.requireActual("../../../services/specificationService");
    return {
        ...originalService,
        getSpecificationSummaryService: jest.fn(() => Promise.resolve({
            data: mockSpecificationSummary
        })),
    }
}

const renderPage = () => {
    const {SelectDataSource} = require("../../../pages/Datasets/SelectDataSource");
    return render(
        <MemoryRouter>
            <SelectDataSource match={matchMock} location={location} history={history}/>
        </MemoryRouter>);
};

describe("<SelectDataSource/>", () => {
    describe("when user without mapping permissions", () => {
        beforeAll(() => {
            jest.mock("../../../services/datasetService", () => mockDatasetService());
            jest.mock("../../../services/specificationService", () => mockSpecificationService());
            jest.spyOn(hooks, 'useSpecificationPermissions').mockImplementation(
                () => ({
                    missingPermissions: [SpecificationPermissions.MapDatasets],
                    canMapDatasets: false,
                    canApproveFunding: false,
                    canCreateSpecification: false,
                    canEditSpecification: false,
                    canRefreshFunding: false,
                    canReleaseFunding: false
                }));
        });
        it("fetches dataset relationship", async () => {
            const {getDatasourcesByRelationshipIdService} = require('../../../services/datasetService');
            renderPage();
            await waitFor(() => expect(getDatasourcesByRelationshipIdService).toBeCalled());
        });

        it("does not render permissions alert initially", async () => {
            const {queryByTestId} = renderPage();
            expect(queryByTestId('permission-alert-message')).toBeNull();
        });

        it("renders permissions alert after finished loading", async () => {
            const {getSpecificationSummaryService} = require('../../../services/specificationService');
            const {getByTestId} = renderPage();
            await waitFor(() => expect(getSpecificationSummaryService).toBeCalled());
            await waitFor(() => expect(getByTestId('permission-alert-message')).toBeInTheDocument());
        });
    });

    describe("when user with permissions", () => {
        beforeAll(() => {
            jest.mock("../../../services/datasetService", () => mockDatasetService());
            jest.mock("../../../services/specificationService", () => mockSpecificationService());
            jest.spyOn(hooks, 'useSpecificationPermissions').mockImplementation(
                () => ({
                    missingPermissions: [],
                    canMapDatasets: true,
                    canApproveFunding: false,
                    canCreateSpecification: false,
                    canEditSpecification: false,
                    canRefreshFunding: false,
                    canReleaseFunding: false
                }));
        });

        it("fetches dataset relationship", async () => {
            const {getDatasourcesByRelationshipIdService} = require('../../../services/datasetService');
            renderPage();
            await waitFor(() => expect(getDatasourcesByRelationshipIdService).toBeCalled());
        });

        it("fetches specification", async () => {
            const {getSpecificationSummaryService} = require('../../../services/specificationService');
            renderPage();
            await waitFor(() => expect(getSpecificationSummaryService).toBeCalled());
        });

        it("does not render permissions alert after finished loading", async () => {
            const {getSpecificationSummaryService} = require('../../../services/specificationService');
            const {queryByTestId} = renderPage();
            await waitFor(() => expect(getSpecificationSummaryService).toBeCalled());
            await waitFor(() => expect(queryByTestId('permission-alert-message')).toBeNull());
        });

        it('renders correct breadcrumbs', async () => {
            const {container} = renderPage();
            await waitFor(() => {
                const breadcrumbs = container.querySelector(".govuk-breadcrumbs__list");
                expect(breadcrumbs).not.toBeNull();
                if (breadcrumbs) {
                    expect(breadcrumbs.children.length).toBe(5);
                }
            });
        });
    });
});
