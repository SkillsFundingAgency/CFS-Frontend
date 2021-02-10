import React from 'react';
import {act, render, screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as redux from "react-redux";
import {FundingApprovalTestData} from "./FundingApprovalTestData";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
    afterEach(() => jest.clearAllMocks());

    describe("when results with no errors", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
            test.hasSpecification();
            test.hasNoActiveJobsRunning();
            test.hasFundingConfigurationWithApproveAll();
            test.hasFullSpecPermissions();
            test.hasProvidersWithErrors([]);
            test.hasSearchResults([test.provider1]);

            test.renderPage();
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('renders provider results section', async () => {
            expect(screen.getByTestId("published-provider-results")).toBeInTheDocument();
        });

        it('renders refresh button as enabled', async () => {
            const button = screen.getByRole("button", {name: /Refresh funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it('renders approve button as enabled', async () => {
            const button = screen.getByRole("button", {name: /Approve funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it('renders release button as enabled', async () => {
            const button = screen.getByRole("button", {name: /Release funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it('renders provider name', async () => {
            expect(await screen.findByText(test.provider1.providerName)).toBeInTheDocument();
        });

        it('renders provider status', async () => {
            expect(await screen.findByText(test.provider1.fundingStatus)).toBeInTheDocument();
        });
    });
});

