﻿import React from 'react';
import {FundingStreamPermissions} from "../../../types/FundingStreamPermissions";
import * as redux from "react-redux";
import {waitFor, screen, render} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {MemoryRouter} from 'react-router-dom';
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {CloneTemplate} from "../../../pages/Templates/CloneTemplate";
import {Route, Switch} from "react-router";
import {TemplateResponse} from "../../../types/TemplateBuilderDefinitions";

const fetchMock = new MockAdapter(axios);
const useSelectorSpy = jest.spyOn(redux, 'useSelector');

export const noPermissionsState: FundingStreamPermissions[] = [{
    fundingStreamId: "MPG",
    userId: "",
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
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canApproveTemplates: false
}];

export const permissionsState: FundingStreamPermissions[] = [{
    fundingStreamId: "MPG",
    userId: "",
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
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
    canApproveTemplates: true
}];

const mockTemplateToCloneFrom: TemplateResponse = {
    templateId: "12352346",
    name: "template name",
    description: "lorem ipsum",
    fundingStreamId: "MPG",
    fundingStreamName: "Magic Potions Grant",
    fundingPeriodId: "2021",
    fundingPeriodName: "Period 2021",
    majorVersion: 3,
    minorVersion: 2,
    version: 12,
    isCurrentVersion: true,
    status: "Draft",
    schemaVersion: "1.1",
    templateJson: "{}",
    authorId: "",
    authorName: "",
    lastModificationDate: new Date(),
    publishStatus: "",
    comments: ""
};

beforeAll(() => {
    function mockFunctions(mockData: TemplateResponse) {
        const originalService = jest.requireActual('../../../services/templateBuilderDatasourceService');
        return {
            ...originalService,
            getTemplateVersion: jest.fn(() => Promise.resolve({
                data: mockData,
                status: 200
            }))
        }
    }

    jest.mock('../../../services/templateBuilderDatasourceService', () => mockFunctions(mockTemplateToCloneFrom));
});

afterAll(() => {
    jest.clearAllMocks();
    fetchMock.reset();
});

const renderCloneTemplatePage = () => {
    const {CloneTemplate} = require('../../../pages/Templates/CloneTemplate');
    return render(<MemoryRouter initialEntries={[`/Templates/${mockTemplateToCloneFrom.templateId}/Clone/${mockTemplateToCloneFrom.version}`]}>
        <Switch>
            <Route path="/Templates/:templateId/Clone/:version" component={CloneTemplate}/>
        </Switch>
    </MemoryRouter>);
}

describe("Clone Template page when I have no create permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(noPermissionsState);
    });

    it("renders a permission status warning", async () => {
        const {getByTestId} = renderCloneTemplatePage();
        await waitFor(() => expect(getByTestId("permission-alert-message")).toBeInTheDocument());
    });
});

describe("Clone Template page when I have create permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);

        fetchMock.onGet("/api/templates/build/available-stream-periods").reply(200, [{
            "fundingStream": {
                "id": "MPG",
                "name": "Magic Potions Grant"
            },
            "fundingPeriods": [{
                "id": "MPG-2021",
                "name": "Period 2021"
            }]
        }]);
    });

    afterEach(() => {
        fetchMock.reset();
    });

    it("does not render a permission status warning", async () => {
        renderCloneTemplatePage();
        await waitFor(() => {
            expect(screen.queryByText("You do not have permissions to perform the following actions")).not.toBeInTheDocument();
        });
    });

    it("does not render any errors", async () => {
        renderCloneTemplatePage();
        await waitFor(() => {
            expect(screen.queryByText("There is a problem")).not.toBeInTheDocument();
        });
    });

    it("does render funding period drop down list with correct options", async () => {
        const {getByTestId, getByText, container} = renderCloneTemplatePage();
        await waitFor(() => {
            expect(screen.queryByText("Select a funding stream")).not.toBeInTheDocument();
            expect(getByText("Select a funding period")).toBeInTheDocument();
            expect(getByTestId("fundingPeriodId")).toBeInTheDocument();
            expect(container.querySelector('option')).toBeInTheDocument();
            expect(screen.getByDisplayValue("Period 2021")).toBeInTheDocument();
        });
    });
});

describe("Clone Template page when no funding streams exist", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
        fetchMock.onGet("/api/templates/build/available-stream-periods").reply(200, []);
    });

    afterEach(() => {
        fetchMock.reset();
    });

    it("renders an error message", async () => {
        const {getByText, container} = renderCloneTemplatePage();
        await waitFor(() => {
            expect(getByText("There is a problem")).toBeInTheDocument();
            expect(screen.queryByTestId("fundingStreamId")).not.toBeInTheDocument();
            expect(screen.queryByTestId("fundingPeriodId")).not.toBeInTheDocument();
            expect(container.querySelector('option')).not.toBeInTheDocument();
        });
    });
});

describe("Clone Template page when a funding stream exists but I don't have permissions for it", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
        fetchMock.onGet("/api/templates/build/available-stream-periods").reply(200, [{
            "fundingStream": {
                "id": "DAG",
                "name": "Dark Arts Grant"
            },
            "fundingPeriods": [{
                "id": "DAG-2021",
                "name": "Period 2021"
            }]
        }]);
    });

    afterEach(() => {
        fetchMock.reset();
    });

    it("renders an error message", async () => {
        const {getByText, container} = renderCloneTemplatePage();
        await waitFor(() => {
            expect(getByText("There is a problem")).toBeInTheDocument();
            expect(screen.queryByTestId("fundingStreamId")).not.toBeInTheDocument();
            expect(screen.queryByTestId("fundingPeriodId")).not.toBeInTheDocument();
            expect(container.querySelector('option')).not.toBeInTheDocument();
        });
    });
});