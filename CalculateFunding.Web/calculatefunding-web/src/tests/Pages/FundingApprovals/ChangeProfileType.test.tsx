import React from "react";
import * as redux from "react-redux";
import {render, waitFor, fireEvent, screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {ChangeProfileTypeProps} from "../../../pages/FundingApprovals/ChangeProfileType";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "react-query";

describe("<ChangeProfileType /> ", () => {
    beforeEach(() => {
        mockGetAllProfilePatterns.mockResolvedValue({
            data: [{
                fundingPeriodId: "FY-2021",
                fundingStreamId: "DSG",
                fundingLineId: "DSG-004",
                roundingStrategy: "roundingStrategy",
                profilePatternKey: null,
                fundingStreamPeriodStartDate: new Date(),
                fundingStreamPeriodEndDate: new Date(),
                reProfilePastPeriods: true,
                calculateBalancingPayment: true,
                allowUserToEditProfilePattern: true,
                profilePattern: [],
                profilePatternDisplayName: "National",
                profilePatternDescription: "National pattern",
                providerTypeSubTypes: [],
                id: "national"
            },
            {
                fundingPeriodId: "FY-2021",
                fundingStreamId: "DSG",
                fundingLineId: "DSG-004",
                roundingStrategy: "roundingStrategy",
                profilePatternKey: "pattern key 1",
                fundingStreamPeriodStartDate: new Date(),
                fundingStreamPeriodEndDate: new Date(),
                reProfilePastPeriods: true,
                calculateBalancingPayment: true,
                allowUserToEditProfilePattern: true,
                profilePattern: [],
                profilePatternDisplayName: "pattern key 1",
                profilePatternDescription: "rule based pattern",
                providerTypeSubTypes: [],
                id: "rule-based-1"
            },
            {
                fundingPeriodId: "FY-2021",
                fundingStreamId: "DSG",
                fundingLineId: "DSG-004",
                roundingStrategy: "roundingStrategy",
                profilePatternKey: "pattern key 2",
                fundingStreamPeriodStartDate: new Date(),
                fundingStreamPeriodEndDate: new Date(),
                reProfilePastPeriods: true,
                calculateBalancingPayment: true,
                allowUserToEditProfilePattern: true,
                profilePattern: [],
                profilePatternDisplayName: "pattern key 2",
                profilePatternDescription: "rule based pattern",
                providerTypeSubTypes: [],
                id: "rule-based-2"
            }]
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        mockGetAllProfilePatterns.mockReset();
    });

    describe("when user has canApplyCustomProfilePattern permission", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue([{
                fundingStreamId: "DSG",
                canApplyCustomProfilePattern: true
            }]);
        });

        describe("when profile pattern has not already been set", () => {
            beforeEach(() => {
                mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                    data: {
                        fundingLineProfile: {
                            fundingLineCode: "DSG-004",
                            fundingLineName: "Pupil Led Factors"
                        },
                        enableUserEditableCustomProfiles: true,
                        enableUserEditableRuleBasedProfiles: true
                    }
                });
            });

            it("shows validation message when profile type not selected and user clicks apply", async () => {
                const {assignProfilePatternKeyToPublishedProvider} = require('../../../services/profilingService');
                const {getByText} = renderPage();
                await waitFor(() => {
                    expect(getByText(/Apply/).closest("button")).not.toBeDisabled();
                });
                fireEvent.click(getByText(/Apply/).closest("button") as Element);
                await waitFor(() => {
                    expect(getByText(/No pattern type selected/i)).toBeInTheDocument();
                    expect(assignProfilePatternKeyToPublishedProvider).not.toBeCalled();
                });
            });

            it("shows validation message when rule based option not selected and user clicks apply", async () => {
                const {assignProfilePatternKeyToPublishedProvider} = require('../../../services/profilingService');
                const {getByText, getByLabelText, getAllByText} = renderPage();
                await waitFor(() => {
                    expect(getByText(/Apply/).closest("button")).not.toBeDisabled();
                });
                fireEvent.click(getByLabelText(/Rule based/).closest("input") as Element);
                await waitFor(() => {
                    expect(getByLabelText(/Rule based/)).toBeChecked();
                });
                fireEvent.click(getByText(/Apply/).closest("button") as Element);
                await waitFor(() => {
                    expect(getAllByText(/A rule based pattern must be selected/i)).toHaveLength(2);
                    expect(assignProfilePatternKeyToPublishedProvider).not.toBeCalled();
                });
            });
        });

        describe("when existing profile pattern has already been set", () => {
            beforeEach(() => {
                mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                    data: {
                        fundingLineProfile: {
                            fundingLineCode: "DSG-004",
                            fundingLineName: "Pupil Led Factors",
                            totalAllocation: null,
                            amountAlreadyPaid: 0.0,
                            remainingAmount: null,
                            carryOverAmount: 0.0,
                            providerId: "10005143",
                            providerName: "BOURNEMOUTH, CHRISTCHURCH AND POOLE COUNCIL",
                            ukprn: "10005143",
                            profilePatternKey: "pattern key 2",
                            profilePatternName: "pattern key 2",
                            profilePatternDescription: null,
                            lastUpdatedUser: {
                                id: "testid",
                                name: "testuser"
                            },
                            lastUpdatedDate: "2020-11-10T12:51:36.5248081+00:00",
                            profileTotalAmount: 0.0,
                            profileTotals: []
                        },
                        enableUserEditableCustomProfiles: true,
                        enableUserEditableRuleBasedProfiles: true
                    }
                });
            });

            it("does not show a permissions message", async () => {
                const {queryByText} = renderPage();
                await waitFor(() => {
                    expect(queryByText(/you do not have permissions/i)).not.toBeInTheDocument();
                });
            });

            it("apply button is enabled", async () => {
                const {getByText} = renderPage();
                await waitFor(() => {
                    expect(getByText(/Apply/).closest("button")).not.toBeDisabled();
                });
            });

            it("renders a national profile type that is not checked by default", async () => {
                const {getByLabelText} = renderPage();
                await waitFor(() => {
                    expect(getByLabelText(/National/)).not.toBeChecked();
                });
            });

            it("renders correct number of rule based options", async () => {
                const {getAllByLabelText} = renderPage();
                await waitFor(() => {
                    expect(getAllByLabelText(/pattern key/i).length).toBe(2);
                });
            });

            it("sets profile type to currently set type", async () => {
                const {getByLabelText} = renderPage();
                await waitFor(() => {
                    expect(getByLabelText(/Rule based/)).toBeChecked();
                    expect(getByLabelText(/pattern key 2/i)).toBeChecked();
                });
            });

            it("saves new rule based profile", async () => {
                const {assignProfilePatternKeyToPublishedProvider} = require('../../../services/profilingService');
                const {getByLabelText, getByText} = renderPage();
                await waitFor(() => {
                    expect(getByLabelText(/pattern key 2/i)).toBeChecked();
                });
                fireEvent.click(getByLabelText(/pattern key 1/).closest("input") as Element);
                await waitFor(() => {
                    expect(getByLabelText(/pattern key 2/i)).not.toBeChecked();
                    expect(getByLabelText(/pattern key 1/i)).toBeChecked();
                });
                fireEvent.click(getByText(/Apply/).closest("button") as Element);
                await waitFor(() => {
                    expect(assignProfilePatternKeyToPublishedProvider).toBeCalledTimes(1);
                    expect(assignProfilePatternKeyToPublishedProvider).toBeCalledWith("DSG", "FY-2021", "10005143", "DSG-004", "pattern key 1");
                    expect(mockHistoryPush).toBeCalledWith("/Approvals/ProviderFundingOverview/specId/10005143/dsg-2019-12-16/DSG/FY-2021/DSG-004");
                });
            });

            it("cancel button returns user to provider overview", async () => {
                const {assignProfilePatternKeyToPublishedProvider} = require('../../../services/profilingService');
                const {getByLabelText, getByText} = renderPage();
                await waitFor(() => {
                    expect(getByLabelText(/pattern key 2/i)).toBeChecked();
                });
                fireEvent.click(getByText(/Cancel/).closest("button") as Element);
                await waitFor(() => {
                    expect(assignProfilePatternKeyToPublishedProvider).not.toBeCalled();
                    expect(mockHistoryPush).toBeCalledWith("/Approvals/ProviderFundingOverview/specId/10005143/dsg-2019-12-16/DSG/FY-2021/DSG-004");
                });
            });

            it("hides preview modal by default", async () => {
                const {queryByRole} = renderPage();
                await waitFor(() => {
                    expect(queryByRole("dialog")).not.toBeInTheDocument();
                });
            });

            it("shows preview modal when preview link clicked and loads data", async () => {
                const {getByRole, getByText, getAllByText} = renderPage();
                await waitFor(() => {
                    expect(getByText(/Apply/).closest("button")).not.toBeDisabled();
                });

                fireEvent.click(getAllByText(/Preview profile/i)[0]);

                await waitFor(() => {
                    expect(getByRole("dialog")).toBeInTheDocument();
                });

                expect(mockPreviewProfile).toBeCalledTimes(1);
            });

            it("can close preview modal", async () => {
                const {getByRole, getByText, getAllByText, queryByRole} = renderPage();
                await waitFor(() => {
                    expect(getByText(/Apply/).closest("button")).not.toBeDisabled();
                });

                fireEvent.click(getAllByText(/Preview profile/i)[0]);

                await waitFor(() => {
                    expect(getByRole("dialog")).toBeInTheDocument();
                });

                fireEvent.click(getAllByText(/Close/i)[0]);

                expect(queryByRole("dialog")).not.toBeInTheDocument();
            });

            it("displays errors and closes preview modal on error loading preview data", async () => {
                mockPreviewProfile.mockRejectedValue("fail");

                const {getByText, getAllByText, queryByRole} = renderPage();
                await waitFor(() => {
                    expect(getByText(/Apply/).closest("button")).not.toBeDisabled();
                });

                userEvent.click(getAllByText(/Preview profile/i)[0]);

                await waitFor(() => {
                    expect(queryByRole("dialog")).not.toBeInTheDocument();
                });

                expect(mockPreviewProfile).toBeCalledTimes(1);
                expect(getByText(/There is a problem/i)).toBeInTheDocument();
            });
        });

        describe("when only national pattern exists", () => {
            beforeEach(() => {
                mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                    data: {
                        fundingLineProfile: {
                            fundingLineCode: "DSG-004",
                            fundingLineName: "Pupil Led Factors",
                            totalAllocation: null,
                            amountAlreadyPaid: 0.0,
                            remainingAmount: null,
                            carryOverAmount: 0.0,
                            providerId: "10005143",
                            providerName: "BOURNEMOUTH, CHRISTCHURCH AND POOLE COUNCIL",
                            ukprn: "10005143",
                            profilePatternKey: null,
                            profilePatternName: "National",
                            profilePatternDescription: null,
                            lastUpdatedUser: {
                                id: "testid",
                                name: "testuser"
                            },
                            lastUpdatedDate: "2020-11-10T12:51:36.5248081+00:00",
                            profileTotalAmount: 0.0,
                            profileTotals: []
                        },
                        enableUserEditableCustomProfiles: true,
                        enableUserEditableRuleBasedProfiles: true
                    }
                });

                mockGetAllProfilePatterns.mockResolvedValue({
                    data: [{
                        fundingPeriodId: "FY-2021",
                        fundingStreamId: "DSG",
                        fundingLineId: "DSG-004",
                        roundingStrategy: "roundingStrategy",
                        profilePatternKey: null,
                        fundingStreamPeriodStartDate: new Date(),
                        fundingStreamPeriodEndDate: new Date(),
                        reProfilePastPeriods: true,
                        calculateBalancingPayment: true,
                        allowUserToEditProfilePattern: true,
                        profilePattern: [],
                        profilePatternDisplayName: "National",
                        profilePatternDescription: "National pattern",
                        providerTypeSubTypes: [],
                        id: "national"
                    }]
                });
            });

            it("displays no rule based patterns message", async () => {
                renderPage();
                await waitFor(() => {
                    expect(screen.getByLabelText(/National/)).toBeChecked();
                });
                expect(screen.getByText(/No rule based patterns are available. Pupil Led Factors is using the national pattern./)).toBeInTheDocument();
                expect(screen.getByLabelText(/Rule based/)).toBeDisabled();
                expect(screen.getByText(/Apply/).closest("button")).toBeDisabled();
            });
        });

        describe("when existing pattern is custom", () => {
            beforeEach(() => {
                mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
                    data: {
                        fundingLineProfile: {
                            fundingLineCode: "DSG-004",
                            fundingLineName: "Pupil Led Factors",
                            totalAllocation: null,
                            amountAlreadyPaid: 0.0,
                            remainingAmount: null,
                            carryOverAmount: 0.0,
                            providerId: "10005143",
                            providerName: "BOURNEMOUTH, CHRISTCHURCH AND POOLE COUNCIL",
                            ukprn: "10005143",
                            profilePatternKey: null,
                            profilePatternName: "custom",
                            profilePatternDescription: null,
                            isCustomProfile: true,
                            lastUpdatedUser: {
                                id: "testid",
                                name: "testuser"
                            },
                            lastUpdatedDate: "2020-11-10T12:51:36.5248081+00:00",
                            profileTotalAmount: 0.0,
                            profileTotals: []
                        },
                        enableUserEditableCustomProfiles: true,
                        enableUserEditableRuleBasedProfiles: true
                    }
                });
            });

            it("apply button is enabled", async () => {
                const {getByText} = renderPage();
                await waitFor(() => {
                    expect(getByText(/Apply/).closest("button")).not.toBeDisabled();
                });
            });

            it("renders a national profile type that is not checked by default", async () => {
                const {getByLabelText} = renderPage();
                await waitFor(() => {
                    expect(getByLabelText(/National/)).not.toBeChecked();
                });
            });

            it("renders correct number of rule based options", async () => {
                const {getAllByLabelText} = renderPage();
                await waitFor(() => {
                    expect(getAllByLabelText(/pattern key/i).length).toBe(2);
                });
            });

            it("renders rule based options that are not checked by default", async () => {
                const {getByLabelText} = renderPage();
                await waitFor(() => {
                    expect(getByLabelText(/Rule based/)).not.toBeChecked();
                    expect(getByLabelText(/pattern key 2/i)).not.toBeChecked();
                });
            });

            it("does not display no rule based patterns message", async () => {
                renderPage();
                await waitFor(() => {
                    expect(screen.getByLabelText(/National/)).not.toBeChecked();
                });
                expect(screen.queryByText(/No rule based patterns are available/i)).not.toBeInTheDocument();
            });
        });
    });

    describe("when user does not have canApplyCustomProfilePattern permission ", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue([{
                fundingStreamId: "DSG",
                canApplyCustomProfilePattern: false
            }]);
        });

        it("shows a permissions message", async () => {
            const {getByText} = renderPage();
            await waitFor(() => {
                expect(getByText(/you do not have permissions/i)).toBeInTheDocument();
            });
        });

        it("apply button is disabled", async () => {
            const {getByText} = renderPage();
            await waitFor(() => {
                expect(getByText(/Apply/).closest("button")).toBeDisabled();
            });
        });
    });
});

