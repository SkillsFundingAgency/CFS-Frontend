import React from 'react';
import {act, screen, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as redux from "react-redux";
import {FundingApprovalTestData} from "./FundingApprovalTestData";
import userEvent from "@testing-library/user-event";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
    afterEach(() => jest.clearAllMocks());


    describe("when results with errors in Approve All mode", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
            test.hasSpecification();
            test.hasNoActiveJobsRunning();
            test.hasFundingConfigurationWithApproveAll();
            test.hasFullSpecPermissions();
            test.hasProvidersWithErrors(["Error: missing something"]);
            test.hasProviderIds([test.providerWithError1.publishedProviderVersionId]);
            test.hasSearchResults([test.providerWithError1]);

            test.renderPage();
        });

        it('renders error summary', async () => {
            expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
            expect(await screen.findByText("There is a problem")).toBeInTheDocument();
        });

        it('renders error message', async () => {
            const alerts = await screen.findAllByRole("alert");
            alerts.some(alert => within(alert).getByText(/Error: missing something/));
        });
        
        it('renders approve button as enabled', async () => {
            const button = screen.getByRole("button", {name: /Approve funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });
        
        it('renders release button as enabled', async () => {
            const button = screen.getByRole("button", {name: /Release/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });
    });
    
    describe("when results with errors in Approve Batches mode", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
            test.hasSpecification();
            test.hasNoActiveJobsRunning();
            test.hasLastRefreshJob();
            test.hasFundingConfigurationWithBatchApproval();
            test.hasFullSpecPermissions();
            test.hasProvidersWithErrors(["Error: missing something"]);
            test.hasSearchResultsWithProviderIds([test.provider1], [test.provider1.publishedProviderVersionId]);

            test.renderPage();
        });

        it('renders error summary', async () => {
            expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
            expect(await screen.findByText("There is a problem")).toBeInTheDocument();
        });

        it('renders error message', async () => {
            const alerts = await screen.findAllByRole("alert");
            alerts.some(alert => within(alert).getByText(/Error: missing something/));
        });

        it('does not block user from approving with an error message', async () => {
            const button = screen.getByRole("button", {name: /Approve/});
            
            expect(button).toBeEnabled();

            act(() => userEvent.click(button));

            expect(screen.queryByText(/Funding cannot be approved as there are providers in error/)).not.toBeInTheDocument();
        });

        it('does not block user from releasing with an error message', async () => {
            const button = screen.getByRole("button", {name: /Release/});
            
            expect(button).toBeEnabled();

            act(() => userEvent.click(button));
            
            expect(screen.queryByText(/Funding cannot be released as there are providers in error/)).not.toBeInTheDocument();
        });
    });
});

