import React from 'react';
import {act, render, screen, waitFor, within} from "@testing-library/react";
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
            test.hasFullPermissions();
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

        it('blocks user from approving with an error message', async () => {
            const button = screen.getByRole("button", {name: /Approve/});

            act(() => userEvent.click(button));
            
            const alerts = await screen.findAllByRole("alert");
            alerts.some(alert => within(alert).getByText(/Funding cannot be approved as there are providers in error/));
        });

        it('blocks user from releasing with an error message', async () => {
            const button = screen.getByRole("button", {name: /Release/});

            act(() => userEvent.click(button));
            
            const alerts = await screen.findAllByRole("alert");
            alerts.some(alert => within(alert).getByText(/Funding cannot be released as there are providers in error/));
        });
    });
    
    describe("when results with errors in Approve Batches mode", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
            test.hasSpecification();
            test.hasNoActiveJobsRunning();
            test.hasFundingConfigurationWithBatchApproval();
            test.hasFullPermissions();
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

        it('does not block user from approving with an error message', async () => {
            const button = screen.getByRole("button", {name: /Approve/});

            act(() => userEvent.click(button));

            expect(screen.queryByText(/Funding cannot be approved as there are providers in error/)).not.toBeInTheDocument();
        });

        it('does not block user from releasing with an error message', async () => {
            const button = screen.getByRole("button", {name: /Release/});

            act(() => userEvent.click(button));
            
            expect(screen.queryByText(/Funding cannot be released as there are providers in error/)).not.toBeInTheDocument();
        });
    });
});

