import React from 'react';
import {act, render, screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as redux from "react-redux";
import {FundingApprovalTestData} from "./FundingApprovalTestData";
import {ValidationErrors} from "../../../types/ErrorMessage";
import {createMockAxiosError} from "../../fakes/fakeAxios";
import * as publishService from "../../../services/publishService";
import userEvent from "@testing-library/user-event";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
    afterEach(() => jest.clearAllMocks());

    describe("when user confirms refresh", () => {

        describe("and there is a validation error", () => {
            const mockValidationErrors: ValidationErrors = {
                "error-message": ["stack overflow", "divide by zero"],
                "": ["hello error"]
            }
            const mockValidationError = jest.fn().mockRejectedValue(createMockAxiosError(mockValidationErrors, 400));

            beforeEach(async () => {
                useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
                test.hasSpecification();
                test.hasNoActiveJobsRunning();
                test.hasFundingConfigurationWithApproveAll();
                test.hasFullPermissions();
                test.hasProvidersWithErrors([]);
                test.hasSearchResults([test.provider1]);
                jest.spyOn(publishService, 'preValidateForRefreshFundingService')
                    .mockImplementation(mockValidationError);

                test.renderPage();
            });
            afterEach(() => {
                jest.clearAllMocks();
            });

            it('renders error summary', async () => {
                const button = screen.getByRole("button", {name: /Refresh funding/});

                act(() => {
                    userEvent.click(button);
                });

                await waitFor(() => expect(mockValidationError).toHaveBeenCalledWith(test.testSpec.id));

                const errorSummary = await screen.findByTestId("error-summary");
                expect(errorSummary).toBeInTheDocument();
                expect(within(errorSummary).getByText("There is a problem")).toBeInTheDocument();
                expect(within(errorSummary).getByText(/stack overflow/)).toBeInTheDocument();
                expect(within(errorSummary).getByText(/divide by zero/)).toBeInTheDocument();
                expect(within(errorSummary).getByText(/hello error/)).toBeInTheDocument();

                expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
            });
        });

        describe("and there are no validation errors", () => {
            const mockNoValidationError = jest.fn().mockResolvedValueOnce({
                status: 200,
                data: []
            });
            const mockJobCreated = jest.fn().mockResolvedValueOnce({
                jobId: "12345"
            });

            beforeEach(() => {
                useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
                test.hasSpecification();
                test.hasNoActiveJobsRunning();
                test.hasFundingConfigurationWithApproveAll();
                test.hasFullPermissions();
                test.hasProvidersWithErrors([]);
                test.hasSearchResults([test.provider1]);
                test.hasSearchResultsWithProviderIds([test.provider1], [test.provider1.publishedProviderVersionId]);
                jest.spyOn(publishService, 'preValidateForRefreshFundingService')
                    .mockImplementation(mockNoValidationError);
                jest.spyOn(publishService, 'refreshSpecificationFundingService')
                    .mockImplementation(mockJobCreated);

                test.renderPage();
            });
            afterEach(() => {
                jest.clearAllMocks();
            });

            it('renders refresh button as enabled', async () => {
                const button = screen.getByRole("button", {name: /Refresh funding/});
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();
            });

            it('renders modal confirmation', async () => {
                const refreshButton = screen.getByRole("button", {name: /Refresh funding/});

                act(() => userEvent.click(refreshButton));

                await waitFor(() => expect(mockNoValidationError).toHaveBeenCalledWith(test.testSpec.id));

                expect(await screen.findByTestId("modal-confirmation-placeholder")).toBeInTheDocument();
                expect(screen.getByRole("heading", {name: /Confirm funding refresh/})).toBeInTheDocument();
                expect(screen.getByRole("button", {name: /Cancel/})).toBeInTheDocument();
                const confirmButton = screen.getByRole("button", {name: /Confirm/});
                expect(confirmButton).toBeInTheDocument();

                act(() => userEvent.click(confirmButton));

                await waitFor(() => expect(mockJobCreated).toHaveBeenCalledWith(test.testSpec.id));
            });
        });
    });
});

