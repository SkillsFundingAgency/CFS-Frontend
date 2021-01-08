import React from "react";
import * as redux from "react-redux";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {ViewFundingLineProfileProps} from "../../../pages/FundingApprovals/ViewFundingLineProfile";
import {waitFor, fireEvent, render, screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {QueryClient, QueryClientProvider} from "react-query";

describe("<ViewFundingLineProfile />", () => {
    afterEach(async () => {
        mockHistoryPush.mockClear();
        mockApplyCustomProfile.mockClear();
    });

    afterAll(() => {
        mockGetFundingLinePublishedProviderDetails.mockClear();
        useSelectorSpy.mockClear();
    });

    describe("when user has canApplyCustomProfilePattern permission", () => {
        beforeAll(() => {
            useSelectorSpy.mockReturnValue([{
                fundingStreamId: "fundingStreamId",
                canApplyCustomProfilePattern: true
            }]);
            mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                data: {
                    fundingLineProfile: testFundingLineProfile,
                    enableUserEditableCustomProfiles: true,
                    enableUserEditableRuleBasedProfiles: true
                }
            });
        });

        it("does not show a permissions message", async () => {
            const {container} = await renderPage();
            await waitFor(() => {
                expect(container.querySelector("#permission-alert-message")).not.toBeInTheDocument();
            });
        });

        it("edit profile button is enabled", async () => {
            await renderPage();
            await waitFor(() => {
                expect(screen.getByTestId("edit-profile-btn")).not.toBeDisabled();
            });
        });

        it("fields intially load in read (not edit) view", async () => {
            await renderPage();
            await waitFor(() => {
                expect(screen.queryAllByRole("input")).toHaveLength(0);
            });
        });

        it("shows the correct funding line profile values", async () => {
            await renderPage();
            await waitFor(() => {
                expect(screen.getByTestId('funding-line-name')).toHaveTextContent("name")
                expect(screen.getByTestId("provider-name")).toHaveTextContent("provider");
                expect(screen.getByTestId("ukprn")).toHaveTextContent("UKPRN: 12345");
                expect(screen.getByTestId("last-updated-by")).toHaveTextContent("Last updated by test user on 10 September 1907 0:00 am");
                expect(screen.getByTestId("total-allocation")).toHaveTextContent("£100.00");
                expect(screen.getByTestId("amount-already-paid")).toHaveTextContent("£50.00");
                expect(screen.getByTestId("remaining-amount")).toHaveTextContent("£50.00");
                expect(screen.getByTestId("balance-carried-forward")).toHaveTextContent("£0.00");
                expect(screen.getAllByTestId("profile-total")).toHaveLength(2);
                expect(screen.getByTestId("paid-0")).toHaveTextContent("Paid");
                expect(screen.getByTestId("paid-1")).toHaveTextContent("");
                expect(screen.getByTestId("instalment-number-0")).toHaveTextContent("1");
                expect(screen.getByTestId("instalment-number-1")).toHaveTextContent("2");
                expect(screen.getByTestId("remaining-percentage-0")).toHaveTextContent("");
                expect(screen.getByTestId("remaining-percentage-1")).toHaveTextContent("100.00%");
                expect(screen.getByTestId("remaining-value-0")).toHaveTextContent("£50.00");
                expect(screen.getByTestId("remaining-value-1")).toHaveTextContent("£50.00");
                expect(screen.getByTestId("total-allocation-percent")).toHaveTextContent("100%");
                expect(screen.getByTestId("total-allocation-amount")).toHaveTextContent("£100.00");
                expect(screen.getByTestId("balance-carried-forward-2")).toHaveTextContent("£0.00");
            });
        });

        it("switches to edit view when edit profile button clicked (makes unpaid instalments editable)", async () => {
            await renderPage();

            await waitFor(() => {
                expect(screen.getByTestId("edit-profile-btn")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit profile"));

            await waitFor(() => {
                expect(screen.queryByTestId("value-1")).not.toBeInTheDocument();
                expect(screen.getByTestId("value-2")).toBeInTheDocument();
            });
        });

        it("posts custom profile to api when apply profile button clicked", async () => {
            await renderPage();

            await waitFor(() => {
                expect(screen.getByTestId("edit-profile-btn")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit profile"));

            await waitFor(() => {
                expect(screen.getByText("Apply profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Apply profile"));

            await waitFor(() => {
                expect(mockApplyCustomProfile).toHaveBeenCalledTimes(1);
                expect(mockApplyCustomProfile).toHaveBeenCalledWith({
                    "carryOver": null,
                    "customProfileName": "providerId-fundingStreamId-fundingPeriodId-fundingLineId",
                    "fundingLineCode": "fundingLineId",
                    "fundingPeriodId": "fundingPeriodId",
                    "fundingStreamId": "fundingStreamId",
                    "profilePeriods": [
                        {
                            "distributionPeriodId": "period",
                            "occurrence": 1,
                            "profiledValue": 50,
                            "type": "CalendarMonth",
                            "typeValue": "April",
                            "year": 2020,
                        },
                        {
                            "distributionPeriodId": "period",
                            "occurrence": 1,
                            "profiledValue": 50,
                            "type": "CalendarMonth",
                            "typeValue": "May",
                            "year": 2020,
                        },
                    ],
                    "providerId": "providerId",
                });
            });
        });

        it("posts correct custom profile to api when carry over applies", async () => {
            await renderPage();

            await waitFor(() => {
                expect(screen.getByTestId("edit-profile-btn")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit profile"));

            await waitFor(() => {
                expect(screen.getByText("Apply profile")).toBeInTheDocument();
            });

            const profileInput = screen.getByTestId("value-2");
            const profilePercent = screen.getByTestId("percent-2");
            fireEvent.change(profileInput, {target: {value: '25'}});
            fireEvent.blur(profileInput);

            await waitFor(() => {
                expect(profilePercent.value).toBe('50.00');
            });

            fireEvent.click(screen.getByText("Apply profile"));

            await waitFor(() => {
                expect(mockApplyCustomProfile).toHaveBeenCalledTimes(1);
                expect(mockApplyCustomProfile).toHaveBeenCalledWith({
                    "carryOver": 25,
                    "customProfileName": "providerId-fundingStreamId-fundingPeriodId-fundingLineId",
                    "fundingLineCode": "fundingLineId",
                    "fundingPeriodId": "fundingPeriodId",
                    "fundingStreamId": "fundingStreamId",
                    "profilePeriods": [
                        {
                            "distributionPeriodId": "period",
                            "occurrence": 1,
                            "profiledValue": 50,
                            "type": "CalendarMonth",
                            "typeValue": "April",
                            "year": 2020,
                        },
                        {
                            "distributionPeriodId": "period",
                            "occurrence": 1,
                            "profiledValue": 25,
                            "type": "CalendarMonth",
                            "typeValue": "May",
                            "year": 2020,
                        },
                    ],
                    "providerId": "providerId",
                });
            });
        });
    });

    describe("when user does not have canApplyCustomProfilePattern permission", () => {
        beforeAll(() => {
            useSelectorSpy.mockReturnValue([{
                fundingStreamId: "fundingStreamId",
                canApplyCustomProfilePattern: false
            }]);
            mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                data: {
                    fundingLineProfile: testFundingLineProfile,
                    enableUserEditableCustomProfiles: true,
                    enableUserEditableRuleBasedProfiles: true
                }
            });
        });

        it("shows a permissions message", async () => {
            await renderPage();
            await waitFor(() => {
                expect(screen.getByTestId("permission-alert-message")).toBeInTheDocument();
            });
        });

        it("edit profile button is disabled", async () => {
            await renderPage();
            await waitFor(() => {
                expect(screen.getByTestId("edit-profile-btn")).toBeDisabled();
            });
        });

        it("fields intially load in read (not edit) view", async () => {
            await renderPage();
            await waitFor(() => {
                expect(screen.queryAllByRole("input")).toHaveLength(0);
            });
        });
    });

    describe("when funding stream is restricted", () => {
        beforeAll(() => {
            useSelectorSpy.mockReturnValue([{
                fundingStreamId: "fundingStreamId",
                canApplyCustomProfilePattern: true
            }]);
        });

        it("does not show edit profile button when enableUserEditableCustomProfiles is false", async () => {
            mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                data: {
                    fundingLineProfile: testFundingLineProfile,
                    enableUserEditableCustomProfiles: false,
                    enableUserEditableRuleBasedProfiles: true
                }
            });

            await renderPage();
            await waitFor(() => {
                expect(screen.queryByTestId("edit-profile-btn")).not.toBeInTheDocument();
            });
        });

        it("does not show change to rule based profile button when enableUserEditableRuleBasedProfiles is false", async () => {
            mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                data: {
                    fundingLineProfile: testFundingLineProfile,
                    enableUserEditableCustomProfiles: true,
                    enableUserEditableRuleBasedProfiles: false
                }
            });

            await renderPage();
            await waitFor(() => {
                expect(screen.queryByText(/Change to rule based profile/i)).not.toBeInTheDocument();
            });
        });
    });
});

// Setup mocks and spies
const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const mockHistoryPush = jest.fn();
const mockApplyCustomProfile = jest.fn();
const mockGetFundingLinePublishedProviderDetails = jest.fn();

jest.mock('../../../services/fundingLineDetailsService', () => ({
    getPreviousProfileExistsForSpecificationForProviderForFundingLine: jest.fn(() => Promise.resolve({
        data: {}
    })),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const renderPage = async () => {
    const {ViewFundingLineProfile} = require("../../../pages/FundingApprovals/ViewFundingLineProfile");
    const component = render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
                <ViewFundingLineProfile match={matchMock} location={location} history={history} />
            </QueryClientProvider>
        </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    return component;
}

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<ViewFundingLineProfileProps> = {
    params: {
        specificationId: "specId",
        providerId: "providerId",
        specCoreProviderVersionId: "providerVersionId",
        fundingLineId: "fundingLineId",
        fundingPeriodId: "fundingPeriodId",
        fundingStreamId: "fundingStreamId"
    },
    path: "",
    isExact: true,
    url: ""
};

jest.mock('../../../services/publishedProviderFundingLineService', () => ({
    getFundingLinePublishedProviderDetails: mockGetFundingLinePublishedProviderDetails,
    applyCustomProfile: mockApplyCustomProfile
}));

const testFundingLineProfile = {
    fundingLineCode: "123",
    fundingLineName: "name",
    ukprn: "12345",
    totalAllocation: 100,
    amountAlreadyPaid: 50,
    remainingAmount: 50,
    carryOverAmount: 0,
    providerName: "provider",
    profilePatternKey: "key",
    profilePatternName: "pattern",
    profilePatternDescription: "description",
    lastUpdatedUser: {
        id: "1",
        name: "test user"
    },
    lastUpdatedDate: new Date(2, 2, 2020),
    profileTotalAmount: 100,
    profileTotals: [{
        year: 2020,
        typeValue: "April",
        occurrence: 1,
        value: 50,
        periodType: "CalendarMonth",
        isPaid: true,
        installmentNumber: 1,
        profileRemainingPercentage: null,
        distributionPeriodId: "period",
        actualDate: new Date(1, 1, 2020)
    },
    {
        year: 2020,
        typeValue: "May",
        occurrence: 1,
        value: 50,
        periodType: "CalendarMonth",
        isPaid: false,
        installmentNumber: 2,
        profileRemainingPercentage: 100,
        distributionPeriodId: "period",
        actualDate: new Date(2, 1, 2020)
    }]
};