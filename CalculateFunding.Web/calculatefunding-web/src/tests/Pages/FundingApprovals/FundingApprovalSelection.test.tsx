import React from 'react';
import {FundingApprovalSelection} from "../../../pages/FundingApprovals/FundingApprovalSelection";
import {render, screen, act, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {FundingStreamWithSpecificationSelectedForFunding} from "../../../types/SpecificationSelectedForFunding";
import * as hook from '../../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding';
import {MemoryRouter} from 'react-router';
import '@testing-library/jest-dom/extend-expect';
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {FundingConfiguration} from "../../../types/FundingConfiguration";

const fundingStream: FundingStream = {
    name: "WIZZ1",
    id: "Wizard Training Scheme"
};
const fundingStream2: FundingStream = {
    name: "DRK1",
    id: "Dark Arts Programme"
};
const fundingPeriod: FundingPeriod = {
    id: "FP123",
    name: "2019-20"
};
const fundingPeriod2: FundingPeriod = {
    id: "FP124",
    name: "2020-21"
};
const mockFundingConfigData: FundingConfiguration[] = [
    
]
const mockSelectionData: FundingStreamWithSpecificationSelectedForFunding[] = [
    {
        id: fundingStream.id,
        name: "Wizard Funding Stream",
        periods: [
            {id: fundingPeriod.id, name: fundingPeriod.name, specifications: [{id: "ABC123", name: "Wizard Training"}]}
        ]
    },
    {
        id: "DRK",
        name: fundingStream2.name,
        periods: [
            {id: fundingPeriod2.id, name: fundingPeriod2.name, specifications: [{id: "ABC123", name: "Dark Arts"}]}
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
            .mockImplementation(() => ({fundingStreams: mockSelectionData, isLoadingOptions: false, isErrorCheckingForOptions: false, errorCheckingForOptions: ""}));
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

        act(() => userEvent.selectOptions(fundingStreamSelect, mockSelectionData[1].id));

        const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
        expect(fundingPeriodSelect).toBeInTheDocument();
        expect(fundingPeriodSelect.childNodes).toHaveLength(2);
    });

    it('renders specification when funding period selected with Approval mode ALL', async () => {
        const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
        act(() => userEvent.selectOptions(fundingStreamSelect, mockSelectionData[1].id));

        const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
        act(() => userEvent.selectOptions(fundingPeriodSelect, mockSelectionData[1].periods[0].id));

        waitFor(() => {
            expect(screen.getByText(/Dark Arts/)).toBeInTheDocument();
            expect(screen.getByRole("button", {name: /Continue/})).toBeInTheDocument();
            expect(screen.getByRole("button", {name: /Continue/})).toBeEnabled();
        });
    });

    it('renders specification when funding period selected with Approval mode Batches', async () => {
        const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
        act(() => userEvent.selectOptions(fundingStreamSelect, mockSelectionData[1].id));

        const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
        act(() => userEvent.selectOptions(fundingPeriodSelect, mockSelectionData[1].periods[0].id));

        waitFor(() => {
            expect(screen.getByText(/Dark Arts/)).toBeInTheDocument();
            expect(screen.getByRole("button", {name: /Continue/})).toBeInTheDocument();
            expect(screen.getByRole("button", {name: /Continue/})).toBeDisabled();
        });
    });
});
