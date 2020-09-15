import React from 'react';
import {FundingApprovalSelection} from "../../../pages/FundingApprovals/FundingApprovalSelection";
import {MemoryRouter} from "react-router";
import {render, waitFor, fireEvent, act, cleanup} from "@testing-library/react";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {getFundingPeriodsByFundingStreamIdService, getFundingStreamsForSelectedSpecifications, getSpecificationsSelectedForFundingByPeriod} from "../../../services/specificationService";
import {SpecificationSummary} from "../../../types/SpecificationSummary";


const mockStreams: FundingStream[] = [{id: "test1", name: "Wizard Training Funding Stream"}];
const mockPeriods: FundingPeriod[] = [{id: "FY20-21", name: "Period 2020-2021"}];
const mockSpecs: SpecificationSummary[] = [{
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: mockPeriods[0],
    fundingStreams: mockStreams,
    id: "ABC123",
    isSelectedForFunding: false,
    providerVersionId: ""
}];
const renderPage = () => {
    const {FundingApprovalSelection} = require('../../../pages/FundingApprovals/FundingApprovalSelection');
    return render(<MemoryRouter><FundingApprovalSelection/></MemoryRouter>);
};
function mockFunctions(mockStreams: FundingStream[], mockPeriods: FundingPeriod[], mockSpecifications: SpecificationSummary[]) {
    const service = jest.requireActual('../../../services/specificationService');
    return {
        ...service,
        getFundingStreamsForSelectedSpecifications: jest.fn(() => Promise.resolve({
            data: mockStreams
        })),
        getFundingPeriodsByFundingStreamIdService: jest.fn(() => Promise.resolve({
            data: mockPeriods
        })),
        getSpecificationsSelectedForFundingByPeriod: jest.fn(() => Promise.resolve({
            data: mockSpecifications
        }))
    }
}


describe("Renders <FundingApprovalSelection /> correctly", () => {
    beforeEach(() => {
        jest.mock('../../../services/specificationService', () => mockFunctions(mockStreams, mockPeriods, mockSpecs));
    });
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });
    
    it("fetches funding streams", async () => {
        const {getFundingStreamsForSelectedSpecifications} = require('../../../services/specificationService');
        await renderPage();
        await waitFor(() => expect(getFundingStreamsForSelectedSpecifications).toBeCalled());
    });
    
    it('renders Funding streams', async () => {
        const {getFundingStreamsForSelectedSpecifications} = require('../../../services/specificationService');
        const {queryByTestId} = renderPage();
        
        await waitFor(() => expect(getFundingStreamsForSelectedSpecifications).toBeCalled());
        
        expect(queryByTestId(`funding-stream-dropdown`)).toBeTruthy();
        expect(queryByTestId(`funding-stream-dropdown`)?.childNodes).toHaveLength(2);
    });

    it('fetches Funding periods when funding stream selected', async () => {
        const {getFundingStreamsForSelectedSpecifications} = require('../../../services/specificationService');
        const {getFundingPeriodsByFundingStreamIdService} = require('../../../services/specificationService');
        const {getByTestId} = renderPage();
        
        await waitFor(() => expect(getFundingStreamsForSelectedSpecifications).toBeCalled());

        act(() => {fireEvent.change(getByTestId('funding-stream-dropdown'), { target: { value: mockStreams[0].id } })});

        await waitFor(() => expect(getFundingPeriodsByFundingStreamIdService).toBeCalled());
    });
    
    it('fetches specification when funding period selected', async () => {
        const {getFundingStreamsForSelectedSpecifications} = require('../../../services/specificationService');
        const {getFundingPeriodsByFundingStreamIdService} = require('../../../services/specificationService');
        const {getSpecificationsSelectedForFundingByPeriod} = require('../../../services/specificationService');
        const {getByTestId, queryByTestId} = renderPage();
        
        await waitFor(() => expect(getFundingStreamsForSelectedSpecifications).toBeCalled());

        act(() => {fireEvent.change(getByTestId('funding-stream-dropdown'), { target: { value: mockStreams[0].id } })});

        await waitFor(() => expect(getFundingPeriodsByFundingStreamIdService).toBeCalled());

        act(() => {fireEvent.change(getByTestId('funding-period-dropdown'), { target: { value: mockPeriods[0].id } })});

        await waitFor(() => expect(getSpecificationsSelectedForFundingByPeriod).toBeCalled());
        
        expect(queryByTestId(`view-funding-link`)).toBeTruthy();
    });
});
