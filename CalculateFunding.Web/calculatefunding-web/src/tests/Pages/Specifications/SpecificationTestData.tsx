import React from 'react';
import {createStore, Store} from "redux";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import {CoreProviderSummary, ProviderSnapshot, ProviderSource} from "../../../types/CoreProviderSummary";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {PublishedFundingTemplate} from "../../../types/TemplateBuilderDefinitions";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {ProviderDataTrackingMode} from "../../../types/Specifications/ProviderDataTrackingMode";
import * as monitorHook from "../../../hooks/Jobs/useJobMonitor";
import * as useLatestSpecificationJobWithMonitoringHook
    from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobDetails} from "../../../types/jobDetails";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";
import {buildPermissions} from "../../fakes/testFactories";
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import {Permission} from "../../../types/Permission";
import {UpdateCoreProviderVersion} from "../../../types/Provider/UpdateCoreProviderVersion";
import {Provider} from "react-redux";
import {JobType} from "../../../types/jobType";
import {FundingStreamPermissions} from "../../../types/FundingStreamPermissions";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import * as redux from "react-redux";
import {JobMonitoringFilter} from "../../../types/Jobs/JobMonitoringFilter";

const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

export function SpecificationTestData() {
    const useSelectorSpy = jest.spyOn(redux, 'useSelector');
    jest.mock("../../../components/AdminNav");

    const renderCreateSpecificationPage = async () => {
        const {CreateSpecification} = require('../../../pages/Specifications/CreateSpecification');
        const component = render(<MemoryRouter initialEntries={['/Specifications/CreateSpecification']}>
            <QueryClientProviderTestWrapper>
                <Provider store={store}>
                    <Switch>
                        <Route path="/Specifications/CreateSpecification" component={CreateSpecification}/>
                    </Switch>
                </Provider>
            </QueryClientProviderTestWrapper>
        </MemoryRouter>);

        await waitFor(() => {
            expect(screen.queryByText(/Loading.../)).not.toBeInTheDocument();
        });
        return component;
    };

    const renderEditSpecificationPage = async (mockSpecId: string) => {
        const {EditSpecification} = require('../../../pages/Specifications/EditSpecification');
        return render(<MemoryRouter initialEntries={[`/Specifications/EditSpecification/${mockSpecId}`]}>
            <QueryClientProviderTestWrapper>
                <Provider store={store}>
                    <Switch>
                        <Route path="/Specifications/EditSpecification/:specificationId" component={EditSpecification}/>
                    </Switch>
                </Provider>
            </QueryClientProviderTestWrapper>
        </MemoryRouter>);
    };

    const renderLoadedEditSpecificationPage = async (mockSpecId: string) => {
        const {EditSpecification} = require('../../../pages/Specifications/EditSpecification');
        const component = render(<MemoryRouter initialEntries={[`/Specifications/EditSpecification/${mockSpecId}`]}>
            <QueryClientProviderTestWrapper>
                <Provider store={store}>
                    <Switch>
                        <Route path="/Specifications/EditSpecification/:specificationId" component={EditSpecification}/>
                    </Switch>
                </Provider>
            </QueryClientProviderTestWrapper>
        </MemoryRouter>);

        await waitFor(() => {
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
        });
        return component;
    };

    const jobMonitorResult: JobDetails = {
        failures: [],
        isComplete: false,
        isFailed: false,
        jobDescription: "Creating Specification",
        jobId: "5re34ygw534e",
        statusDescription: "Complete",
        completionStatus: CompletionStatus.Succeeded,
        outcome: "",
        isSuccessful: true,
        isActive: false,
        runningStatus: RunningStatus.Completing
    };

    const mockJobMonitorHookWithSuccessfulJob = () => jest.spyOn(monitorHook, 'useJobMonitor')
        .mockImplementation(() => ({newJob: jobMonitorResult, isMonitoring: true}));

    const mockJobMonitorHookWithNoJob = () => jest.spyOn(monitorHook, 'useJobMonitor')
        .mockImplementation(() => ({newJob: undefined, isMonitoring: false}));

    const mockLatestSpecJobMonitorHookWithNoJob = () =>
        jest.spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring')
            .mockImplementation(() => ({
                hasJob: false,
                latestJob: undefined,
                isMonitoring: false,
                isFetching: true,
                isFetched: true,
                isCheckingForJob: true
            }));

    const mockLatestSpecJobMonitorHookWithARunningJob = () =>
        jest.spyOn(useLatestSpecificationJobWithMonitoringHook, 'useLatestSpecificationJobWithMonitoring')
            .mockImplementation(() => ({
                hasJob: true,
                latestJob: {
                    jobId: "aValidJobId",
                    statusDescription: "",
                    jobDescription: "",
                    runningStatus: RunningStatus.InProgress,
                    failures: [],
                    isSuccessful: false,
                    isFailed: false,
                    isActive: false,
                    isComplete: false,
                    completionStatus: CompletionStatus.Succeeded,
                    outcome: "ValidationFailed"
                },
                isMonitoring: false,
                isFetching: true,
                isFetched: true,
                isCheckingForJob: true
            }));

    const mockFundingStream: FundingStream = {
        id: "stream-547",
        name: "Test Stream 547"
    };
    const mockFundingPeriod: FundingPeriod = {
        id: "period-433",
        name: "Test Period 433"
    };
    const mockTemplate1: PublishedFundingTemplate = {
        authorId: "53",
        authorName: "yukl yrtj",
        publishDate: new Date(),
        publishNote: "another publish note",
        schemaVersion: "1.1",
        templateVersion: "3.2"
    };
    const mockTemplate2: PublishedFundingTemplate = {
        authorId: "43",
        authorName: "asdf asdf",
        publishDate: new Date(),
        publishNote: "blah blah publish note",
        schemaVersion: "1.4",
        templateVersion: "9.9"
    };
    const mockGetFundingStreamsCall = jest.fn(() => Promise.resolve({
        data:
            [{
                id: mockFundingStream.id,
                name: mockFundingStream.name
            }]
    }));
    const mockGetPublishedTemplatesByStreamAndPeriodCall = jest.fn(() => Promise.resolve({
        data: [mockTemplate1, mockTemplate2]
    }))
    const mockGetFundingConfigurationCall = (mockProviderSource: ProviderSource, mockApprovalMode: ApprovalMode, mockUpdateCoreProviderVersion: UpdateCoreProviderVersion) =>
        jest.fn(() => Promise.resolve({
            data:
                {
                    fundingStreamId: mockFundingStream.id,
                    fundingPeriodId: mockFundingPeriod.id,
                    approvalMode: mockApprovalMode,
                    providerSource: mockProviderSource,
                    defaultTemplateVersion: mockTemplate2.templateVersion,
                    updateCoreProviderVersion: mockUpdateCoreProviderVersion
                }
        }))
    const mockPolicyService = (mockProviderSource: ProviderSource, mockApprovalMode: ApprovalMode, mockUpdateCoreProviderVersion: UpdateCoreProviderVersion) => {
        jest.mock("../../../services/policyService", () => {
            const service = jest.requireActual("../../../services/policyService");

            return {
                ...service,
                getFundingStreamsService: mockGetFundingStreamsCall,
                getPublishedTemplatesByStreamAndPeriod: mockGetPublishedTemplatesByStreamAndPeriodCall,
                getFundingConfiguration: mockGetFundingConfigurationCall(mockProviderSource, mockApprovalMode, mockUpdateCoreProviderVersion)
            }
        });
    }

    const mockCoreProvider1: CoreProviderSummary = {
        providerVersionId: "provider-version-4162",
        versionType: "",
        name: "Provider 4162",
        description: "",
        version: 11,
        targetDate: new Date(),
        fundingStream: mockFundingStream.id,
        created: new Date()
    };
    const mockCoreProvider2: CoreProviderSummary = {
        providerVersionId: "provider-version-5439",
        versionType: "",
        name: "Provider 5439",
        description: "",
        version: 4,
        targetDate: new Date(),
        fundingStream: mockFundingStream.id,
        created: new Date()
    };
    const mockProviderSnapshot1: ProviderSnapshot = {
        providerSnapshotId: 2354,
        name: "Provider Snapshot Name 2354",
        description: "Provider Snapshot Description 2354",
        version: 14,
        targetDate: new Date(),
        created: new Date(),
        fundingStreamCode: mockFundingStream.id,
        fundingStreamName: mockFundingStream.name
    };
    const mockProviderSnapshot2: ProviderSnapshot = {
        providerSnapshotId: 423623,
        name: "Provider Snapshot Name 423623",
        description: "Provider Snapshot Description 423623",
        version: 51,
        targetDate: new Date(),
        created: new Date(),
        fundingStreamCode: mockFundingStream.id,
        fundingStreamName: mockFundingStream.name
    };
    const mockCfsSpec: SpecificationSummary = {
        name: "Wizard Training",
        approvalStatus: "",
        description: "Lorem ipsum lalala",
        fundingPeriod: mockFundingPeriod,
        fundingStreams: [mockFundingStream],
        id: "CFS457457",
        isSelectedForFunding: true,
        providerVersionId: mockCoreProvider2.providerVersionId,
        dataDefinitionRelationshipIds: [],
        templateIds: {"stream-547": mockTemplate2.templateVersion},
        coreProviderVersionUpdates: ProviderDataTrackingMode.Manual
    };
    const mockFdzSpecWithTrackingLatest: SpecificationSummary = {
        name: "Wizard Training With Tracking",
        approvalStatus: "",
        description: "Lorem ipsum lalala",
        fundingPeriod: mockFundingPeriod,
        fundingStreams: [mockFundingStream],
        id: "FDZ4683",
        isSelectedForFunding: true,
        providerSnapshotId: undefined,
        dataDefinitionRelationshipIds: [],
        templateIds: {"stream-547": mockTemplate2.templateVersion},
        coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest
    };
    const mockFdzSpecWithoutTracking: SpecificationSummary = {
        name: "Wizard Training Without Tracking",
        approvalStatus: "",
        description: "Lorem ipsum blablabla",
        fundingPeriod: mockFundingPeriod,
        fundingStreams: [mockFundingStream],
        id: "FDZ9345",
        isSelectedForFunding: true,
        providerSnapshotId: mockProviderSnapshot2.providerSnapshotId,
        dataDefinitionRelationshipIds: [],
        templateIds: {"stream-547": mockTemplate2.templateVersion},
        coreProviderVersionUpdates: ProviderDataTrackingMode.Manual
    };

    const mockSpecificationServiceWithDuplicateNameResponse = () => {
        jest.mock("../../../services/specificationService", () => {
            const service = jest.requireActual("../../../services/specificationService");
            return {
                ...service,
                getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                    data: mockCfsSpec
                })),
                getFundingPeriodsByFundingStreamIdService: jest.fn(() => Promise.resolve({
                    data: [mockFundingPeriod]
                })),
                createSpecificationService: jest.fn(() => Promise.reject({
                    status: 400,
                    response: {data: {Name: 'unique name error'}}
                }))
            }
        });
    }

    const mockSpecificationService = (mockSpec?: SpecificationSummary) => {
        jest.mock("../../../services/specificationService", () => {
            const service = jest.requireActual("../../../services/specificationService");
            return {
                ...service,
                getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                    data: mockSpec
                })),
                getFundingPeriodsByFundingStreamIdService: jest.fn(() => Promise.resolve({
                    data: [mockFundingPeriod]
                })),
                updateSpecificationService: jest.fn(() => Promise.resolve({status: 200})),
                createSpecificationService: jest.fn(() => Promise.resolve({
                    data:
                        {
                            name: "",
                            id: "35486792350689",
                            approvalStatus: "",
                            isSelectedForFunding: true,
                            description: "",
                            providerVersionId: "",
                            fundingStreams: [mockFundingStream],
                            fundingPeriod: mockFundingPeriod,
                            templateIds: {},
                            dataDefinitionRelationshipIds: []
                        }
                }))
            }
        });
    }

    const mockProviderVersionService = () => {
        jest.mock("../../../services/providerVersionService", () => {
            const service = jest.requireActual("../../../services/providerVersionService");

            return {
                ...service,
                getCoreProvidersByFundingStream: jest.fn(() => Promise.resolve({
                    data: [mockCoreProvider1, mockCoreProvider2]
                }))
            }
        });
    }

    const mockProviderService = () => {
        jest.mock("../../../services/providerService", () => {
            const service = jest.requireActual("../../../services/providerService");

            return {
                ...service,
                getProviderSnapshotsByFundingStream: jest.fn(() => Promise.resolve({
                    data: [mockProviderSnapshot1, mockProviderSnapshot2]
                }))
            }
        });
    }

    const withJobMonitoringState: JobMonitoringFilter = {
        jobTypes: [JobType.RefreshFundingJob],
        specificationId: "1234"
    }

    const withNoPermissions: FundingStreamPermissions[] = [buildPermissions({
        fundingStreamId: mockFundingStream.id,
        fundingStreamName: mockFundingStream.name,
        setAllPermsEnabled: false
    })];
    const withCreatePermissions: FundingStreamPermissions[] = [buildPermissions({
        fundingStreamId: mockFundingStream.id,
        fundingStreamName: mockFundingStream.name,
        setAllPermsEnabled: false,
        actions: [p => p.canCreateSpecification = true]
    })];

    const withoutPermissions: SpecificationPermissionsResult = {
        userId: "3456",
        isCheckingForPermissions: false,
        hasPermission: () => false,
        hasMissingPermissions: true,
        isPermissionsFetched: true,
        permissionsEnabled: [],
        permissionsDisabled: [Permission.CanEditSpecification],
        missingPermissions: [Permission.CanEditSpecification],
    };
    const withPermissions: SpecificationPermissionsResult = {
        userId: "3456",
        isCheckingForPermissions: false,
        hasPermission: () => true,
        hasMissingPermissions: false,
        isPermissionsFetched: true,
        permissionsEnabled: [Permission.CanEditSpecification],
        permissionsDisabled: [],
        missingPermissions: [],
    };
    const hasMissingPermissionToEdit = () => {
        jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withoutPermissions));
    }

    const hasEditPermissions = () => {
        jest.spyOn(useSpecificationPermissionsHook, 'useSpecificationPermissions').mockImplementation(() => (withPermissions));
    }

    const hasReduxState = (mocks: {
        permissions: FundingStreamPermissions[],
        jobMonitorFilter?: JobMonitoringFilter
    }) => {
        const state: IStoreState = {
            featureFlags: {
                templateBuilderVisible: false,
                releaseTimetableVisible: false,
                enableReactQueryDevTool: false,
                specToSpec: false,
                profilingPatternVisible: undefined
            },
            fundingSearchSelection: {searchCriteria: undefined, selectedProviderIds: []},
            userState: {
                isLoggedIn: true,
                userName: "test-user",
                hasConfirmedSkills: true,
                fundingStreamPermissions: mocks.permissions
            },
            jobObserverState: {jobFilter: mocks.jobMonitorFilter}
        }
        useSelectorSpy.mockImplementation(callback => {
            return callback(state);
        });
    }

    async function waitForPageToLoad() {
        const {getSpecificationSummaryService} = require('../../../services/specificationService');
        const {getPublishedTemplatesByStreamAndPeriod} = require('../../../services/policyService');
        const {getFundingConfiguration} = require('../../../services/policyService');
        const {getCoreProvidersByFundingStream} = require('../../../services/providerVersionService');

        await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1));
        await waitFor(() => expect(getFundingConfiguration).toBeCalledTimes(1));
        await waitFor(() => expect(getCoreProvidersByFundingStream).toBeCalledTimes(1));
        await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
    }

    return {
        renderCreateSpecificationPage,
        renderEditSpecificationPageWithJobRunning: renderEditSpecificationPage,
        renderEditSpecificationPage: renderLoadedEditSpecificationPage,
        mockPolicyService,
        mockSpecificationService,
        mockSpecificationServiceWithDuplicateNameResponse,
        mockProviderVersionService,
        mockProviderService,
        haveSuccessfulJobCompletion: mockJobMonitorHookWithSuccessfulJob,
        haveSpecificationMonitorHookWithNoJob: mockLatestSpecJobMonitorHookWithNoJob,
        haveRunningSpecificationMonitorJob: mockLatestSpecJobMonitorHookWithARunningJob,
        haveNoJobRunning: mockJobMonitorHookWithNoJob,
        specificationCfs: mockCfsSpec,
        specificationFdzWithoutTracking: mockFdzSpecWithoutTracking,
        specificationFdzWithTrackingLatest: mockFdzSpecWithTrackingLatest,
        fundingStream: mockFundingStream,
        fundingPeriod: mockFundingPeriod,
        template1: mockTemplate1,
        template2: mockTemplate2,
        coreProvider1: mockCoreProvider1,
        coreProvider2: mockCoreProvider2,
        providerSnapshot1: mockProviderSnapshot1,
        providerSnapshot2: mockProviderSnapshot2,
        withCreatePermissions,
        hasEditPermissions,
        withNoPermissions,
        hasMissingPermissionToEdit,
        mockGetFundingConfigurationCall,
        mockGetFundingStreamsCall,
        mockGetPublishedTemplatesByStreamAndPeriodCall,
        waitForPageToLoad,
        withJobMonitoringState,
        hasReduxState
    }
}
