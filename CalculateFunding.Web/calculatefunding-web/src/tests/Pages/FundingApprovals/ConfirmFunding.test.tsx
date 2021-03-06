﻿import {PublishStatus} from "../../../types/PublishStatusModel";
import React from 'react';
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {render, screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import * as redux from "react-redux";
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {QueryClient, QueryClientProvider} from "react-query";
import * as permissionsHook from "../../../hooks/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/useSpecificationPermissions";
import * as jobHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import {FundingConfigurationQueryResult} from "../../../hooks/useFundingConfiguration";
import * as providerIdsSearchHook from "../../../hooks/FundingApproval/usePublishedProviderIds";
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
import {createPublishedProviderIdsQueryResult} from "../../fakes/testFactories";
import {JobCreatedResponse} from "../../../types/JobCreatedResponse";
import {getJobDetailsFromJobResponse} from "../../../helpers/jobDetailsHelper";


const history = createMemoryHistory();
const location = createLocation("", "", "");
const store: Store<IStoreState> = createStore(rootReducer);

const renderConfirmApprovalPage = () => {
    const {ConfirmFunding} = require('../../../pages/FundingApprovals/ConfirmFunding');
    store.dispatch = jest.fn();
    return render(<MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
            <Provider store={store}>
                <ConfirmFunding location={location} history={history} match={mockConfirmApprovalRoute}/>
            </Provider>
        </QueryClientProvider>
    </MemoryRouter>);
};
const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const useDispatchSpy = jest.spyOn(redux, 'useDispatch');

const fundingStream: FundingStream = {
    name: "FS123",
    id: "Wizard Training Scheme"
};
const fundingPeriod: FundingPeriod = {
    id: "FP123",
    name: "2019-20"
};
const testSpec: SpecificationSummary = {
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
        lastUpdated: new Date()
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
        fundingStreamId: fundingStream.id
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
        fundingStreamId: fundingStream.id
    },
    isLoadingFundingConfiguration: false,
    isErrorLoadingFundingConfiguration: false,
    errorLoadingFundingConfiguration: "",
};
const fullPermissions: SpecificationPermissionsResult = {
    canApproveAllCalculations: false,
    canChooseFunding: false,
    canRefreshFunding: true,
    canApproveFunding: true,
    canReleaseFunding: true,
    isPermissionsFetched: true,
    hasMissingPermissions: false,
    isCheckingForPermissions: false,
    missingPermissions: [],
    canEditSpecification: false,
    canCreateSpecification: false,
    canMapDatasets: false,
    canApproveCalculation: false,
    canEditCalculation: false,
    canCreateAdditionalCalculation: false
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


describe("<ConfirmFunding />", () => {

    describe("<ConfirmFunding /> when job is active", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValueOnce(noSelectedProviders);
            hasActiveJobRunning();
            hasSpecification();
            hasFundingConfigWithApproveAllMode();
            hasFullPermissions();
            hasProviderIds([provider1.publishedProviderVersionId]);
            hasFundingApprovalSummary();

            renderConfirmApprovalPage();
        });
        afterEach(() => jest.clearAllMocks());

        it('renders job progress message', async () => {
            const alert = await screen.findByRole("alert", {name: /job-notification/});
            expect(within(alert).getByRole("alert", {name: /Monitoring job/})).toBeInTheDocument();
            expect(within(alert).getByText(`Job ${activeJob?.latestJob?.statusDescription}: ${activeJob?.latestJob?.jobDescription}`)).toBeInTheDocument();
        });

        it('does not render warning message', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService).toHaveBeenCalled());
            expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
        });

        it('renders funding summary section', async () => {
            expect(await screen.findByText("Providers selected")).toBeInTheDocument();
        });

        it('renders approve button as disabled', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService).toHaveBeenCalled());
            const button = screen.queryByRole("button", {name: /Confirm approval/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });
    });

    describe("<ConfirmFunding /> when confirming approval of all funding", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValueOnce(noSelectedProviders);
            hasNoActiveJobsRunning();
            hasSpecification();
            hasFundingConfigWithApproveAllMode();
            hasFullPermissions();
            hasProviderIds([provider1.publishedProviderVersionId, provider2.publishedProviderVersionId]);
            hasFundingApprovalSummary();

            renderConfirmApprovalPage();
        });
        afterEach(() => jest.clearAllMocks());

        it('calls api to get funding summary', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService)
                .toHaveBeenCalledWith(testSpec.id, [provider1.publishedProviderVersionId, provider2.publishedProviderVersionId]));
        });

        it('does not render job progress spinner', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService)
                .toHaveBeenCalledWith(testSpec.id, [provider1.publishedProviderVersionId, provider2.publishedProviderVersionId]));
            expect(screen.queryByText(/Checking for jobs running/)).not.toBeInTheDocument();
        });

        it('renders warning message', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService)
                .toHaveBeenCalledWith(testSpec.id, [provider1.publishedProviderVersionId, provider2.publishedProviderVersionId]));
            expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
        });

        it('renders funding summary section', async () => {
            const fundingSummaryTable = await screen.findByRole("table", {name: "funding-summary-table"});
            expect(fundingSummaryTable).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText("Providers selected")).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(fundingStream.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(fundingPeriod.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(testSpec.name)).toBeInTheDocument();
        });

        it('does not render change selection link', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService)
                .toHaveBeenCalledWith(testSpec.id, [provider1.publishedProviderVersionId, provider2.publishedProviderVersionId]));
            expect(screen.queryByRole("link", {name: /Change selection/})).not.toBeInTheDocument();
        });

        it('renders approve button as enabled', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService)
                .toHaveBeenCalledWith(testSpec.id, [provider1.publishedProviderVersionId, provider2.publishedProviderVersionId]));
            const button = screen.queryByRole("button", {name: /Confirm approval/});
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });
    });

    describe("<ConfirmFunding /> when confirming approval of batch funding", () => {
        beforeEach(() => {
            hasNoActiveJobsRunning();
            hasSpecification();
            hasFundingConfigWithApproveBatchMode();
            hasFullPermissions();
            hasProviderIds([provider1.publishedProviderVersionId, provider1.publishedProviderVersionId]);
            hasFundingApprovalSummary();
            useSelectorSpy.mockReturnValue(selectedProviders);

            renderConfirmApprovalPage();
        });
        afterEach(() => jest.clearAllMocks());

        it('calls api to get funding summary', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService)
                .toHaveBeenCalledWith(testSpec.id, [provider1.publishedProviderVersionId, provider1.publishedProviderVersionId]));
        });

        it('does not render job progress spinner', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService).toHaveBeenCalled());
            expect(screen.queryByText(/Checking for jobs running/)).not.toBeInTheDocument();
        });

        it('renders warning message', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService).toHaveBeenCalled());
            expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
        });

        it('renders funding summary section', async () => {
            const fundingSummaryTable = await screen.findByRole("table", {name: "funding-summary-table"});
            expect(fundingSummaryTable).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText("Providers selected")).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(fundingStream.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(fundingPeriod.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(testSpec.name)).toBeInTheDocument();
        });

        it('renders change selection link as enabled', async () => {
            const link = await screen.findByRole("link", {name: /Change selection/}) as HTMLAnchorElement;
            expect(link).toBeInTheDocument();
            expect(link.getAttribute("href")).toBe(`/Approvals/SpecificationFundingApproval/${fundingStream.id}/${fundingPeriod.id}/${testSpec.id}`);
            expect(link).toBeEnabled();
        });

        it('renders approve button as enabled', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService).toHaveBeenCalled());
            const button = screen.queryByRole("button", {name: /Confirm approval/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });
    });
});


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
const hasFundingConfigWithApproveAllMode = () => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration').mockImplementation(() => (mockFundingConfigWithApprovalAllMode));
const hasFundingConfigWithApproveBatchMode = () => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration').mockImplementation(() => (mockFundingConfigWithApprovalBatchMode));
const hasFullPermissions = () => jest.spyOn(permissionsHook, 'useSpecificationPermissions').mockImplementation(() => (fullPermissions));
const hasProviderIds = (ids: string[]) => jest.spyOn(providerIdsSearchHook, 'usePublishedProviderIds')
    .mockImplementation(() => (createPublishedProviderIdsQueryResult(ids)));
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
const mockApproveJobCreatedResponse: JobCreatedResponse = {jobId: "135235"}
const mockApproveSpecService = jest.fn(() => Promise.resolve({
    data: {mockApproveJobCreatedResponse},
    status: 200
}));
const hasFundingApprovalSummary = () => {
    jest.mock("../../../services/publishService", () => {
        const mockService = jest.requireActual("../../../services/publishService");

        return {
            ...mockService,
            getFundingSummaryForApprovingService: mockFundingSummaryForApprovingService,
            approveSpecificationFundingService: mockApproveSpecService,
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