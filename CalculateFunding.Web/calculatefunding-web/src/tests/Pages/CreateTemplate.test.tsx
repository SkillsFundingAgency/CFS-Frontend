import React from 'react';
import {CreateTemplate} from "../../pages/Templates/CreateTemplate";
import {mount} from "enzyme";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import * as redux from "react-redux";
import {MemoryRouter} from "react-router";
/*import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;*/
const useSelectorSpy = jest.spyOn(redux, 'useSelector');

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


describe("Create Template page when I have no create permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(noPermissionsState);
    });

    it("renders a permission status warning", () => {
        const wrapper = mount(<MemoryRouter><CreateTemplate /></MemoryRouter>);
        expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(1);
    });
});

describe("Create Template page when I have create permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });

    it("does not render a permission status warning", () => {
        const wrapper = mount(<MemoryRouter><CreateTemplate /></MemoryRouter>);
        expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(0);
    });
});

describe("Create Template page when no funding streams exist", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });

    it("does not render a permission status warning", () => {
        const wrapper = mount(<MemoryRouter><CreateTemplate /></MemoryRouter>);
        expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(0);
    });
});

describe("Create Template page when a funding stream exists but I don't have permissions for it", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });

    it("does render funding streams drop down list", () => {
        const wrapper = mount(<MemoryRouter><CreateTemplate /></MemoryRouter>);
        expect(wrapper.find("#fundingStreamId")).toHaveLength(1);
    });

    it("does not render any funding streams in drop down list", () => {
        const wrapper = mount(<MemoryRouter><CreateTemplate /></MemoryRouter>);

        let actual = wrapper.find("#fundingStreamId");

        expect(actual.find('option').length).toBe(0);
    });
});

describe("Create Template page when a funding stream exists for which I have permissions", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
        /*mockedAxios.get.mockRejectedValue('Network error: Something went wrong');
        mockedAxios.get.mockResolvedValue({ data: {
                fundingStream: {id: "XXX", name: "XXXXXX"},
                fundingPeriods: [{id: "2021", name: "2020-2021"}]}
        });*/
    });

    it("does render funding streams drop down list", () => {
        const wrapper = mount(<MemoryRouter><CreateTemplate /></MemoryRouter>);
        expect(wrapper.find("#fundingStreamId")).toHaveLength(1);
    });
});