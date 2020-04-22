import React from "react";
import { TemplateBuilder } from "../../pages/TemplateBuilder";
import { mount } from "enzyme";

it("renders in view mode", () => {
    const wrapper = mount(<TemplateBuilder />);
    expect(wrapper.find("[data-testid='add']")).toHaveLength(0);
});

it("shows add funding line button when edit mode selected", () => {
    const wrapper = mount(<TemplateBuilder />);
    wrapper.find("[data-testid='edit']").simulate('change');
    expect(wrapper.find("[data-testid='add']")).toHaveLength(1);
});

it("adds new funding line to page when button clicked", () => {
    const wrapper = mount(<TemplateBuilder />);
    expect(wrapper.find('OrganisationChartNode')).toHaveLength(0);
    wrapper.find("[data-testid='edit']").simulate('change');
    wrapper.find("[data-testid='add']").simulate('click');
    expect(wrapper.find('OrganisationChartNode')).toHaveLength(1);
});

it("funding line displays add buttons in edit mode", () => {
    const wrapper = mount(<TemplateBuilder />);
    wrapper.find("[data-testid='edit']").simulate('change');
    wrapper.find("[data-testid='add']").simulate('click');
    expect(wrapper.find('TemplateBuilderNode').find("[data-testid='n0-add-line']")).toHaveLength(1);
    expect(wrapper.find('TemplateBuilderNode').find("[data-testid='n0-add-calc']")).toHaveLength(1);
});

it("funding line hides add buttons in view mode", () => {
    const wrapper = mount(<TemplateBuilder />);
    wrapper.find("[data-testid='edit']").simulate('change');
    wrapper.find("[data-testid='add']").simulate('click');
    wrapper.find("[data-testid='view']").simulate('change');
    expect(wrapper.find('TemplateBuilderNode').find("[data-testid='n0-add-line']")).toHaveLength(0);
    expect(wrapper.find('TemplateBuilderNode').find("[data-testid='n0-add-calc']")).toHaveLength(0);
});

it("displays edit window when clicking on funding line", () => {
    const wrapper = mount(<TemplateBuilder />);
    wrapper.find("[data-testid='edit']").simulate('change');
    wrapper.find("[data-testid='add']").simulate('click');
    expect(wrapper.find('Sidebar').prop('open')).toBe(false);
    wrapper.find('TemplateBuilderNode').find("[data-testid='node-n0']").simulate('click');
    expect(wrapper.find('Sidebar').prop('open')).toBe(true);
});

it("displays confirmation when deleting a funding line", () => {
    const wrapper = mount(<TemplateBuilder />);
    wrapper.find("[data-testid='edit']").simulate('change');
    wrapper.find("[data-testid='add']").simulate('click');
    wrapper.find('TemplateBuilderNode').find("[data-testid='node-n0']").simulate('click');
    expect(wrapper.find('FundingLineItem').find("[data-testid='node-n0-confirm-delete']")).toHaveLength(0);
    wrapper.find('FundingLineItem').find("[data-testid='node-n0-delete']").simulate('click');
    expect(wrapper.find('FundingLineItem').find("[data-testid='node-n0-confirm-delete']")).toHaveLength(1);
});