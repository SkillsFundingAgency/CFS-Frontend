import React from 'react';
import {match, MemoryRouter} from "react-router";
import {
    SpecificationFundingApproval, SpecificationFundingApprovalRouteProps,
} from "../../../pages/FundingApprovals/SpecificationFundingApproval";
import {createLocation, createMemoryHistory} from "history";
import {act, render, screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {QueryCache, ReactQueryCacheProvider} from "react-query";
import * as publishService from "../../../services/publishService"
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
import {SpecificationPermissionsResult} from "../../../hooks/useSpecificationPermissions";
import * as redux from "react-redux";
import {FundingSearchSelectionState} from "../../../states/FundingSearchSelectionState";
import {buildInitialPublishedProviderSearchRequest} from "../../../types/publishedProviderSearchRequest";
import {PublishStatus} from "../../../types/PublishStatusModel";
import userEvent from "@testing-library/user-event";
import {ValidationErrors} from "../../../types/ErrorMessage";
import {createMockAxiosError} from "../../fakes/fakeAxios";
import {getJobDetailsFromJobSummary} from "../../../helpers/jobDetailsHelper";

// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

const history = createMemoryHistory();
const location = createLocation("", "", "");
const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const store: Store<IStoreState> = createStore(rootReducer);
jest.mock("axios");

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
const hasSuccessfulCompletedJob = () => jest.spyOn(jobHook, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (successfulCompletedJob));
const hasFundingConfiguration = () => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration').mockImplementation(() => (fundingConfigResult));
const hasFullPermissions = () => jest.spyOn(permissionsHook, 'useSpecificationPermissions').mockImplementation(() => (fullPermissions));
const hasProvidersWithErrors = (errors: string[]) => jest.spyOn(providerErrorsHook, 'usePublishedProviderErrorSearch').mockImplementation(() => (
    createPublishedProviderErrorSearchQueryResult(errors)));
const hasProviderIds = (ids: string[]) => jest.spyOn(providerIdsSearchHook, 'usePublishedProviderIds').mockImplementation(() => (
    createPublishedProviderIdsQueryResult(ids)));
const hasSearchResults = (providers: PublishedProviderResult[]) => jest.spyOn(providerSearchHook, 'usePublishedProviderSearch')
    .mockImplementation(() => (
        createPublishedProviderSearchQueryResult(
            createPublishedProviderResult(providers, true, true, defaultFacets))));


describe("<SpecificationFundingApproval />", () => {
    afterEach(() => jest.clearAllMocks());

    describe("when page initially renders before loading specification", () => {
        it('renders Specification loading', async () => {
            useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
            hasNoActiveJobsRunning();
            renderPage();
            expect(await screen.getByText("Loading specification...")).toBeInTheDocument();
        });
    });

    describe("when job is active", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
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
            expect(await screen.findByText(`Job ${activeJob?.latestJob?.statusDescription}: ${activeJob?.latestJob?.jobDescription}`)).toBeInTheDocument();
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

    describe("when job has failed", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
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
            expect(await screen.findByText(component => component.startsWith(
                `Job ${failedJob?.latestJob?.statusDescription}: ${failedJob?.latestJob?.jobDescription}`))).toBeInTheDocument();
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

    describe("when job has completed successfully", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
            hasSuccessfulCompletedJob();
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

        it('does not render any errors', async () => {
            expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();
        });

        it('renders job completed successfully', async () => {
            expect(screen.getByText(component => component.startsWith(
                `Job ${successfulCompletedJob?.latestJob?.statusDescription}: ${successfulCompletedJob?.latestJob?.jobDescription}`)))
                .toBeInTheDocument();
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

    describe("when loading specification, no active jobs", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
            hasNoActiveJobsRunning();
            hasSpecification();
            renderPage();
        });

        it('renders Specification details', async () => {
            expect(screen.getByTestId("specName")).toBeInTheDocument();
            expect(screen.getByTestId("specName")).toHaveTextContent(testSpec.name);
            expect(screen.getByTestId("fundingDetails")).toBeInTheDocument();
            expect(screen.getByTestId("fundingDetails")).toHaveTextContent(`${testSpec.fundingStreams[0].name} for ${testSpec.fundingPeriod.name}`);
        });
    });

    describe("when results with facets", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
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

    describe("when results with no errors", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
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

        it('renders refresh button as enabled', async () => {
            const button = screen.getByRole("button", {name: /Refresh funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it('renders approve button as enabled', async () => {
            const button = screen.getByRole("button", {name: /Approve funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it('renders release button as enabled', async () => {
            const button = screen.getByRole("button", {name: /Release funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it('renders provider name', async () => {
            expect(await screen.findByText(provider1.providerName)).toBeInTheDocument();
        });

        it('renders provider status', async () => {
            expect(await screen.findByText(provider1.fundingStatus)).toBeInTheDocument();
        });
    });

    describe("when results with errors", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
            hasSpecification();
            hasNoActiveJobsRunning();
            hasFundingConfiguration();
            hasFullPermissions();
            hasProvidersWithErrors(["Error: missing something"]);
            hasProviderIds([providerWithError1.publishedProviderVersionId]);
            hasSearchResults([providerWithError1]);

            renderPage();
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('renders error summary', async () => {
            expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
            expect(await screen.findByText("There is a problem")).toBeInTheDocument();
        });

        it('renders error message', async () => {
            const alerts = await screen.findAllByRole("alert");
            alerts.some(alert => within(alert).getByText(/Error: missing something/));
        });
    });


    describe("when user confirms refresh", () => {

        describe("and there is a validation error", () => {
            const mockValidationErrors: ValidationErrors = {
                "error-message": ["stack overflow", "divide by zero"],
                "": ["hello error"]
            }
            const mockValidationError = jest.fn().mockRejectedValue(createMockAxiosError(mockValidationErrors, 400));

            beforeEach(async () => {
                useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
                hasSpecification();
                hasNoActiveJobsRunning();
                hasFundingConfiguration();
                hasFullPermissions();
                hasProvidersWithErrors([]);
                hasProviderIds([provider1.publishedProviderVersionId]);
                hasSearchResults([provider1]);
                jest.spyOn(publishService, 'preValidateForRefreshFundingService')
                    .mockImplementation(mockValidationError);

                renderPage();
            });
            afterEach(() => {
                jest.clearAllMocks();
            });

            it('renders error summary', async () => {
                const button = screen.getByRole("button", {name: /Refresh funding/});

                act(() => {
                    userEvent.click(button);
                });

                await waitFor(() => expect(mockValidationError).toHaveBeenCalledWith(testSpec.id));

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
                useSelectorSpy.mockReturnValue(fundingSearchSelectionState);
                hasSpecification();
                hasNoActiveJobsRunning();
                hasFundingConfiguration();
                hasFullPermissions();
                hasProvidersWithErrors([]);
                hasProviderIds([provider1.publishedProviderVersionId]);
                hasSearchResults([provider1]);
                jest.spyOn(publishService, 'preValidateForRefreshFundingService')
                    .mockImplementation(mockNoValidationError);
                jest.spyOn(publishService, 'refreshSpecificationFundingService')
                    .mockImplementation(mockJobCreated);

                renderPage();
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

                await waitFor(() => expect(mockNoValidationError).toHaveBeenCalledWith(testSpec.id));

                expect(await screen.findByTestId("modal-confirmation-placeholder")).toBeInTheDocument();
                expect(screen.getByRole("heading", {name: /Confirm funding refresh/})).toBeInTheDocument();
                expect(screen.getByRole("button", {name: /Cancel/})).toBeInTheDocument();
                const confirmButton = screen.getByRole("button", {name: /Confirm/});
                expect(confirmButton).toBeInTheDocument();

                act(() => userEvent.click(confirmButton));

                await waitFor(() => expect(mockJobCreated).toHaveBeenCalledWith(testSpec.id));
            });
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
    isMonitoring: true
};
const activeJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobSummary({
        jobId: "rt56w",
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
const failedJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobSummary({
        jobId: "sd64",
        jobType: JobType.RefreshFundingJob,
        runningStatus: RunningStatus.Completed,
        completionStatus: CompletionStatus.Failed,
        invokerUserDisplayName: "testUser",
        created: new Date(),
        lastUpdated: new Date()
    }),
    isFetched: true,
    isFetching: false,
    isMonitoring: true
};
const successfulCompletedJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: true,
    isCheckingForJob: false,
    latestJob: getJobDetailsFromJobSummary({
        jobId: "rfgd",
        jobType: JobType.RefreshFundingJob,
        runningStatus: RunningStatus.Completed,
        completionStatus: CompletionStatus.Succeeded,
        invokerUserDisplayName: "testUser",
        created: new Date(),
        lastUpdated: new Date()
    }),
    isFetched: true,
    isFetching: false,
    isMonitoring: true
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
const providerWithError1: PublishedProviderResult = {
    errors: ["Error: Something went wrong"],
    fundingPeriodId: fundingPeriod.id,
    fundingStatus: PublishStatus.Updated,
    fundingStreamId: fundingStream.id,
    fundingValue: 10000,
    hasErrors: true,
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

const fundingSearchSelectionState: FundingSearchSelectionState = {
    providerVersionIds: [],
    searchCriteria: buildInitialPublishedProviderSearchRequest(fundingStream.id, fundingPeriod.id, testSpec.id)
}

const matchMock: match<SpecificationFundingApprovalRouteProps> = {
    params: {
        specificationId: testSpec.id,
        fundingStreamId: fundingStream.id,
        fundingPeriodId: fundingPeriod.id
    },
    url: "",
    path: "",
    isExact: true,
};