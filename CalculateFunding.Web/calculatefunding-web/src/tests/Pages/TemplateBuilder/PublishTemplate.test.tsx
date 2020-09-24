﻿import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import * as redux from "react-redux";
import {MemoryRouter} from "react-router";
import {FundingStreamPermissions} from "../../../types/FundingStreamPermissions";
import {render, waitFor, screen} from "@testing-library/react";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

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
    canApproveTemplates: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canDeleteProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false
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
    canApproveTemplates: true,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canDeleteProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false
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
                templateJson: undefined,
                authorId: "",
                authorName: "",
                lastModificationDate: new Date(),
                publishStatus: "",
                comments: ""
            }
        })),
        getAllCalculations: jest.fn()
    }));
};

const renderPage = () => {
    const {PublishTemplate} = require("../../../pages/Templates/PublishTemplate");
    return render(
        <MemoryRouter>
            <PublishTemplate />
        </MemoryRouter>);
};

describe("Publish Template page", () => {
    describe("when I don't have approve permissions ", () => {
        beforeEach(() => {
            useSelectorSpy.mockClear();
            useSelectorSpy.mockReturnValue(noPermissionsState);
            setupGetTemplate();
        });
        it("does not render a permission status warning at first", async () => {
            renderPage();
            await waitFor(() => expect(screen.queryByTestId('permission-alert-message')).toBeFalsy());
        });
        it("fetches template data", async () => {
            const {getTemplateById} = require('../../../services/templateBuilderDatasourceService');
            renderPage();
            await waitFor(() => expect(getTemplateById).toBeCalled());
        });
        it("renders a permission status warning after loading data", async () => {
            const {getTemplateById} = require('../../../services/templateBuilderDatasourceService');
            renderPage();
            await waitFor(() => expect(getTemplateById).toBeCalled());
            await waitFor(() => expect(screen.getByTestId('permission-alert-message')).toBeInTheDocument());
        });
    });
    describe("when I have approve permissions ", () => {
        beforeEach(() => {
            useSelectorSpy.mockClear();
            useSelectorSpy.mockReturnValue(permissionsState);
            setupGetTemplate();
        });
        it("fetches template data", async () => {
            const {getTemplateById} = require('../../../services/templateBuilderDatasourceService');
            renderPage();
            await waitFor(() => expect(getTemplateById).toBeCalled());
        });
        it("does not render a permission status warning after loading data", async () => {
            const {getTemplateById} = require('../../../services/templateBuilderDatasourceService');
            renderPage();
            await waitFor(() => expect(getTemplateById).toBeCalled());
            await waitFor(() => expect(screen.queryByTestId('permission-alert-message')).not.toBeInTheDocument());
        });
    });
});