﻿import React from "react";
import {ListTemplates} from "../../../pages/Templates/ListTemplates";
import {FundingStreamPermissions} from "../../../types/FundingStreamPermissions";
import * as redux from "react-redux";
import {MemoryRouter} from "react-router";
import {TemplateSearchResponse} from "../../../types/TemplateBuilderDefinitions";
import {render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

export const mockTemplateResults: TemplateSearchResponse = {
    totalCount: 2,
    totalErrorCount: 0,
    facets: [],
    results: [
        {
            id: "1111111",
            name: "template name",
            fundingStreamId: "DSG",
            fundingPeriodId: "1920",
            currentMajorVersion: 0,
            currentMinorVersion: 1,
            version: 1,
            lastUpdatedAuthorName: "testUser",
            lastUpdatedDate: new Date(),
            fundingStreamName: "Magical Arts Grant",
            fundingPeriodName: "2019-2020",
            hasReleasedVersion: false,
            publishedMajorVersion: 0,
            publishedMinorVersion: 0
        },
        {
            id: "2222222",
            name: "template name",
            fundingStreamId: "PSG",
            fundingPeriodId: "2021",
            currentMajorVersion: 0,
            currentMinorVersion: 1,
            version: 1,
            lastUpdatedAuthorName: "testUser",
            lastUpdatedDate: new Date(),
            fundingStreamName: "Potions and Spells Grant",
            fundingPeriodName: "2019-2020",
            hasReleasedVersion: false,
            publishedMajorVersion: 0,
            publishedMinorVersion: 0
        }]
};
export const mockNoTemplateResults: TemplateSearchResponse = {
    totalCount: 0,
    totalErrorCount: 0,
    facets: [],
    results: []
};

function mockSearchForTemplates(response: TemplateSearchResponse) {
    const originalService = jest.requireActual('../../../services/templateBuilderDatasourceService');
    return {
        ...originalService,
        searchForTemplates: jest.fn(() => Promise.resolve({
            data: response
        }))
    }
}

export const noPermissionsState: FundingStreamPermissions[] = [{
    fundingStreamId: "DSG",
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
    fundingStreamId: "DSG",
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

const renderListTemplatesPage = () => {
    const {ListTemplates} = require('../../../pages/Templates/ListTemplates');
    return render(<MemoryRouter><ListTemplates/></MemoryRouter>);
}

beforeAll(() => {
    jest.mock('../../../services/templateBuilderDatasourceService', () => mockSearchForTemplates(mockTemplateResults));
})

describe("List Templates when I don't have permissions to create templates", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(noPermissionsState);
    });

    it("does not render a create template link", async () => {
        const {queryByTestId} = renderListTemplatesPage();
        await waitFor(() => {
            expect(queryByTestId("create-template-link")).not.toBeInTheDocument();
        });
    });

    it("does not render a permission status warning", async () => {
        const {queryByTestId} = renderListTemplatesPage();
        await waitFor(() => expect(queryByTestId("permission-alert-message")).toBeInTheDocument());
    });
});

describe("List Templates when I have permissions to create templates", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });

    it("renders a create template link", async () => {
        const {queryByTestId} = renderListTemplatesPage();
        await waitFor(() => {
            expect(queryByTestId("create-template-link")).toBeInTheDocument();
            expect(queryByTestId("create-template-link")).toHaveAttribute('href', expect.stringMatching('/Templates/Create'));
        });
    });

    it("does not render a permission status warning", async () => {
        const {queryByTestId} = renderListTemplatesPage();
        await waitFor(() => expect(queryByTestId("permission-alert-message")).not.toBeInTheDocument());
    });
});

describe("List Templates when there are NO templates to list", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
        jest.mock('../../../services/templateBuilderDatasourceService', () => mockSearchForTemplates(mockNoTemplateResults));
    });

    it("does not render the table of results", async () => {
        const {queryByTestId} = renderListTemplatesPage();
        await waitFor(() => {
            expect(queryByTestId("template-results")).not.toBeInTheDocument();
        });
    });

    it("renders the no results message", async () => {
        const {queryAllByText} = renderListTemplatesPage();
        await waitFor(() => {
            expect(queryAllByText(`There are no records to match your search`)).toHaveLength(1);
        });
    });
});

describe("List Templates when there are templates to list", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });

    it("does not render a permission status warning", async () => {
        const {queryByTestId} = renderListTemplatesPage();
        await waitFor(() => expect(queryByTestId("permission-alert-message")).not.toBeInTheDocument());
    });

    it("fetches template data using searchForTemplates", async () => {
        const {searchForTemplates} = require('../../../services/templateBuilderDatasourceService');
        renderListTemplatesPage();
        await waitFor(() => expect(searchForTemplates).toBeCalled());
    });

    it("renders the template results", async () => {
        const {getByTestId} = renderListTemplatesPage();
        await waitFor(() => {
            expect(getByTestId(`template-${mockTemplateResults.results[0].id}`)).toBeInTheDocument();
            expect(getByTestId(`template-${mockTemplateResults.results[1].id}`)).toBeInTheDocument();
        });
    });
});


