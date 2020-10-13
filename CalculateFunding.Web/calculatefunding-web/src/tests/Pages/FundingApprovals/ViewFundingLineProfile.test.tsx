import React from "react";
import * as redux from "react-redux";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {ViewFundingLineProfileProps} from "../../../pages/FundingApprovals/ViewFundingLineProfile";
import {waitFor, fireEvent, render, act} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

describe("<ViewFundingLineProfile />", () => {
    beforeAll(() => {
        jest.mock("../../../services/publishedProviderFundingLineService", () => mockPublishedProviderFundingLineService());
    });

    afterAll(() => {
        useSelectorSpy.mockClear();
    });

    describe("when user has canApplyCustomProfilePattern permission", () => {
        beforeAll(() => {
            useSelectorSpy.mockReturnValue([{
                fundingStreamId: "fundingStreamId",
                canApplyCustomProfilePattern: true
            }]);
        });

        beforeEach(() => {
            mockHistoryPush.mockClear();
            mockApplyCustomProfile.mockClear();
        })

        it("does not show a permissions message", async () => {
            const {container} = renderPage();
            await waitFor(() => {
                expect(container.querySelector("#permission-alert-message")).not.toBeInTheDocument();
            });
        });

        it("edit profile button is enabled", async () => {
            const {getByTestId} = renderPage();
            await waitFor(() => {
                expect(getByTestId("edit-profile-btn")).not.toBeDisabled();
            });
        });

        it("fields intially load in read (not edit) view", async () => {
            const {queryAllByRole} = renderPage();
            await waitFor(() => {
                expect(queryAllByRole("input")).toHaveLength(0);
            });
        });

        it("shows the correct funding line profile values", async () => {
            const {getByTestId, getAllByTestId} = renderPage();
            await waitFor(() => {
                expect(getByTestId('funding-line-name')).toHaveTextContent("name")
                expect(getByTestId("provider-name")).toHaveTextContent("provider");
                expect(getByTestId("ukprn")).toHaveTextContent("UKPRN: 12345");
                expect(getByTestId("last-updated-by")).toHaveTextContent("Last updated by test user on 10 September 1907 0:00 am");
                expect(getByTestId("total-allocation")).toHaveTextContent("£100.00");
                expect(getByTestId("amount-already-paid")).toHaveTextContent("£50.00");
                expect(getByTestId("remaining-amount")).toHaveTextContent("£50.00");
                expect(getByTestId("balance-carried-forward")).toHaveTextContent("£0.00");
                expect(getAllByTestId("profile-total")).toHaveLength(2);
                expect(getByTestId("paid-0")).toHaveTextContent("Paid");
                expect(getByTestId("paid-1")).toHaveTextContent("");
                expect(getByTestId("instalment-number-0")).toHaveTextContent("1");
                expect(getByTestId("instalment-number-1")).toHaveTextContent("2");
                expect(getByTestId("remaining-percentage-0")).toHaveTextContent("");
                expect(getByTestId("remaining-percentage-1")).toHaveTextContent("100.00%");
                expect(getByTestId("remaining-value-0")).toHaveTextContent("£50.00");
                expect(getByTestId("remaining-value-1")).toHaveTextContent("£50.00");
                expect(getByTestId("total-allocation-percent")).toHaveTextContent("100%");
                expect(getByTestId("total-allocation-amount")).toHaveTextContent("£100.00");
                expect(getByTestId("balance-carried-forward-2")).toHaveTextContent("£0.00");
            });
        });

        it("switches to edit view when edit profile button clicked (makes unpaid instalments editable)", async () => {
            const {getByTestId, queryByTestId, getByText} = renderPage();

            await waitFor(() => {
                expect(getByTestId("edit-profile-btn")).toBeInTheDocument();
            });

            fireEvent.click(getByText("Edit profile"));

            await waitFor(() => {
                expect(queryByTestId("value-1")).not.toBeInTheDocument();
                expect(getByTestId("value-2")).toBeInTheDocument();
            });
        });

        it("posts custom profile to api when apply profile button clicked", async () => {
            const {getByTestId, getByText} = renderPage();

            await waitFor(() => {
                expect(getByTestId("edit-profile-btn")).toBeInTheDocument();
            });

            fireEvent.click(getByText("Edit profile"));

            await waitFor(() => {
                expect(getByText("Apply profile")).toBeInTheDocument();
            });

            fireEvent.click(getByText("Apply profile"));

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
            const {getByTestId, getByText} = renderPage();

            await waitFor(() => {
                expect(getByTestId("edit-profile-btn")).toBeInTheDocument();
            });

            fireEvent.click(getByText("Edit profile"));

            await waitFor(() => {
                expect(getByText("Apply profile")).toBeInTheDocument();
            });

            const profileInput = getByTestId("value-2");
            const profilePercent = getByTestId("percent-2");
            fireEvent.change(profileInput, { target: { value: '25' } });
            fireEvent.blur(profileInput);
            
            await waitFor(() => {
                expect(profilePercent.value).toBe('50.00');
            });

            fireEvent.click(getByText("Apply profile"));

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
        });

        it("shows a permissions message", async () => {
            const {getByTestId} = renderPage();
            await waitFor(() => {
                expect(getByTestId("permission-alert-message")).toBeInTheDocument();
            });
        });

        it("edit profile button is disabled", async () => {
            const {getByTestId} = renderPage();
            await waitFor(() => {
                expect(getByTestId("edit-profile-btn")).toBeDisabled();
            });
        });

        it("fields intially load in read (not edit) view", async () => {
            const {queryAllByRole} = renderPage();
            await waitFor(() => {
                expect(queryAllByRole("input")).toHaveLength(0);
            });
        });
    });
});

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const mockHistoryPush = jest.fn();
const mockApplyCustomProfile = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const renderPage = () => {
    const {ViewFundingLineProfile} = require("../../../pages/FundingApprovals/ViewFundingLineProfile");
    return render(
        <MemoryRouter>
            <ViewFundingLineProfile match={matchMock} location={location} history={history} />
        </MemoryRouter>
    );
}

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<ViewFundingLineProfileProps> = {
    params: {
        specificationId: "specId",
        providerId: "providerId",
        providerVersionId: "providerVersionId",
        fundingLineId: "fundingLineId",
        fundingPeriodId: "fundingPeriodId",
        fundingStreamId: "fundingStreamId"
    },
    path: "",
    isExact: true,
    url: ""
};

function mockPublishedProviderFundingLineService() {
    const originalService = jest.requireActual("../../../services/publishedProviderFundingLineService");
    return {
        ...originalService,
        applyCustomProfile: mockApplyCustomProfile,
        getFundingLinePublishedProviderDetails: jest.fn(() => Promise.resolve({
            data: {
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
            }
        }))
    }
}