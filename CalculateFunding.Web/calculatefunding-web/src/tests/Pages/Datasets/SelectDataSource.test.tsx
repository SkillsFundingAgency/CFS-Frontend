import React from 'react';
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {SelectDataSource, SelectDataSourceRouteProps} from "../../../pages/Datasets/SelectDataSource";
import {EffectiveSpecificationPermission} from "../../../types/EffectiveSpecificationPermission";
import {render, waitFor} from "@testing-library/react";
import {getDatasourcesByRelationshipIdService} from "../../../services/datasetService";
import '@testing-library/jest-dom/extend-expect';
/*const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});*/

const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<SelectDataSourceRouteProps> = {
    params: {
        datasetRelationshipId: "123"
    },
    path:"",
    isExact: true,
};
const permissionsState: EffectiveSpecificationPermission = {
    specificationId: "555",
    userId: "",
    canMapDatasets: true,
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateQaTests: false,
    canCreateSpecification: false,
    canDeleteCalculations: false,
    canDeleteQaTests: false,
    canDeleteSpecification: false,
    canEditCalculations: false,
    canEditQaTests: false,
    canEditSpecification: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canApproveTemplates: false
};
const noPermissionsState: EffectiveSpecificationPermission = {
    specificationId: "555",
    userId: "",
    canMapDatasets: false,
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateQaTests: false,
    canCreateSpecification: false,
    canDeleteCalculations: false,
    canDeleteQaTests: false,
    canDeleteSpecification: false,
    canEditCalculations: false,
    canEditQaTests: false,
    canEditSpecification: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canApproveTemplates: false
};
function mockUserService(permissions: EffectiveSpecificationPermission) {
    const originalService = jest.requireActual("../../../services/userService");
    return {
        ...originalService,
        getUserPermissionsService: jest.fn(() => Promise.resolve({
            data: permissions
        }))
    }
}
function mockUserServiceWithMappingPermissions() {
    return mockUserService(permissionsState);
}
function mockUserServiceWithoutPermissions() {
    return mockUserService(noPermissionsState);
}
function mockDatasetService() {
    const originalService = jest.requireActual("../../../services/datasetService");
    return {
        ...originalService,
        getDatasourcesByRelationshipIdService: jest.fn(() => Promise.resolve({
            data: permissionsState
        }))
    }
}
const renderPage = () => {
    const {SelectDataSource} = require("../../../pages/Datasets/SelectDataSource");
    return render(
        <MemoryRouter>
            <SelectDataSource match={matchMock} location={location} history={history} />
        </MemoryRouter>);
};

describe("SelectDataSource without mapping permissions", () => {
    beforeAll(() => {
        jest.mock("../../../services/userService", () => mockUserServiceWithoutPermissions());
        jest.mock("../../../services/datasetService", () => mockDatasetService());
    });
    it("fetches dataset relationship", async () => {
        const {getDatasourcesByRelationshipIdService} = require('../../../services/datasetService');
        renderPage();
        await waitFor(() => expect(getDatasourcesByRelationshipIdService).toBeCalled());
    });
    
    it("fetches specification permissions", async () => {
        const {getUserPermissionsService} = require('../../../services/userService');
        renderPage();
        await waitFor(() => expect(getUserPermissionsService).toBeCalled());
    });
    
    it("renders permissions alert", async () => {
        const {getByTestId} = renderPage();
        await waitFor(() => {
            expect(getByTestId('permission-alert-message')).toBeInTheDocument();
        });
    });
});

describe("SelectDataSource with permissions", () => {
    beforeAll(() => {
        jest.mock("../../../services/userService", () => mockUserServiceWithMappingPermissions());
        jest.mock("../../../services/datasetService", () => mockDatasetService());
    });
    it("fetches dataset relationship", async () => {
        const {getDatasourcesByRelationshipIdService} = require('../../../services/datasetService');
        renderPage();
        await waitFor(() => expect(getDatasourcesByRelationshipIdService).toBeCalled());
    });
    
    it("fetches specification permissions", async () => {
        const {getUserPermissionsService} = require('../../../services/userService');
        renderPage();
        await waitFor(() => expect(getUserPermissionsService).toBeCalled());
    });
    
    it("does not render permissions alert", async () => {
        const {queryByTestId} = renderPage();
        await waitFor(() => {
            expect(queryByTestId('permission-alert-message')).toBeNull();
        });
    });
    
    it('renders correct breadcrumbs', async () => {
        const {container} = renderPage();
        const breadcrumbs = container.querySelector(".govuk-breadcrumbs__list");
        expect(breadcrumbs).not.toBeNull();
        expect(breadcrumbs.children.length).toBe(5);
    });
});
