﻿import React from "react";
import {ListTemplates} from "../../../pages/Templates/ListTemplates";
import { mount } from "enzyme";
import { FundingStreamPermissions } from "../../../types/FundingStreamPermissions";
import * as redux from "react-redux";
import {MemoryRouter} from "react-router";
import {Link} from "react-router-dom";

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

describe("Templates homepage when I don't have permissions to create templates", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(noPermissionsState);
    });

    it("does not render a create template link", () => {
        const wrapper = mount(<MemoryRouter><ListTemplates /></MemoryRouter>);
        expect(wrapper.find("[href='/app/templatebuilder']")).toHaveLength(0);
    });

    it("renders a permission status warning", () => {
        const wrapper = mount(<MemoryRouter><ListTemplates /></MemoryRouter>);
        expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(1);
        expect(wrapper.find("[data-testid='permission-alert-message']").text()).toBe("You do not have permissions to perform the following actions: create");
    });
});

describe("Templates homepage when I have permissions to create templates", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });
    
    it("renders a create template link", () => {
        const wrapper = mount(<MemoryRouter><ListTemplates /></MemoryRouter>);
        expect(wrapper.find("#create-template-link").find(Link).prop('to')).toBe('/Templates/Create');
    });

    it("does not render a permission status warning", () => {
        const wrapper = mount(<MemoryRouter><ListTemplates /></MemoryRouter>);
        expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(0);
    });
});

describe("Templates homepage when there are NO templates to list", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });

    it("does not renders the template listing table", () => {
        const wrapper = mount(<MemoryRouter><ListTemplates /></MemoryRouter>);
        expect(wrapper.find("#templates-table")).toHaveLength(0);
    });
});

describe("Templates homepage when there are templates to list", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });
    
    /* TODO:
    it("renders the template", () => {
        const wrapper = mount(<MemoryRouter><Templates /></MemoryRouter>);
        expect(wrapper.find("#templates-table")).toHaveLength(1);
        expect(wrapper.find("#templates-table").find(Link)).toHaveLength(1);
        expect(wrapper.find("#templates-table").find(Link).prop('to')).toBe('/templatebuilder/' + template.Id);
        expect(wrapper.find("#templates-table").find(Link).text()).toBe(template.Name);
    });*/
});
