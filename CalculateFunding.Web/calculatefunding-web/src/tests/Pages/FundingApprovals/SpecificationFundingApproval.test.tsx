import React from 'react';
import {match, MemoryRouter} from "react-router";
import {
    SpecificationFundingApproval,
    SpecificationFundingApprovalRoute
} from "../../../pages/FundingApprovals/SpecificationFundingApproval";
import {createLocation, createMemoryHistory} from "history";
import {render, screen, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {QueryCache, ReactQueryCacheProvider} from "react-query";
import * as permissionsHook from "../../../hooks/useSpecificationPermissions";
import * as jobHook from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import {FundingConfigurationQueryResult} from "../../../hooks/useFundingConfiguration";
import * as providerSearchHook from "../../../hooks/FundingApproval/usePublishedProviderSearch";
import * as providerIdsSearchHook from "../../../hooks/FundingApproval/usePublishedProviderIds";
import * as providerErrorsHook from "../../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import * as specHook from "../../../hooks/useSpecificationSummary";
import {SpecificationSummaryQueryResult} from "../../../hooks/useSpecificationSummary";
import {PublishedProviderResult} from "../../../types/PublishedProvider/PublishedProviderSearchResults";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {
    createPublishedProviderErrorSearchQueryResult,
    createPublishedProviderIdsQueryResult,
    createPublishedProviderResult,
    createPublishedProviderSearchQueryResult,
    defaultFacets
} from "../../fakes/testFactories";
import {JobType} from "../../../types/jobType";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<SpecificationFundingApprovalRoute> = {
    params: {
        specificationId: "ABC123",
        fundingStreamId: "FS123",
        fundingPeriodId: "FP123"
    },
    url: "",
    path: "",
    isExact: true,
};
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
    providerVersionId: ""
};
const specResult: SpecificationSummaryQueryResult = {
    specification: testSpec,
    isLoadingSpecification: false,
    errorCheckingForSpecification: "",
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: true
};
const noJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: false,
    isCheckingForJob: false,
    hasFailedJob: false,
    hasActiveJob: false,
    jobError: "",
    latestJob: undefined,
    hasJobError: false,
    isFetched: true,
    isFetching: false,
    isMonitoring: true,
    jobDisplayInfo: undefined
};
const activeJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    hasFailedJob: false,
    hasActiveJob: true,
    jobError: "",
    latestJob: {
        jobType: JobType.RefreshFundingJob,
        runningStatus: RunningStatus.InProgress,
        invokerUserDisplayName: "testUser",
        created: new Date(),
        lastUpdated: new Date()
    },
    hasJobError: false,
    isFetched: true,
    isFetching: false,
    isMonitoring: true,
    jobDisplayInfo: {
        statusDescription: "in progress",
        jobDescription: "test",
        isComplete: false,
        isFailed: false,
        isActive: true,
        isSuccessful: false
    },
};
const failedJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    hasFailedJob: true,
    hasActiveJob: false,
    jobError: "Failed",
    latestJob: {
        jobType: JobType.RefreshFundingJob,
        runningStatus: RunningStatus.Completed,
        completionStatus: CompletionStatus.Failed,
        invokerUserDisplayName: "testUser",
        created: new Date(),
        lastUpdated: new Date()
    },
    hasJobError: false,
    isFetched: true,
    isFetching: false,
    isMonitoring: true,
    jobDisplayInfo: {
        statusDescription: "in progress",
        jobDescription: "test",
        isComplete: false,
        isFailed: false,
        isActive: true,
        isSuccessful: false
    }
};
const fundingConfigResult: FundingConfigurationQueryResult = {
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
const provider1: PublishedProviderResult = {
    errors: [],
    fundingPeriodId: "period 1",
    fundingStatus: "Updated",
    fundingStreamId: "Stream 1",
    fundingValue: 3456.43,
    hasErrors: false,
    localAuthority: "East London LA",
    providerName: "East London School",
    providerSubType: "What sup?",
    providerType: "whatever",
    publishedProviderVersionId: "aa123",
    specificationId: "abc123",
    ukprn: "23932035",
    upin: "43634",
    urn: "851305"
};
const providerWithError1: PublishedProviderResult = {
    errors: ["Error: Something went wrong"],
    fundingPeriodId: "period 1",
    fundingStatus: "Updated",
    fundingStreamId: "Stream 1",
    fundingValue: 10000,
    hasErrors: true,
    localAuthority: "West London",
    providerName: "West London School",
    providerSubType: "What sup?",
    providerType: "whatever",
    publishedProviderVersionId: "bb123",
    specificationId: "abc123",
    ukprn: "9641960",
    upin: "785220",
    urn: "82096"
};
const fullPermissions = {
    canRefreshFunding: true,
    canApproveFunding: true,
    canReleaseFunding: true,
    isPermissionsFetched: true,
    hasMissingPermissions: false,
    isCheckingForPermissions: false,
    missingPermissions: [],
    canEditSpecification: false,
    canCreateSpecification: false,
    canMapDatasets: false
};

const store: Store<IStoreState> = createStore(rootReducer);

const renderPage = () => {
    const {SpecificationFundingApproval} = require('../../../pages/FundingApprovals/SpecificationFundingApproval');
    store.dispatch = jest.fn();
    return render(<MemoryRouter>
        <ReactQueryCacheProvider queryCache={new QueryCache()}>
            <Provider store={store}>
                <SpecificationFundingApproval location={location} history={history} match={matchMock}/>
            </Provider>
        </ReactQueryCacheProvider>
    </MemoryRouter>);
};

const hasSpecification = () => jest.spyOn(specHook, 'useSpecificationSummary').mockImplementation(() => (specResult));
const hasNoActiveJobsRunning = () => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (noJob));
const hasActiveJobRunning = () => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (activeJob));
const hasFailedJob = () => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (failedJob));
const hasFundingConfiguration = () => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration').mockImplementation(() => (fundingConfigResult));
const hasFullPermissions = () => jest.spyOn(permissionsHook, 'useSpecificationPermissions').mockImplementation(() => (fullPermissions));
const hasProvidersWithErrors = (providers: PublishedProviderResult[]) => jest.spyOn(providerErrorsHook, 'usePublishedProviderErrorSearch').mockImplementation(() => (
    createPublishedProviderErrorSearchQueryResult(createPublishedProviderResult(providers))));
