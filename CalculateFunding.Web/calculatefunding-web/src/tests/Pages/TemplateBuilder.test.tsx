import React from "react";
import {TemplateBuilder} from "../../pages/TemplateBuilder";
import {mount} from "enzyme";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import * as redux from "react-redux";
import {MemoryRouter} from "react-router";

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

describe("Template Builder when I have no permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(noPermissionsState);
    });

    it("renders a permission status warning", () => {
        const wrapper = mount(<MemoryRouter><TemplateBuilder /></MemoryRouter>);
        expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(1);
    });
});

describe("Template Builder when I have edit permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
    });
    
    it("does not render a permission status warning", () => {
        const wrapper = mount(<MemoryRouter><TemplateBuilder /></MemoryRouter>);
        expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(0);
    });
    
    it("shows add funding line button when edit mode selected", () => {
        const wrapper = mount(<MemoryRouter><TemplateBuilder /></MemoryRouter>);
        wrapper.find("[data-testid='edit']").simulate('change');
        expect(wrapper.find("[data-testid='add']")).toHaveLength(1);
    });

    it("adds new funding line to page when button clicked", () => {
        const wrapper = mount(<MemoryRouter><TemplateBuilder /></MemoryRouter>);
        expect(wrapper.find('OrganisationChartNode')).toHaveLength(0);
        wrapper.find("[data-testid='edit']").simulate('change');
        wrapper.find("[data-testid='add']").simulate('click');
        expect(wrapper.find('OrganisationChartNode')).toHaveLength(1);
    });

    it("funding line displays add buttons in edit mode", () => {
        const wrapper = mount(<MemoryRouter><TemplateBuilder /></MemoryRouter>);
        wrapper.find("[data-testid='edit']").simulate('change');
        wrapper.find("[data-testid='add']").simulate('click');
        expect(wrapper.find('TemplateBuilderNode').find("[data-testid='n0-add-line']")).toHaveLength(1);
        expect(wrapper.find('TemplateBuilderNode').find("[data-testid='n0-add-calc']")).toHaveLength(1);
    });

    it("funding line hides add buttons in view mode", () => {
        const wrapper = mount(<MemoryRouter><TemplateBuilder /></MemoryRouter>);
        wrapper.find("[data-testid='edit']").simulate('change');
        wrapper.find("[data-testid='add']").simulate('click');
        wrapper.find("[data-testid='view']").simulate('change');
        expect(wrapper.find('TemplateBuilderNode').find("[data-testid='n0-add-line']")).toHaveLength(0);
        expect(wrapper.find('TemplateBuilderNode').find("[data-testid='n0-add-calc']")).toHaveLength(0);
    });

    it("displays edit window when clicking on funding line", () => {
        const wrapper = mount(<MemoryRouter><TemplateBuilder /></MemoryRouter>);
        wrapper.find("[data-testid='edit']").simulate('change');
        wrapper.find("[data-testid='add']").simulate('click');
        expect(wrapper.find('Sidebar').prop('open')).toBe(false);
        wrapper.find('TemplateBuilderNode').find("[data-testid='node-n0']").simulate('click');
        expect(wrapper.find('Sidebar').prop('open')).toBe(true);
    });

    it("displays confirmation when deleting a funding line", () => {
        let wrapper = mount(<MemoryRouter><TemplateBuilder /></MemoryRouter>);
        wrapper.find("[data-testid='edit']").simulate('change');
        wrapper.find("[data-testid='add']").simulate('click');
        wrapper.find('TemplateBuilderNode').find("[data-testid='node-n0']").simulate('click');
        expect(wrapper.find('FundingLineItem').find("[data-testid='node-n0-confirm-delete']")).toHaveLength(0);
        wrapper.find('FundingLineItem').find("[data-testid='node-n0-delete']").simulate('click');
        expect(wrapper.find('FundingLineItem').find("[data-testid='node-n0-confirm-delete']")).toHaveLength(1);
    });
});