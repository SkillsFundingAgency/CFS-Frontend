﻿import {PublishStatus} from "../../../types/PublishStatusModel";
import React from 'react';
import {match, MemoryRouter} from "react-router";
import {createLocation} from "history";
import {render, screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import * as redux from "react-redux";
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {QueryClient, QueryClientProvider} from "react-query";
import * as permissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import * as jobHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import {FundingConfigurationQueryResult} from "../../../hooks/useFundingConfiguration";
import * as specHook from "../../../hooks/useSpecificationSummary";
import {SpecificationSummaryQueryResult} from "../../../hooks/useSpecificationSummary";
import {PublishedProviderResult} from "../../../types/PublishedProvider/PublishedProviderSearchResults";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {JobType} from "../../../types/jobType";
import {RunningStatus} from "../../../types/RunningStatus";
import {FundingSearchSelectionState} from "../../../states/FundingSearchSelectionState";
import {ConfirmFundingRouteProps} from "../../../pages/FundingApprovals/ConfirmFunding";
import {FundingActionType, PublishedProviderFundingCount} from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import {createPublishedProviderResult, createPublishedProviderSearchQueryResult, defaultFacets} from "../../fakes/testFactories";
import {JobCreatedResponse} from "../../../types/JobCreatedResponse";
import {getJobDetailsFromJobResponse} from "../../../helpers/jobDetailsHelper";
import {Permission} from "../../../types/Permission";
import userEvent from "@testing-library/user-event";
import {CompletionStatus} from "../../../types/CompletionStatus";


const location = createLocation("", "", "");
const store: Store<IStoreState> = createStore(rootReducer);

const mockHistoryPush = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const renderPage = async () => {
    const {ConfirmFunding} = require('../../../pages/FundingApprovals/ConfirmFunding');
    store.dispatch = jest.fn();
    const result = render(<MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
            <Provider store={store}>
                <ConfirmFunding location={location} history={history} match={config.mockConfirmApprovalRoute}/>
            </Provider>
        </QueryClientProvider>
    </MemoryRouter>)

    await waitFor(() => expect(screen.queryByTestId("loader")).not.toBeInTheDocument());

    return result;
};

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
jest.mock("../../../components/AdminNav");
const config = setupTestConfig();

describe("<ConfirmFunding />", () => {

    describe("<ConfirmFunding /> in approve all mode", () => {

        describe("when job is active", () => {
            beforeEach(async () => {
                config.hasActiveJobRunning();
                config.hasSpecification();
                config.hasMockPublishedProviderService();
                config.hasFundingConfigWithApproveAllMode();
                config.hasPermissions();
                config.hasMockPublishService();
                config.hasProviderService();
                await renderPage();
            });
            afterEach(() => jest.clearAllMocks());

            it('renders job progress message', async () => {
                const alert = await screen.findByRole("alert", {name: /job-notification/});
                expect(within(alert).getByRole("alert", {name: /Monitoring job/})).toBeInTheDocument();
                expect(within(alert).getByText(`Job ${config.activeJob?.latestJob?.statusDescription}: ${config.activeJob?.latestJob?.jobDescription}`)).toBeInTheDocument();
            });

            it('renders warning message', async () => {
                expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
            });

            it('renders approve button as disabled', async () => {
                const button = screen.queryByRole("button", {name: /Confirm approval/});
                expect(button).toBeInTheDocument();
                expect(button).toBeDisabled();
            });

            it('renders last refresh information', async () => {
                const {getSpecificationCalculationResultsMetadata} = require('../../../services/providerService');
                await waitFor(() => {
                    expect(getSpecificationCalculationResultsMetadata).toBeCalledTimes(1);
                });

                const lastRefresh = screen.getByTestId("last-refresh") as HTMLElement;
                expect(lastRefresh.textContent).toContain("1 January 2020 10:30 AM by testUser");

                const lastCalculation = screen.getByTestId("last-calculation-results") as HTMLElement;
                expect(lastCalculation.textContent).toContain("1 January 2021 10:30 AM");
            });
        });

        describe("<ConfirmFunding /> when presenting user with approval confirmation of all providers", () => {
            beforeEach(async () => {
                useSelectorSpy.mockReturnValue(config.selectedProviders);
                config.hasNoActiveJobsRunning();
                config.hasSpecification();
                config.hasFundingConfigWithApproveAllMode();
                config.hasMockPublishService();
                config.hasProviderService();
                config.hasMockPublishedProviderService();
                config.hasPermissions();

                await renderPage();
            });
            afterEach(() => jest.clearAllMocks());

            it('calls api to get search results', async () => {
                await waitFor(() => expect(config.mockSearchService).toHaveBeenCalled());
            });

            it('does not call api to get funding summary', async () => {
                expect(config.mockFundingSummaryForApprovingService).not.toHaveBeenCalled();
            });

            it('does not render job progress spinner', async () => {
                expect(screen.queryByText(/Checking for jobs running/)).not.toBeInTheDocument();
            });

            it('renders warning message', async () => {
                expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
            });

            it('renders funding summary section', async () => {
                const fundingSummaryTable = await screen.findByRole("table", {name: "funding-summary-table"});
                expect(fundingSummaryTable).toBeInTheDocument();
                expect(within(fundingSummaryTable).getByText(/Providers selected/)).toBeInTheDocument();
                expect(within(fundingSummaryTable).getByText(config.fundingStream.name)).toBeInTheDocument();
                expect(within(fundingSummaryTable).getByText(config.fundingPeriod.name)).toBeInTheDocument();
                expect(within(fundingSummaryTable).getByText(config.testSpec.name)).toBeInTheDocument();
            });

            it('does not render change selection link', async () => {
                expect(screen.queryByRole("link", {name: /Change selection/})).not.toBeInTheDocument();
            });

            it('renders approve button as enabled', async () => {
                const button = screen.queryByRole("button", {name: /Confirm approval/});
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();
            });

            it('does not render last refresh information', async () => {
                expect(screen.queryByText(/Last refresh/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Last calculation results update/)).not.toBeInTheDocument();
            });
        });
    });

    describe("<ConfirmFunding /> in approve batch mode", () => {

        describe("<ConfirmFunding /> when presenting user with batch approval confirmation", () => {
            beforeEach(async () => {
                useSelectorSpy.mockReturnValue(config.selectedProviders);
                config.hasNoActiveJobsRunning();
                config.hasSpecification();
                config.hasFundingConfigWithApproveBatchMode();
                config.hasPermissions();
                config.hasMockPublishService();
                config.hasProviderService();
                config.hasMockPublishedProviderService();

                await renderPage();
            });
            afterEach(() => jest.clearAllMocks());

            it('does not call api to get search results', async () => {
                expect(config.mockSearchService).not.toHaveBeenCalled();
            });

            it('calls api to get funding summary', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService)
                    .toHaveBeenCalledWith(config.testSpec.id, config.selectedProviders.selectedProviderIds));
            });

            it('does not render job progress spinner', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                expect(screen.queryByText(/Checking for jobs running/)).not.toBeInTheDocument();
            });

            it('renders funding summary section', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                expect(screen.getByTestId("funding-summary-section"))
            });

            it('renders warning message', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                const fundingSummarySection = screen.getByTestId("funding-summary-section");
                expect(within(fundingSummarySection)
                    .getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
            });

            it('renders funding summary table', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                const fundingSummarySection = screen.getByTestId("funding-summary-section");
                const fundingSummaryTable = await within(fundingSummarySection).findByRole("table", {name: "funding-summary-table"});
                expect(fundingSummaryTable).toBeInTheDocument();
                expect(within(fundingSummaryTable).getByText("Providers selected")).toBeInTheDocument();
                expect(within(fundingSummaryTable).getByText(config.fundingStream.name)).toBeInTheDocument();
                expect(within(fundingSummaryTable).getByText(config.fundingPeriod.name)).toBeInTheDocument();
                expect(within(fundingSummaryTable).getByText(config.testSpec.name)).toBeInTheDocument();
            });

            it('renders change selection link as enabled', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                const link = await screen.findByRole("link", {name: /Change selection/}) as HTMLAnchorElement;
                expect(link).toBeInTheDocument();
                expect(link.getAttribute("href")).toBe(`/Approvals/SpecificationFundingApproval/${config.fundingStream.id}/${config.fundingPeriod.id}/${config.testSpec.id}`);
                expect(link).toBeEnabled();
            });

            it('renders approve button as enabled', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                const button = screen.queryByRole("button", {name: /Confirm approval/}) as HTMLButtonElement;
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();
            });
        });

        describe("<ConfirmFunding /> when user confirms approval of batch funding", () => {
            beforeEach(async () => {
                useSelectorSpy.mockReturnValue(config.selectedProviders);
                config.hasCompletedJob();
                config.hasSpecification();
                config.hasFundingConfigWithApproveBatchMode();
                config.hasPermissions();
                config.hasMockPublishService();
                config.hasProviderService();
                config.hasMockPublishedProviderService();

                await renderPage();
            });
            afterEach(() => jest.clearAllMocks());

            it('calls api to approve the batch', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                const button = screen.queryByRole("button", {name: /Confirm approval/}) as HTMLButtonElement;
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();

                userEvent.click(button);

                const {approveProvidersFundingService} = require('../../../services/publishService');
                await waitFor(() => {
                    expect(approveProvidersFundingService).toBeCalledTimes(1);
                });
            });

            it('displays back button instead of confirm button', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                const button = screen.queryByRole("button", {name: /Confirm approval/}) as HTMLButtonElement;
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();

                userEvent.click(button);

                const {approveProvidersFundingService} = require('../../../services/publishService');
                await waitFor(() => {
                    expect(approveProvidersFundingService).toBeCalledTimes(1);
                    expect(screen.queryByRole("link", {name: /Back/})).toBeInTheDocument();
                });
            });

            it('redirects user back to the funding page after the approval job is complete', async () => {
                await waitFor(() => expect(config.mockFundingSummaryForApprovingService).toHaveBeenCalled());
                const button = screen.queryByRole("button", {name: /Confirm approval/}) as HTMLButtonElement;
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();

                userEvent.click(button);

                const {approveProvidersFundingService} = require('../../../services/publishService');
                await waitFor(() => {
                    expect(approveProvidersFundingService).toBeCalledTimes(1);
                });

                expect(mockHistoryPush).toBeCalledWith(`/Approvals/SpecificationFundingApproval/${config.fundingStream.id}/${config.fundingPeriod.id}/${config.testSpec.id}`);
                // expect(historySpy.)
            });
        });

        describe("when no selected providers", () => {
            beforeEach(async () => {
                useSelectorSpy.mockReturnValue(config.noSelectedProviders);
                config.hasNoActiveJobsRunning();
                config.hasSpecification();
                config.hasFundingConfigWithApproveBatchMode();
                config.hasPermissions();
                config.hasMockPublishService();
                config.hasProviderService();
                config.hasMockPublishedProviderService();

                await renderPage();
            });
            afterEach(() => jest.clearAllMocks());

            it('does not call api to get funding summary', async () => {
                expect(config.mockFundingSummaryForApprovingService).not.toHaveBeenCalled();
            });

            it('does not call api to get search results', async () => {
                expect(config.mockSearchService).not.toHaveBeenCalled();
            });

            it('does not render job progress spinner', async () => {
                expect(screen.queryByText(/Checking for jobs running/)).not.toBeInTheDocument();
            });

            it('renders funding summary section', async () => {
                expect(screen.getByTestId("funding-summary-section"))
            });

            it('renders warning message', async () => {
                expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
            });

            it('does not render funding summary table', async () => {
                expect(screen.queryByRole("table", {name: "funding-summary-table"})).not.toBeInTheDocument();
            });

            it('renders approve button as disabled', async () => {
                const button = screen.queryByRole("button", {name: /Confirm approval/}) as HTMLButtonElement;
                expect(button).toBeInTheDocument();
                expect(button).toBeDisabled();
            });
        });
    });
});