const hasProviderIds = (ids: string[]) => jest.spyOn(providerIdsSearchHook, 'usePublishedProviderIds').mockImplementation(() => (
    createPublishedProviderIdsQueryResult(ids)));
const hasSearchResults = (providers: PublishedProviderResult[]) => jest.spyOn(providerSearchHook, 'usePublishedProviderSearch')
    .mockImplementation(() => (
        createPublishedProviderSearchQueryResult(
            createPublishedProviderResult(providers, true, true, defaultFacets))));


describe("<SpecificationFundingApproval /> when page initially renders before loading specification", () => {
    it('renders Specification loading', async () => {
        hasNoActiveJobsRunning();
        renderPage();
        expect(await screen.getByText("Loading specification...")).toBeInTheDocument();
    });
});

describe("<SpecificationFundingApproval /> when job is active", () => {
    beforeEach(() => {
        hasActiveJobRunning();
        hasSpecification();
        hasFundingConfiguration();
        hasFullPermissions();
        hasProvidersWithErrors([]);
        hasProviderIds([provider1.publishedProviderVersionId]);
        hasSearchResults([provider1]);

        renderPage();
    });

    it('renders Specification details', async () => {
        expect(screen.getByTestId("specName")).toBeInTheDocument();
    });

    it('renders job progress spinner', async () => {
        expect(screen.getByTestId("loader")).toBeInTheDocument();
        expect(screen.getByText(`Job ${activeJob.jobDisplayInfo?.statusDescription}: ${activeJob.jobDisplayInfo?.jobDescription}`)).toBeInTheDocument();
    });

    it('does not render filters', async () => {
        expect(screen.queryByRole("radio", {name: "Provider name"})).not.toBeInTheDocument();
    });

    it('does not render results', async () => {
        expect(screen.queryByTestId("published-provider-results")).not.toBeInTheDocument();
    });

    it('does not render refresh button', async () => {
        expect(screen.queryByRole("button", {name: /Refresh funding/})).not.toBeInTheDocument();
    });
});

