import React from 'react';
import {act, render, screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as redux from "react-redux";
import {FundingApprovalTestData} from "./FundingApprovalTestData";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
    afterEach(() => jest.clearAllMocks());

    describe("when job is active", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
            test.hasActiveJobRunning();
            test.hasSpecification();
            test.hasFundingConfigurationWithApproveAll();
            test.hasFullPermissions();
            test.hasProvidersWithErrors([]);
            test.hasProviderIds([test.provider1.publishedProviderVersionId]);
            test.hasSearchResults([test.provider1]);

            test.renderPage();
        });

        it('renders Specification details', async () => {
            expect(screen.getByTestId("specName")).toBeInTheDocument();
        });

        it('renders job progress spinner', async () => {
            expect(screen.getByTestId("loader")).toBeInTheDocument();
            expect(await screen.findByText(`Job ${test.activeJob?.latestJob?.statusDescription}: ${test.activeJob?.latestJob?.jobDescription}`)).toBeInTheDocument();
        });

        it('does not render filters', async () => {
            expect(screen.queryByRole("radio", {name: "Provider name"})).not.toBeInTheDocument();
        });

        it('does not render results', async () => {
            expect(screen.queryByTestId("published-provider-results")).not.toBeInTheDocument();
        });

        it('renders refresh button as disabled', async () => {
            const button = screen.queryByRole("button", {name: /Refresh funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it('renders approve button as disabled', async () => {
            const button = screen.queryByRole("button", {name: /Approve/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it('renders release button as disabled', async () => {
            const button = screen.queryByRole("button", {name: /Release/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });
    });
});