function setupTestConfig() {
    // jest.mock("../../../components/AdminNav");

    const fundingStream: FundingStream = {
        id: "WIZ-123",
        name: "Wizard Training Scheme"
    };
    const fundingPeriod: FundingPeriod = {
        id: "FP123",
        name: "2019-20"
    };
    const testSpec: SpecificationSummary = {
        coreProviderVersionUpdates: undefined,
        name: "Wizard Training",
        approvalStatus: "",
        description: "",
        fundingPeriod: fundingPeriod,
        fundingStreams: [fundingStream],
        id: "ABC123",
        isSelectedForFunding: true,
        providerVersionId: "",
        dataDefinitionRelationshipIds: [],
        templateIds: {}
    };
    const specResult: SpecificationSummaryQueryResult = {
        clearSpecificationFromCache: () => Promise.resolve(),
        specification: testSpec,
        isLoadingSpecification: false,
        errorCheckingForSpecification: null,
        haveErrorCheckingForSpecification: false,
        isFetchingSpecification: false,
        isSpecificationFetched: true
    };
    const noJob: LatestSpecificationJobWithMonitoringResult = {
        hasJob: false,
        isCheckingForJob: false,
        latestJob: undefined,
        isFetched: true,
        isFetching: false,
        isMonitoring: true,
    };
    const activeJob: LatestSpecificationJobWithMonitoringResult = {
        hasJob: true,
        isCheckingForJob: false,
        latestJob: getJobDetailsFromJobResponse({
            jobId: "dfgwer",
            jobType: JobType.RefreshFundingJob,
            runningStatus: RunningStatus.InProgress,
            invokerUserDisplayName: "testUser",
            created: new Date(),
            lastUpdated: new Date("2020-01-01T10:30:00.0000000+00:00")
        }),
        isFetched: true,
        isFetching: false,
        isMonitoring: true
    };
    const completedJob: LatestSpecificationJobWithMonitoringResult = {
        hasJob: true,
        isCheckingForJob: false,
        latestJob: getJobDetailsFromJobResponse({
            jobId: "135235",
            jobType: JobType.ApproveBatchProviderFundingJob,
            runningStatus: RunningStatus.Completed,
            completionStatus: CompletionStatus.Succeeded,
            invokerUserDisplayName: "testUser",
            created: new Date(),
            lastUpdated: new Date("2020-01-01T10:30:00.0000000+00:00")
        }),
        isFetched: true,
        isFetching: false,
        isMonitoring: true
    };
    const mockFundingConfigWithApprovalAllMode: FundingConfigurationQueryResult = {
        fundingConfiguration: {
            approvalMode: ApprovalMode.All,
            providerSource: ProviderSource.CFS,
            defaultTemplateVersion: "1.1",
            fundingPeriodId: fundingPeriod.id,
            fundingStreamId: fundingStream.id,
            enableConverterDataMerge: false
        },
        isLoadingFundingConfiguration: false,
        isErrorLoadingFundingConfiguration: false,
        errorLoadingFundingConfiguration: "",
    };
    const mockFundingConfigWithApprovalBatchMode: FundingConfigurationQueryResult = {
        fundingConfiguration: {
            approvalMode: ApprovalMode.Batches,
            providerSource: ProviderSource.CFS,
            defaultTemplateVersion: "1.1",
            fundingPeriodId: fundingPeriod.id,
            fundingStreamId: fundingStream.id,
            enableConverterDataMerge: false
        },
        isLoadingFundingConfiguration: false,
        isErrorLoadingFundingConfiguration: false,
        errorLoadingFundingConfiguration: "",
    };
    const withoutPermissions: SpecificationPermissionsResult = {
        userId: "3456",
        isCheckingForPermissions: false,
        hasPermission: () => false,
        hasMissingPermissions: true,
        isPermissionsFetched: true,
        permissionsEnabled: [],
        permissionsDisabled: [Permission.CanApproveFunding, Permission.CanRefreshFunding, Permission.CanReleaseFunding],
        missingPermissions: [Permission.CanApproveFunding, Permission.CanRefreshFunding, Permission.CanReleaseFunding],
    };
    const withPermissions: SpecificationPermissionsResult = {
        userId: "3456",
        isCheckingForPermissions: false,
        hasPermission: () => true,
        hasMissingPermissions: false,
        isPermissionsFetched: true,
        permissionsEnabled: [Permission.CanApproveFunding, Permission.CanRefreshFunding, Permission.CanReleaseFunding],
        permissionsDisabled: [],
        missingPermissions: [],
    };

    const provider1: PublishedProviderResult = {
        errors: [],
        fundingPeriodId: fundingPeriod.id,
        fundingStatus: PublishStatus.Updated,
        fundingStreamId: fundingStream.id,
        fundingValue: 3456.43,
        hasErrors: false,
        localAuthority: "East London LA",
        providerName: "East London School",
        providerSubType: "What sup?",
        providerType: "whatever",
        publishedProviderVersionId: "aa123",
        specificationId: testSpec.id,
        ukprn: "23932035",
        upin: "43634",
        urn: "851305"
    };
    const provider2: PublishedProviderResult = {
        errors: [],
        fundingPeriodId: fundingPeriod.id,
        fundingStatus: PublishStatus.Updated,
        fundingStreamId: fundingStream.id,
        fundingValue: 10000,
        hasErrors: false,
        localAuthority: "West London",
        providerName: "West London School",
        providerSubType: "What sup?",
        providerType: "whatever",
        publishedProviderVersionId: "bb123",
        specificationId: testSpec.id,
        ukprn: "9641960",
        upin: "785220",
        urn: "82096"
    };

    const mockConfirmApprovalRoute: match<ConfirmFundingRouteProps> = {
        params: {
            specificationId: testSpec.id,
            fundingStreamId: fundingStream.id,
            fundingPeriodId: fundingPeriod.id,
            mode: FundingActionType.Approve
        },
        url: "",
        path: "",
        isExact: true,
    };
    const mockConfirmReleaseRoute: match<ConfirmFundingRouteProps> = {
        params: {
            specificationId: testSpec.id,
            fundingStreamId: fundingStream.id,
            fundingPeriodId: fundingPeriod.id,
            mode: FundingActionType.Release
        },
        url: "",
        path: "",
        isExact: true,
    };
    const noSelectedProviders: FundingSearchSelectionState = {
        selectedProviderIds: [],
        searchCriteria: undefined
    }
    const selectedProviders: FundingSearchSelectionState = {
        selectedProviderIds: [provider1.publishedProviderVersionId, provider1.publishedProviderVersionId],
        searchCriteria: undefined
    }
    const hasSpecification = () => jest.spyOn(specHook, 'useSpecificationSummary').mockImplementation(() => (specResult));
    const hasNoActiveJobsRunning = () => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (noJob));
    const hasActiveJobRunning = () => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (activeJob));
    const hasCompletedJob = () => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (completedJob));
    const hasFundingConfigWithApproveAllMode = () => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration').mockImplementation(() => (mockFundingConfigWithApprovalAllMode));
    const hasFundingConfigWithApproveBatchMode = () => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration').mockImplementation(() => (mockFundingConfigWithApprovalBatchMode));
    const hasPermissions = () => jest.spyOn(permissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
    const mockFundingSummary: PublishedProviderFundingCount = {
        count: 2,
        fundingStreamsFundings: [{totalFunding: 534.53, fundingStreamId: fundingStream.id}],
        localAuthorities: [],
        localAuthoritiesCount: 0,
        providerTypes: [],
        providerTypesCount: 2,
        totalFunding: 123456.99
    };
    const mockFundingSummaryForApprovingService = jest.fn(() => Promise.resolve({
        data: {mockFundingSummary},
        status: 200
    }));
    const mockFundingSummaryForReleasingService = jest.fn(() => Promise.resolve({
        data: {mockFundingSummary},
        status: 200
    }));
    const mockApproveJobCreatedResponse: JobCreatedResponse = {jobId: "135235"}
    const mockApproveSpecService = jest.fn(() => Promise.resolve({
        data: {mockApproveJobCreatedResponse},
        status: 200
    }));
    const mockBatchApproveProvidersService = jest.fn(() => Promise.resolve({
        data: {jobId: "135235"},
        status: 200
    }));
    const mockSearchResponse = createPublishedProviderSearchQueryResult(
        createPublishedProviderResult([provider1, provider2], true, true, defaultFacets), selectedProviders.selectedProviderIds);
    const mockSearchService = jest.fn(() => Promise.resolve({
        data: {mockSearchResponse},
        status: 200
    }));
    const hasMockPublishedProviderService = () => {
        jest.mock("../../../services/publishedProviderService", () => {
            const mockService = jest.requireActual("../../../services/publishedProviderService");

            return {
                ...mockService,
                searchForPublishedProviderResults: mockSearchService
            }
        })
    };
    const hasMockPublishService = () => {
        jest.mock("../../../services/publishService", () => {
            const mockService = jest.requireActual("../../../services/publishService");

            return {
                ...mockService,
                getFundingSummaryForApprovingService: mockFundingSummaryForApprovingService,
                getFundingSummaryForReleasingService: mockFundingSummaryForReleasingService,
                approveSpecificationFundingService: mockApproveSpecService,
                approveProvidersFundingService: mockBatchApproveProvidersService,
                generateCsvForApprovalAll: jest.fn(() => Promise.resolve({
                    data: {
                        url: "http://testing-link"
                    },
                    status: 200
                })),
                generateCsvForApprovalBatch: jest.fn(() => Promise.resolve({
                    data: {
                        url: "http://testing-link"
                    },
                    status: 200
                })),
                generateCsvForReleaseBatch: jest.fn(() => Promise.resolve({
                    data: {
                        url: "http://testing-link"
                    },
                    status: 200
                })),
                generateCsvForReleaseAll: jest.fn(() => Promise.resolve({
                    data: {
                        url: "http://testing-link"
                    },
                    status: 200
                })),
            }
        });
    };

    const hasProviderService = () => {
        jest.mock("../../../services/providerService", () => {
            const mockService = jest.requireActual("../../../services/providerService");
            return {
                ...mockService,
                getSpecificationCalculationResultsMetadata: jest.fn(() => Promise.resolve({
                    data: {
                        specificationId: "ABC123",
                        lastUpdated: new Date("2021-01-01T10:30:00.0000000+00:00")
                    },
                    status: 200
                }))
            }
        });
    };

    return {
        fundingStream,
        fundingPeriod,
        provider1,
        provider2,
        selectedProviders,
        withPermissions,
        withoutPermissions,
        testSpec,
        activeJob,
        noSelectedProviders,
        mockFundingSummaryForApprovingService,
        mockSearchService,
        mockConfirmApprovalRoute,
        hasMockPublishedProviderService,
        hasFundingConfigWithApproveAllMode,
        hasFundingConfigWithApproveBatchMode,
        hasSpecification,
        hasActiveJobRunning,
        hasCompletedJob,
        hasNoActiveJobsRunning,
        hasMockPublishService,
        hasProviderService,
        hasPermissions
    }
}