describe("<SpecificationFundingApproval /> when job has failed", () => {
    beforeEach(() => {
        hasFailedJob();
        hasSpecification();
        hasFundingConfiguration();
        hasFullPermissions();
        hasProvidersWithErrors([]);
        hasProviderIds([provider1.publishedProviderVersionId]);
        hasSearchResults([provider1]);

        renderPage();
    });

    it('renders Specification details', async () => {
        expect(screen.getByTestId("specName")).toBeInTheDocument();
    });

    it('does not render loading spinner', async () => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it('renders job error', async () => {
        expect(screen.getByTestId("error-summary")).toBeInTheDocument();
        expect(screen.getByText(component => component.startsWith(
            `Job ${failedJob.jobDisplayInfo?.statusDescription}: ${failedJob.jobDisplayInfo?.jobDescription}`))).toBeInTheDocument();
    });

    it('renders filters', async () => {
        expect(screen.getByRole("radio", {name: "Provider name"})).toBeInTheDocument();
    });

    it('renders results', async () => {
        expect(screen.getByTestId("published-provider-results")).toBeInTheDocument();
    });

    it('renders refresh button', async () => {
        expect(screen.getByRole("button", {name: /Refresh funding/})).toBeInTheDocument();
    });
});

describe("<SpecificationFundingApproval /> when loading specification, no active jobs", () => {
    beforeEach(() => {
        hasNoActiveJobsRunning();
        hasSpecification();
        renderPage();
    });

    it('renders Specification details', async () => {
        expect(screen.getByTestId("specName")).toBeInTheDocument();
        expect(screen.getByTestId("specName")).toHaveTextContent(testSpec.name);
        expect(screen.getByTestId("fundingPeriodName")).toBeInTheDocument();
        expect(screen.getByTestId("fundingPeriodName")).toHaveTextContent(testSpec.fundingPeriod.name);
        expect(screen.getByTestId("fundingStreamName")).toBeInTheDocument();
        expect(screen.getByTestId("fundingStreamName")).toHaveTextContent(testSpec.fundingStreams[0].name);
    });
});

describe("<SpecificationFundingApproval /> when results with facets", () => {
    beforeEach(() => {
        hasNoActiveJobsRunning();
        hasSearchResults([provider1]);
        renderPage();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders filters', async () => {
        expect(screen.getByRole("radio", {name: "Provider name"})).toBeInTheDocument();
        expect(screen.getByRole("radio", {name: "UKPRN"})).toBeInTheDocument();
        expect(screen.getByRole("radio", {name: "UPIN"})).toBeInTheDocument();
        expect(screen.getByRole("radio", {name: "URN"})).toBeInTheDocument();
        expect(screen.getByRole("checkbox", {name: "With errors"})).toBeInTheDocument();
        expect(screen.getByRole("checkbox", {name: "Without errors"})).toBeInTheDocument();
        expect(screen.getByRole("checkbox", {name: "East London"})).toBeInTheDocument();
    });
});

describe("<SpecificationFundingApproval /> when results with no errors", () => {
    beforeEach(() => {
        hasSpecification();
        hasNoActiveJobsRunning();
        hasFundingConfiguration();
        hasFullPermissions();
        hasProvidersWithErrors([]);
        hasProviderIds([provider1.publishedProviderVersionId]);
        hasSearchResults([provider1]);

        renderPage();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders provider results section', async () => {
        expect(screen.getByTestId("published-provider-results")).toBeInTheDocument();
    });

    it('renders refresh button', async () => {
        expect(screen.getByRole("button", {name: /Refresh funding/})).toBeInTheDocument();
    });

    it('renders approve button', async () => {
        expect(screen.getByRole("button", {name: /Approve funding/})).toBeInTheDocument();
    });

    it('renders release button', async () => {
        expect(screen.getByRole("button", {name: /Release funding/})).toBeInTheDocument();
    });

    it('renders provider name', async () => {
        expect(await screen.findByText(provider1.providerName)).toBeInTheDocument();
    });

    it('renders provider status', async () => {
        expect(await screen.findByText(provider1.fundingStatus)).toBeInTheDocument();
    });
});


describe("<SpecificationFundingApproval /> when results with errors", () => {
    beforeEach(() => {
        hasSpecification();
        hasNoActiveJobsRunning();
        hasFundingConfiguration();
        hasFullPermissions();
        hasProvidersWithErrors([providerWithError1]);
        hasProviderIds([providerWithError1.publishedProviderVersionId]);
        hasSearchResults([providerWithError1]);

        renderPage();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders error summary heading', async () => {
        expect(await screen.findByText("There is a problem")).toBeInTheDocument();
    });

    it('renders error messages', async () => {
        const alerts = await screen.findAllByRole("alert");
        alerts.some(alert => within(alert).getByText(providerWithError1.errors[0]));
    });
});