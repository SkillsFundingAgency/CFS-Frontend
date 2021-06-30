import React from "react";
import * as redux from "react-redux";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {ViewEditFundingLineProfileProps} from "../../../pages/FundingApprovals/ViewEditFundingLineProfile";
import {waitFor, fireEvent, render, screen, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {QueryClient, QueryClientProvider} from "react-query";
import {hasSpecPermissions} from "../../fakes/testFactories";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import {Permission} from "../../../types/Permission";

describe("<ViewEditFundingLineProfile in VIEW mode />", () => {
    afterEach(async () => {
        mockHistoryPush.mockClear();
        mockApplyCustomProfile.mockClear();
    });

    afterAll(() => {
        mockGetFundingLinePublishedProviderDetails.mockClear();
        useSelectorSpy.mockClear();
    });

    describe("when user has canApplyCustomProfilePattern permission", () => {
        beforeEach(async () => {
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
            hasSpecPermissions(withPermissions);

            await renderPage();
        });

        it("does not show a permissions message", async () => {
            expect(screen.queryByTestId("permission-alert-message")).not.toBeInTheDocument();
        });

        it("edit profile button is enabled", async () => {
            expect(await screen.findByRole("button", {name: /Edit profile/})).not.toBeDisabled();
        });

        it("fields are all in read only view", async () => {
            await waitFor(() => {
                expect(screen.queryAllByRole("input")).toHaveLength(0);
            });
        });

        it("renders the funding line heading", async () => {
            expect(await screen.findByRole("heading", {name: /Profile for My Funding Line/}));
        });

        it("renders the provider name", async () => {
            expect(await screen.findByRole("heading", {name: /Methods Primary School/}));
        });

        it("renders the last updated info", async () => {
            expect(await screen.findByTestId("last-updated-by")).toHaveTextContent("Last updated by test user on 10 September 1907");
        });

        it("renders the UKPRN", async () => {
            const dd = await screen.findByRole("definition", {name: /UKPRN/});
            expect(within(dd).getByText(testFundingLineProfile.ukprn)).toBeInTheDocument();
        });

        it("renders the total allocation", async () => {
            const dd = await screen.findByRole("definition", {name: /Total allocation/});
            expect(within(dd).getByText(/£100.00/)).toBeInTheDocument();
        });

        it("renders the amount already paid", async () => {
            const amountAlreadyPaidEl = await screen.findByRole("definition", {name: /Instalments paid value/});
            expect(within(amountAlreadyPaidEl).getByText(/£40.00/)).toBeInTheDocument();
        });

        it("renders the balance available", async () => {
            const balanceAvailableEl = await screen.findByRole("definition", {name: /Balance available for profiling/});
            expect(within(balanceAvailableEl).getByText(/£60.00/)).toBeInTheDocument();
        });

        it("shows the correct funding line profile values", async () => {
            expect(await screen.findByTestId("balance-carried-forward")).toHaveTextContent("£0.00");
            expect(screen.getAllByTestId("profile-total")).toHaveLength(2);
            expect(screen.getByTestId("paid-0")).toHaveTextContent("Paid");
            expect(screen.getByTestId("paid-1")).toHaveTextContent("");
            expect(screen.getByTestId("instalment-number-0")).toHaveTextContent("1");
            expect(screen.getByTestId("instalment-number-1")).toHaveTextContent("2");
            expect(screen.getByTestId("remaining-percentage-0")).toHaveTextContent("");
            expect(screen.getByTestId("remaining-percentage-1")).toHaveTextContent("100.00%");
            expect(screen.getByTestId("remaining-value-0")).toHaveTextContent("£40.00");
            expect(screen.getByTestId("remaining-value-1")).toHaveTextContent("£60.00");
            expect(screen.getByTestId("total-allocation-percent")).toHaveTextContent("100%");
            expect(screen.getByTestId("total-allocation-amount")).toHaveTextContent("£100.00");
        });

        it("switches to edit view when edit profile button clicked", async () => {
            const editButton = await screen.findByRole("button", {name: /Edit profile/});

            fireEvent.click(editButton);

            expect(mockHistoryPush).toBeCalledWith("/Approvals/ProviderFundingOverview/specId/providerId/providerVersionId/fundingStreamId/fundingPeriodId/fundingLineId/edit");
        });
    });


    describe("when user does not have canApplyCustomProfilePattern permission", () => {
        beforeAll(async () => {
            mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                data: {
                    fundingLineProfile: testFundingLineProfile,
                    enableUserEditableCustomProfiles: true,
                    enableUserEditableRuleBasedProfiles: true
                }
            });
            hasSpecPermissions(withoutPermissions);
        });

        afterAll(() => {
            mockGetFundingLinePublishedProviderDetails.mockClear();
        });

        it("shows a permissions message", async () => {
            await renderPage();

            expect(await screen.findByTestId("permission-alert-message")).toBeInTheDocument();
        });

        it("edit profile button is disabled", async () => {
            await renderPage();

            expect(await screen.findByRole("button", {name: /Edit profile/})).toBeDisabled();
        });

        it("fields initially load in read (not edit) view", async () => {
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
    const {ViewEditFundingLineProfile} = require("../../../pages/FundingApprovals/ViewEditFundingLineProfile");
    const page = render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
                <ViewEditFundingLineProfile match={matchMock} location={location} history={history}/>
            </QueryClientProvider>
        </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByTestId("loader")).not.toBeInTheDocument());

    return page;
}

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<ViewEditFundingLineProfileProps> = {
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

const withoutPermissions: SpecificationPermissionsResult = {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => false,
    hasMissingPermissions: true,
    isPermissionsFetched: true,
    permissionsEnabled: [],
    permissionsDisabled: [Permission.CanApplyCustomProfilePattern],
    missingPermissions: [Permission.CanApplyCustomProfilePattern],
};
const withPermissions: SpecificationPermissionsResult = {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => true,
    hasMissingPermissions: false,
    isPermissionsFetched: true,
    permissionsEnabled: [Permission.CanApplyCustomProfilePattern],
    permissionsDisabled: [],
    missingPermissions: [],
};
const testFundingLineProfile = {
    fundingLineCode: "fl123",
    fundingLineName: "My Funding Line",
    ukprn: "12345",
    fundingLineAmount: 100,
    amountAlreadyPaid: 40,
    remainingAmount: 60,
    carryOverAmount: 0,
    providerName: "Methods Primary School",
    profilePatternKey: "key",
    profilePatternName: "pattern",
    profilePatternDescription: "description",
    lastUpdatedUser: {
        id: "1",
        name: "test user"
    },
    lastUpdatedDate: new Date(Date.UTC(2, 2, 2020)),
    profileTotalAmount: 100,
    profileTotals: [{
        year: 2020,
        typeValue: "April",
        occurrence: 1,
        value: 40,
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
            value: 60,
            periodType: "CalendarMonth",
            isPaid: false,
            installmentNumber: 2,
            profileRemainingPercentage: 100,
            distributionPeriodId: "period",
            actualDate: new Date(Date.UTC(2, 1, 2020))
        }]
};
