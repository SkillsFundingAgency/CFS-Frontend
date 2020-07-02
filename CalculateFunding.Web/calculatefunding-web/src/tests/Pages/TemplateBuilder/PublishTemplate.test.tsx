﻿import React from 'react';
import {mount} from "enzyme";
import * as redux from "react-redux";
import {MemoryRouter} from "react-router";
import {FundingStreamPermissions} from "../../../types/FundingStreamPermissions";
const useSelectorSpy = jest.spyOn(redux, 'useSelector');
import { waitFor } from "@testing-library/react"

export const noPermissionsState: FundingStreamPermissions[] = [{
    fundingStreamId: "DSG",
    userId: "",
    canAdministerFundingStream: true,
    canApproveFunding: true,
    canApproveSpecification: true,
    canChooseFunding: true,
    canCreateQaTests: true,
    canCreateSpecification: true,
    canDeleteCalculations: true,
    canDeleteQaTests: true,
    canDeleteSpecification: true,
    canEditCalculations: true,
    canEditQaTests: true,
    canEditSpecification: true,
    canMapDatasets: true,
    canRefreshFunding: true,
    canReleaseFunding: true,
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
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
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canApproveTemplates: true
}];

export const setupGetTemplate = function () {
    jest.mock('../../../services/templateBuilderDatasourceService', () => ({
        getTemplateById: jest.fn(() => Promise.resolve({
            data: {
                templateId: "12352346",
                name: "template name",
                description: "lorem ipsum",
                fundingStreamId: "DSG",
                fundingPeriodId: "2021",
                majorVersion: 0,
                minorVersion: 1,
                version: 2,
                status: "Draft",
                schemaVersion: "1.1",
                templateJson: "",
                authorId: "",
                authorName: "",
                lastModificationDate: new Date(),
                publishStatus: "",
                comments: ""
            }
        }))
    }));
}
describe("Publish Template page when I don't have approve permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(noPermissionsState);
        setupGetTemplate();
    });
    it("renders a permission status warning", async () => {
        const { PublishTemplate } = require("../../../pages/Templates/PublishTemplate");
        const wrapper = mount(<MemoryRouter><PublishTemplate /></MemoryRouter>);
        await waitFor(() => expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(1));
    });
});
describe("Publish Template page when I have approve permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
        setupGetTemplate();
    });
    it("does not render a permission status warning", async () => {
        const { PublishTemplate } = require("../../../pages/Templates/PublishTemplate");
        const wrapper = mount(<MemoryRouter><PublishTemplate /></MemoryRouter>);
        await waitFor(() => expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(0));
    });
});