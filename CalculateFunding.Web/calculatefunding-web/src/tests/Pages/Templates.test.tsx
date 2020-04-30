import React from "react";
import {Templates} from "../../pages/Templates";
import { mount } from "enzyme";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import * as redux from "react-redux";

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
        const wrapper = mount(<Templates />);
        expect(wrapper.find("[href='/app/templatebuilder']")).toHaveLength(0);
    });

    it("renders a permission status warning", () => {
        const wrapper = mount(<Templates />);
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
        const wrapper = mount(<Templates />);
        expect(wrapper.find("[href='/app/templatebuilder']")).toHaveLength(1);
        expect(wrapper.find('p.govuk-body').text()).toBe("Start building a new template");
    });

    it("does not render a permission status warning", () => {
        const wrapper = mount(<Templates />);
        expect(wrapper.find("[data-testid='permission-alert-message']")).toHaveLength(0);
    });
});
