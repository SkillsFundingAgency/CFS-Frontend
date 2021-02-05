import React from 'react';
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";
import * as monitor from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {SpecificationPermissionsResult} from "../../../hooks/useSpecificationPermissions";
import * as specPermsHook from "../../../hooks/useSpecificationPermissions";
import {QueryClient, QueryClientProvider} from "react-query";

export function ViewSpecificationTestData() {

    const sendFailedJobNotification = async() => {
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
            .mockImplementation(() => (expectedSpecificationPermissionsResult ? expectedSpecificationPermissionsResult : specWithAllPermissions));
    }

    const renderViewSpecificationPage = async () => {
        const {ViewSpecification} = require('../../../pages/Specifications/ViewSpecification');
        const component = render(<MemoryRouter initialEntries={['/ViewSpecification/SPEC123']}>
            <QueryClientProvider client={new QueryClient()}>
                <Switch>
                    <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
                </Switch>
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
                <Switch>
                    <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
                </Switch>
            </QueryClientProvider>
        </MemoryRouter>);
        await waitFor(() => {
            expect(screen.getByText("Choose for funding")).toBeInTheDocument();
        });
        return component;
    };

    const specWithAllPermissions: SpecificationPermissionsResult = {
        canApproveFunding: true,
        canCreateSpecification: true,
        canEditCalculation: true,
        canEditSpecification: true,
        canMapDatasets: true,
        canRefreshFunding: true,
        canReleaseFunding: true,
        canApproveCalculation: true,
        canApproveAllCalculations: true,
        canChooseFunding: true,
        hasMissingPermissions: true,
        isCheckingForPermissions: true,
        isPermissionsFetched: true,
        missingPermissions: [],
        canCreateAdditionalCalculation: true
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
        mockSpecificationPermissions,
        renderViewSpecificationPage,
        renderViewApprovedSpecificationPage,
        mockPublishService,
        mockSpecificationService,
        mockApprovedSpecificationService,
        mockFundingLineStructureService,
        mockDatasetBySpecificationIdService,
        mockCalculationService
    }
}