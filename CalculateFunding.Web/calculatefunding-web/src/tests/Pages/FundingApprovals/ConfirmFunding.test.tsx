import {PublishStatus} from "../../../types/PublishStatusModel";
import React from 'react';
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {act, render, screen, waitFor, waitForElementToBeRemoved, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import * as redux from "react-redux";
import {Provider} from "react-redux";
import {createStore, Reducer, Store} from "redux";
import {Actions, IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {QueryCache, ReactQueryCacheProvider} from "react-query";
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
import {buildInitialPublishedProviderSearchRequest} from "../../../types/publishedProviderSearchRequest";
import {ConfirmFundingRouteProps} from "../../../pages/FundingApprovals/ConfirmFunding";
import {FundingActionType, PublishedProviderFundingCount} from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import {createPublishedProviderIdsQueryResult} from "../../fakes/testFactories";
import {getJobDetailsFromJobSummary} from "../../../helpers/jobDetailsHelper";
import {JobCreatedResponse} from "../../../types/JobCreatedResponse";

const history = createMemoryHistory();
const location = createLocation("", "", "");
const store: Store<IStoreState> = createStore(rootReducer);

const renderConfirmApprovalPage = () => {
    const {ConfirmFunding} = require('../../../pages/FundingApprovals/ConfirmFunding');
    store.dispatch = jest.fn();
    return render(<MemoryRouter>
        <ReactQueryCacheProvider queryCache={new QueryCache()}>
            <Provider store={store}>
                <ConfirmFunding location={location} history={history} match={mockConfirmApprovalRoute}/>
            </Provider>
        </ReactQueryCacheProvider>
    </MemoryRouter>);
};
const useSelectorSpy = jest.spyOn(redux, 'useSelector');

describe("<ConfirmFunding />", () => {

    describe("<ConfirmFunding /> when job is active", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValueOnce(stateWithNoProvidersSelected);
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
            expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
        });

        it('renders funding summary section', async () => {
            expect(await screen.findByText("Providers selected")).toBeInTheDocument();
        });

        it('renders approve button as disabled', async () => {
            const button = screen.queryByRole("button", {name: /Confirm approval/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });
    });

    describe("<ConfirmFunding /> when confirming approval of all funding", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValueOnce(stateWithNoProvidersSelected);
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
            await waitForElementToBeRemoved(screen.getByTestId("loader-inline"));
        });

        it('renders warning message', async () => {
            expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
        });

        it('renders funding summary section', async () => {
            await waitForElementToBeRemoved(screen.getByTestId("loader-inline"));
            const fundingSummaryTable = await screen.findByRole("table", {name: "funding-summary-table"});
            expect(fundingSummaryTable).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText("Providers selected")).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(fundingStream.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(fundingPeriod.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(testSpec.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText("2")).toBeInTheDocument();
        });

        it('renders approve button as enabled', async () => {
            const button = screen.queryByRole("button", {name: /Confirm approval/});
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });
    });

    describe("<ConfirmFunding /> when confirming approval of batch funding", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValueOnce(stateWithProvidersSelected(["p1", "p2"]));
            hasNoActiveJobsRunning();
            hasSpecification();
            hasFundingConfigWithApproveBatchMode();
            hasFullPermissions();
            hasProviderIds(["p1", "p2"]);
            hasFundingApprovalSummary();

            renderConfirmApprovalPage();
        });
        afterEach(() => jest.clearAllMocks());

        it('calls api to get funding summary', async () => {
            await waitFor(() => expect(mockFundingSummaryForApprovingService)
                .toHaveBeenCalledWith(testSpec.id, ["p1", "p2"]));
        });

        it('does not render job progress spinner', async () => {
            await waitForElementToBeRemoved(screen.getByTestId("loader-inline"));
        });

        it('renders warning message', async () => {
            expect(screen.getByText("Approved funding values can change when data or calculations are altered. If the funding values change, their status will become ‘updated’ and they will need to be approved again.")).toBeInTheDocument();
        });

        it('renders funding summary section', async () => {
            await waitForElementToBeRemoved(screen.getByTestId("loader-inline"));
            const fundingSummaryTable = await screen.findByRole("table", {name: "funding-summary-table"});
            expect(fundingSummaryTable).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText("Providers selected")).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(fundingStream.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(fundingPeriod.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText(testSpec.name)).toBeInTheDocument();
            expect(within(fundingSummaryTable).getByText("2")).toBeInTheDocument();
        });

        it('renders approve button as enabled', async () => {
            const button = screen.queryByRole("button", {name: /Confirm approval/}) as HTMLButtonElement;
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });
    });
});


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
    latestJob: getJobDetailsFromJobSummary({
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

const stateWithNoProvidersSelected: FundingSearchSelectionState = {
    providerVersionIds: [],
    searchCriteria: buildInitialPublishedProviderSearchRequest(fundingStream.id, fundingPeriod.id, testSpec.id)
}
const stateWithProvidersSelected = (ids: string[]): FundingSearchSelectionState => {
    return {
        providerVersionIds: [provider1.publishedProviderVersionId, provider2.publishedProviderVersionId],
        searchCriteria: buildInitialPublishedProviderSearchRequest(fundingStream.id, fundingPeriod.id, testSpec.id)
    }
}

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
        }
    });
};