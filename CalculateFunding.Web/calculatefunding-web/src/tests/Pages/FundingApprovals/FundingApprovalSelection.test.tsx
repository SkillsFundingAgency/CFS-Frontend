import React from 'react';
import {FundingApprovalSelection} from "../../../pages/FundingApprovals/FundingApprovalSelection";
import {render, screen, act} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {FundingStreamWithSpecificationSelectedForFunding} from "../../../types/SpecificationSelectedForFunding";
import * as hook from '../../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding';
import {MemoryRouter} from 'react-router';
import '@testing-library/jest-dom/extend-expect';

const mockData: FundingStreamWithSpecificationSelectedForFunding[] = [
    {
        id: "WIZZ",
        name: "Wizard Funding Stream",
        periods: [
            {id: "FY20-21", name: "Period 2020-2021", specifications: [{id: "ABC123", name: "Wizard Training"}]}
        ]
    },
    {
        id: "DRK",
        name: "Dark Arts Stream",
        periods: [
            {id: "FY21-22", name: "Period 2021-2022", specifications: [{id: "ABC123", name: "Dark Arts"}]}
        ]
    }
];
const renderPage = () => {
    const {FundingApprovalSelection} = require('../../../pages/FundingApprovals/FundingApprovalSelection');
    return render(<MemoryRouter><FundingApprovalSelection/></MemoryRouter>);
};


describe("Renders <FundingApprovalSelection /> correctly", () => {
    beforeEach(() => {
        jest.spyOn(hook, 'useOptionsForSpecificationsSelectedForFunding')
            .mockImplementation(() => ({fundingStreams: mockData, isLoadingOptions: false, isErrorCheckingForOptions: false, errorCheckingForOptions: ""}));
        renderPage();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders Specification label", async () => {
        expect(screen.getAllByText('Select specification')).toHaveLength(2);
    });

    it('renders Funding streams', async () => {
        const dropdown = await screen.findByTestId(`funding-stream-dropdown`);
        expect(dropdown).toBeInTheDocument();
        expect(dropdown.childNodes).toHaveLength(3);
    });

    it('renders Funding periods when funding stream selected', async () => {
        const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);

        act(() => userEvent.selectOptions(fundingStreamSelect, mockData[1].id));

        const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
        expect(fundingPeriodSelect).toBeInTheDocument();
        expect(fundingPeriodSelect.childNodes).toHaveLength(2);
    });

    it('renders specification when funding period selected', async () => {
        const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
        act(() => userEvent.selectOptions(fundingStreamSelect, mockData[1].id));

        const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
        act(() => userEvent.selectOptions(fundingPeriodSelect, mockData[1].periods[0].id));

        expect(screen.queryByTestId(`view-funding-link`)).toBeInTheDocument();
    });
});