// Setup module mocks
const mockGetFundingLinePublishedProviderDetails = jest.fn();
const mockGetAllProfilePatterns = jest.fn();
const mockPreviewProfile = jest.fn(() => Promise.resolve({
    data: []
}));

jest.mock('../../../services/profilingService', () => ({
    previewProfile: mockPreviewProfile,
    assignProfilePatternKeyToPublishedProvider: jest.fn(() => Promise.resolve()),
    getAllProfilePatterns: mockGetAllProfilePatterns,
}));

jest.mock('../../../services/providerService', () => ({
    getProviderByIdAndVersionService: jest.fn(() => Promise.resolve({
        data: {
            "id": "dsg-2019-12-16_10005143",
            "providerVersionId": "dsg-2019-12-16",
            "providerId": "10005143",
            "name": "BOURNEMOUTH, CHRISTCHURCH AND POOLE COUNCIL",
            "urn": "",
            "ukprn": "10005143",
            "upin": "",
            "establishmentNumber": "",
            "dfeEstablishmentNumber": "839",
            "authority": "Bournemouth Christchurch and Poole",
            "providerType": "Local Authority",
            "providerSubType": "Local Authority",
            "dateOpened": null,
            "dateClosed": null,
            "providerProfileIdType": "",
            "laCode": "839",
            "navVendorNo": "",
            "crmAccountId": "",
            "legalName": "",
            "status": "Open",
            "phaseOfEducation": "",
            "reasonEstablishmentOpened": "",
            "reasonEstablishmentClosed": "",
            "successor": "",
            "trustStatus": "NotApplicable",
            "trustName": "",
            "trustCode": "",
            "town": "BOURNEMOUTH",
            "postcode": "BH2 6DY",
            "rscRegionName": "",
            "rscRegionCode": "",
            "localGovernmentGroupTypeName": "Unitary Authorities",
            "localGovernmentGroupTypeCode": "UA",
            "countryName": "England",
            "countryCode": "E92000001",
            "street": null,
            "locality": null,
            "address3": null,
            "paymentOrganisationIdentifier": null,
            "paymentOrganisationName": null
        }
    })),
}));

jest.mock('../../../services/publishedProviderFundingLineService', () => ({
    getFundingLinePublishedProviderDetails: mockGetFundingLinePublishedProviderDetails
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

// Setup spies
const useSelectorSpy = jest.spyOn(redux, 'useSelector');

// Setup router mocks
const mockHistoryPush = jest.fn();
const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<ChangeProfileTypeProps> = {
    params: {
        specificationId: "specId",
        providerId: "10005143",
        providerVersionId: "dsg-2019-12-16",
        fundingLineId: "DSG-004",
        fundingPeriodId: "FY-2021",
        fundingStreamId: "DSG"
    },
    path: "",
    isExact: true,
    url: ""
};

const renderPage = () => {
    const {ChangeProfileType} = require("../../../pages/FundingApprovals/ChangeProfileType");
    return render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
                <ChangeProfileType match={matchMock} location={location} history={history} />
            </QueryClientProvider>
        </MemoryRouter>
    );
}