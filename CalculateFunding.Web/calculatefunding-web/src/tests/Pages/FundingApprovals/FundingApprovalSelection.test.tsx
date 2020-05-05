import React from 'react';
import {FundingApprovalSelection} from "../../../pages/FundingApprovals/FundingApprovalSelection";
import {mount} from "enzyme";
import {MemoryRouter} from "react-router";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

it('will render the page', () => {
    const wrapper = mount(<MemoryRouter><FundingApprovalSelection /></MemoryRouter>);

    expect(wrapper.find(".govuk-width-container").length).toBe(3);
    expect(wrapper.find('#funding-streams')).toBeTruthy();
    expect(wrapper.find('#funding-periods')).toBeTruthy();
    expect(wrapper.find('.govuk-form-group').length).toBe(3);
});