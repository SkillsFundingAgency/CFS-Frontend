import React from 'react';
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";
import * as monitor from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import * as specPermsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import {QueryClient, QueryClientProvider} from "react-query";
import {fullSpecPermissions} from "../../fakes/testFactories";
import {FundingConfiguration} from "../../../types/FundingConfiguration";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import * as redux from "react-redux";
import {Provider} from "react-redux";
import {JobObserverState} from "../../../states/JobObserverState";
import {JobType} from "../../../types/jobType";
import {testSpec} from "../../Hooks/useSpecificationSummary.test";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {UpdateCoreProviderVersion} from "../../../types/Provider/UpdateCoreProviderVersion";

const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

export function ViewSpecificationTestData() {
    const useSelectorSpy = jest.spyOn(redux, 'useSelector');
    jest.mock("../../../components/AdminNav");

    const sendFailedJobNotification = async () => {
        jobMonitorSpy.mockReturnValue({
            hasJob: true,
            isCheckingForJob: false,
            isFetched: true,
            isFetching: false,
            isMonitoring: false,
            latestJob: {
                jobId: "jobId-generatedByRefresh",
                statusDescription: "",
                jobDescription: "",
                runningStatus: RunningStatus.Completed,
                failures: [],
                isSuccessful: false,
                isFailed: false,
                isActive: false,
                isComplete: true,
                completionStatus: CompletionStatus.Succeeded
            }
        });
    }

    const jobMonitorSpy = jest.spyOn(monitor, 'useLatestSpecificationJobWithMonitoring');

    function mockSpecificationPermissions(expectedSpecificationPermissionsResult?: SpecificationPermissionsResult) {
        jest.spyOn(specPermsHook, 'useSpecificationPermissions')
            .mockImplementation(() => (expectedSpecificationPermissionsResult ? expectedSpecificationPermissionsResult : fullSpecPermissions));
    }

    const mockFundingConfiguration: FundingConfiguration = {
        fundingStreamId: "",
        fundingPeriodId: "",
        approvalMode: ApprovalMode.All,
        providerSource: ProviderSource.CFS,
        defaultTemplateVersion: "",
        enableConverterDataMerge: true,
        updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
    }

    function fundingConfigurationSpy() {
        jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration')
            .mockImplementation(() => ({
                fundingConfiguration: mockFundingConfiguration,
                isLoadingFundingConfiguration: false,
                isErrorLoadingFundingConfiguration: false,
                errorLoadingFundingConfiguration: ""
            }));
    }

    const renderViewSpecificationPage = async () => {
        const {ViewSpecification} = require('../../../pages/Specifications/ViewSpecification');
        const component = render(<MemoryRouter initialEntries={['/ViewSpecification/SPEC123']}>
            <QueryClientProvider client={new QueryClient()}>
                <Provider store={store}>
                    <Switch>
                        <Route path="/ViewSpecification/:specificationId" component={ViewSpecification}/>
                    </Switch>
                </Provider>
            </QueryClientProvider>
        </MemoryRouter>);
        await waitFor(() => {
            expect(screen.getByText(/View funding/i)).toBeInTheDocument();
        });
        return component;
    };

    const renderViewApprovedSpecificationPage = async () => {
        const {ViewSpecification} = require('../../../pages/Specifications/ViewSpecification');
        const component = render(<MemoryRouter initialEntries={['/ViewSpecification/SPEC123']}>
            <QueryClientProvider client={new QueryClient()}>
                <Provider store={store}>
                    <Switch>
                        <Route path="/ViewSpecification/:specificationId" component={ViewSpecification}/>
                    </Switch>
                </Provider>
            </QueryClientProvider>
        </MemoryRouter>);
        await waitFor(() => {
            expect(screen.getByText("Choose for funding")).toBeInTheDocument();
        });
        return component;
    };

    const mockJobObserverState: JobObserverState = {
        jobFilter: {
            jobTypes: [JobType.RefreshFundingJob],
            specificationId: testSpec.id
        }
    }
    const mockNoJobObserverState: JobObserverState = {
        jobFilter: undefined
    }
    const hasNoJobObserverState = () => {
        useSelectorSpy.mockReturnValue(mockNoJobObserverState);
    }

    const mockPublishService = () => {
        jest.mock("../../../services/publishService", () => {
            const service = jest.requireActual("../../../services/publishService");
            return {
                ...service,
                refreshSpecificationFundingService: jest.fn(() => Promise.resolve({
                    status: 200,
                    data: "jobId-generatedByRefresh"
                })),
            }
        });
    }

    const mockSpecificationService = () => {
        jest.mock("../../../services/specificationService", () => {
            const service = jest.requireActual('../../../services/specificationService');
            return {
                ...service,
                getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                    data: {
                        name: "A Test Spec Name",
                        id: "SPEC123",
                        approvalStatus: "Draft",
                        isSelectedForFunding: true,
                        description: "Test Description",
                        providerVersionId: "PROVID123",
                        fundingStreams: [{id: "fundingStreamId", name: "PSG"}],
                        fundingPeriod: {
                            id: "fp123",
                            name: "fp 123"
                        },
                        templateIds: {},
                        dataDefinitionRelationshipIds: [],
                    }
                })),
                getProfileVariationPointersService: jest.fn(() => Promise.resolve({
                    data: [{
                        fundingStreamId: "test",
                        fundingLineId: "test",
                        periodType: "test",
                        typeValue: "test",
                        year: 1,
                        occurrence: 1,
                    }]
                }))
            }
        });
    }

    const mockApprovedSpecificationService = () => {
        jest.mock("../../../services/specificationService", () => {
            const service = jest.requireActual('../../../services/specificationService');
            return {
                ...service,
                getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                    data: {
                        name: "A Test Spec Name",
                        id: "SPEC123",
                        approvalStatus: "Approved",
                        isSelectedForFunding: false,
                        description: "Test Description",
                        providerVersionId: "PROVID123",
                        fundingStreams: [{id: "fundingStreamId", name: "PSG"}],
                        fundingPeriod: {
                            id: "fp123",
                            name: "fp 123"
                        },
                        templateIds: {},
                        dataDefinitionRelationshipIds: [],
                    }
                })),
                getProfileVariationPointersService: jest.fn(() => Promise.resolve({
                    data: [{
                        fundingStreamId: "test",
                        fundingLineId: "test",
                        periodType: "test",
                        typeValue: "test",
                        year: 1,
                        occurrence: 1,
                    }]
                })),
                getSpecificationsSelectedForFundingByPeriodAndStreamService: jest.fn(() => Promise.resolve({
                    data: []
                })),
            }
        });
    }

    const mockFundingLineStructureService = () => {
        jest.mock("../../../services/fundingStructuresService", () => {
            const fundingLineStructureService = jest.requireActual('../../../services/fundingStructuresService');
            return {
                ...fundingLineStructureService,
                getFundingLineStructureService: jest.fn(() => Promise.resolve({
                    data: [{
                        level: 1,
                        name: "",
                        calculationId: "",
                        calculationPublishStatus: "",
                        type: undefined,
                        fundingStructureItems: [],
                        parentName: "",
                        expanded: false
                    }]
                }))
            }
        });
    }

    const mockDatasetBySpecificationIdService = () => {
        jest.mock("../../../services/datasetService", () => {
            const datasetBySpecificationIdService = jest.requireActual('../../../services/datasetService');
            return {
                ...datasetBySpecificationIdService,
                getDatasetBySpecificationIdService: jest.fn(() => Promise.resolve({
                    data: {
                        statusCode: 1,
                        content: [{
                            definition: {
                                description: "",
                                id: "",
                                name: ""
                            },
                            relationshipDescription: "",
                            isProviderData: false,
                            id: "",
                            name: ""
                        }]
                    }
                }))
            }
        });
    }

    const mockCalculationService = () => {
        jest.mock("../../../services/calculationService", () => {
            const calculationService = jest.requireActual('../../../services/calculationService');
            return {
                ...calculationService,
                getCalculationSummaryBySpecificationId: jest.fn(() => Promise.resolve({
                    data: []
                })),
                getCalculationCircularDependencies: jest.fn(() => Promise.resolve({
                    data: []
                }))
            }
        });
    }

    return {
        sendFailedJobNotification,
        jobMonitorSpy,
        fundingConfigurationSpy,
        mockSpecificationPermissions,
        renderViewSpecificationPage,
        renderViewApprovedSpecificationPage,
        mockPublishService,
        mockSpecificationService,
        mockApprovedSpecificationService,
        mockFundingLineStructureService,
        mockDatasetBySpecificationIdService,
        mockCalculationService,
        hasNoJobObserverState
    }
}
