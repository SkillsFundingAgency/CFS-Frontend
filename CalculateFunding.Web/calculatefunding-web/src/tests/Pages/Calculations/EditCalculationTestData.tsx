import React from "react";
import {EditCalculationRouteProps} from "../../../pages/Calculations/EditCalculation";
import {createLocation, createMemoryHistory} from 'history';
import {match} from 'react-router';
import {MemoryRouter} from 'react-router-dom';
import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as specHook from "../../../hooks/useSpecificationSummary";
import {SpecificationSummaryQueryResult} from "../../../hooks/useSpecificationSummary";
import * as specPermsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import * as circularRefErrorsHook from "../../../hooks/Calculations/useCalculationCircularDependencies";
import {CalculationCircularDependenciesQueryResult} from "../../../hooks/Calculations/useCalculationCircularDependencies";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {PublishStatus} from "../../../types/PublishStatusModel";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {ValueType} from "../../../types/ValueType";
import {
    CalculationCompilePreviewResponse,
    CalculationDataType,
    CompileErrorSeverity, CompilerOutput, PreviewProviderCalculationResponseModel
} from "../../../types/Calculations/CalculationCompilePreviewResponse";
import {CalculationDetails} from "../../../types/CalculationDetails";
import {CalculationType} from "../../../types/CalculationSearchResponse";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import * as permissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {Permission} from "../../../types/Permission";

const history = createMemoryHistory();

export function EditCalculationTestData() {
    const renderEditCalculation = async () => {
        const {EditCalculation} = require("../../../pages/Calculations/EditCalculation");
        const component = render(
            <MemoryRouter>
                <QueryClientProviderTestWrapper>
                    <EditCalculation
                        excludeMonacoEditor={true}
                        history={history}
                        location={location}
                        match={matchMock}/>
                </QueryClientProviderTestWrapper>
            </MemoryRouter>);

        await waitFor(() => expect(screen.queryByTestId("loader")).not.toBeInTheDocument());

        return component;
    }

    const fundingStream: FundingStream = {
        name: "FS123",
        id: "Wizard Training Scheme"
    };
    const fundingPeriod: FundingPeriod = {
        id: "FP123",
        name: "2019-20"
    };
    const mockSpecData: SpecificationSummary = {
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
        specification: mockSpecData,
        isLoadingSpecification: false,
        errorCheckingForSpecification: null,
        haveErrorCheckingForSpecification: false,
        isFetchingSpecification: false,
        isSpecificationFetched: true
    };
    const mockCalcData: CalculationDetails = {
        author: {id: "testUserId", name: "Mr Test"},
        calculationType: CalculationType.Template,
        description: undefined,
        fundingStreamId: fundingStream.id,
        id: "54723",
        lastUpdated: new Date(),
        name: "Test Calc 1",
        namespace: "blah-blah",
        publishStatus: PublishStatus.Draft,
        sourceCode: "return 42",
        sourceCodeName: "source code 1",
        specificationId: mockSpecData.id,
        dataType: CalculationDataType.Decimal,
        valueType: ValueType.Currency,
        wasTemplateCalculation: false
    }

    const matchMock: match<EditCalculationRouteProps> = {
        isExact: true,
        path: "",
        url: "",
        params: {
            calculationId: mockCalcData.id,
        }
    };
    const withCircularRefErrorsResult: CalculationCircularDependenciesQueryResult = {
        circularReferenceErrors: [{
            node: {
                calculationid: mockCalcData.id,
                calculationName: mockCalcData.name,
                calculationType: mockCalcData.calculationType,
                fundingStream: fundingStream.id,
                specificationId: mockSpecData.id
            },
            relationships: []
        }],
        isLoadingCircularDependencies: false
    }
    const loadingCircularRefErrorsResult: CalculationCircularDependenciesQueryResult = {
        circularReferenceErrors: undefined,
        isLoadingCircularDependencies: true
    }
    const noCircularRefErrorsResult: CalculationCircularDependenciesQueryResult = {
        circularReferenceErrors: [],
        isLoadingCircularDependencies: false
    }
    const mockFailedBuildResponse: CalculationCompilePreviewResponse = {
        compilerOutput: {
            success: false,
            sourceFiles: [{
                fileName: "",
                sourceCode: ""
            }],
            compilerMessages: [{
                severity: CompileErrorSeverity.Error,
                location: {
                    startChar: 1,
                    endChar: 2,
                    startLine: 1,
                    endLine: 1,
                    owner: {id: "TestUser3", name: "Mr Test"}
                },
                message: "Typo error"
            }]
        },
        previewProviderCalculation: {
            calculationResult: {
                calculation: {
                    id: "",
                    name: ""
                },
                calculationDataType: CalculationDataType.Boolean,
                calculationType: CalculationType.Template,
                exceptionMessage: "",
                exceptionStackTrace: "",
                exceptionType: "",
                value: undefined
            },
            providerName: ""
        },
        calculation: {
            id: "",
            author: null,
            fundingStreamId: "",
            lastUpdated: new Date(),
            name: "",
            namespace: "",
            sourceCode: "",
            publishStatus: PublishStatus.Approved,
            sourceCodeName: "",
            specificationId: "",
            valueType: ValueType.Boolean,
            dataType: CalculationDataType.Decimal,
            wasTemplateCalculation: false,
            calculationType: CalculationType.Template
        }
    };
    const mockSuccessfulCompilerOutput: CompilerOutput = {
        success: true,
        sourceFiles: [{
            fileName: "",
            sourceCode: ""
        }],
        compilerMessages: [],
    }
    const mockSuccessfulPreviewProviderCalculationResult: PreviewProviderCalculationResponseModel = {
        calculationResult: {
            calculation: {
                id: "123",
                name: "123"
            },
            calculationDataType: CalculationDataType.Boolean,
            calculationType: CalculationType.Template,
            exceptionMessage: "",
            exceptionStackTrace: "",
            exceptionType: "",
            value: undefined
        },
        providerName: "test provider name",
    }
    const mockSuccessfulCalcData: CalculationDetails = {
        id: "",
        author: null,
        fundingStreamId: "",
        lastUpdated: new Date(),
        name: "Test 890234",
        namespace: "",
        sourceCode: "return 0",
        publishStatus: PublishStatus.Approved,
        sourceCodeName: "",
        specificationId: mockSpecData.id,
        valueType: ValueType.Boolean,
        dataType: CalculationDataType.Boolean,
        wasTemplateCalculation: false,
        calculationType: CalculationType.Template
    }
    const mockSavedCalcData: CalculationDetails = {
        id: "",
        author: null,
        fundingStreamId: "",
        lastUpdated: new Date(),
        name: "Test 543672357",
        namespace: "",
        sourceCode: "return 1010101",
        publishStatus: PublishStatus.Draft,
        sourceCodeName: "",
        specificationId: mockSpecData.id,
        valueType: ValueType.Number,
        dataType: CalculationDataType.Decimal,
        wasTemplateCalculation: false,
        calculationType: CalculationType.Template
    }
    const mockSuccessfulBuildResponse: CalculationCompilePreviewResponse = {
        compilerOutput: mockSuccessfulCompilerOutput,
        previewProviderCalculation: mockSuccessfulPreviewProviderCalculationResult,
        calculation: mockSuccessfulCalcData
    };
    const mockSuccessfulBuildResponseWithNoProviderResponse: CalculationCompilePreviewResponse = {
        compilerOutput: mockSuccessfulCompilerOutput,
        previewProviderCalculation: {
            calculationResult: {
                calculation: {
                    id: "123",
                    name: "123"
                },
                calculationDataType: CalculationDataType.Boolean,
                calculationType: CalculationType.Template,
                exceptionMessage: "",
                exceptionStackTrace: "",
                exceptionType: "",
                value: undefined
            },
            providerName: ""
        },
        calculation: mockSuccessfulCalcData
    };

    const fullPermissions: permissionsHook.SpecificationPermissionsResult = {
        isPermissionsFetched: true,
        userId: "1234",
        hasPermission: () => true,
        hasMissingPermissions: false,
        isCheckingForPermissions: false,
        missingPermissions: [],
        permissionsDisabled: [],
        permissionsEnabled: [Permission.CanEditCalculations, Permission.CanApproveCalculations, Permission.CanApproveAllCalculations, Permission.CanApproveAnyCalculations],
    };

    const noPermissions: permissionsHook.SpecificationPermissionsResult = {
        isPermissionsFetched: true,
        userId: "1234",
        hasPermission: () => false,
        hasMissingPermissions: true,
        isCheckingForPermissions: false,
        missingPermissions: [Permission.CanEditCalculations, Permission.CanApproveCalculations, Permission.CanApproveAllCalculations, Permission.CanApproveAnyCalculations],
        permissionsDisabled: [Permission.CanEditCalculations, Permission.CanApproveCalculations, Permission.CanApproveAllCalculations, Permission.CanApproveAnyCalculations],
        permissionsEnabled: [],
    };
    const location = createLocation(matchMock.url);
    const mockOutMonacoEditor = () => jest.mock("../../../components/GdsMonacoEditor", () => <></>);
    const mockWithFullPermissions = () => jest.spyOn(specPermsHook, 'useSpecificationPermissions')
        .mockImplementation(() => (fullPermissions));
    const mockWithNoPermissions = () => jest.spyOn(specPermsHook, 'useSpecificationPermissions')
        .mockImplementation(() => (noPermissions));
    const mockSpecification = () => jest.spyOn(specHook, 'useSpecificationSummary')
        .mockImplementation(() => (specResult));
    const mockCircularRefErrors = () => jest.spyOn(circularRefErrorsHook, 'useCalculationCircularDependencies')
        .mockImplementation(() => (withCircularRefErrorsResult));
    const mockCircularRefErrorsLoading = () => jest.spyOn(circularRefErrorsHook, 'useCalculationCircularDependencies')
        .mockImplementation(() => (loadingCircularRefErrorsResult));
    const mockNoCircularRefErrors = () => jest.spyOn(circularRefErrorsHook, 'useCalculationCircularDependencies')
        .mockImplementation(() => (noCircularRefErrorsResult));
    const mockFailedBuild = () => {
        jest.mock("../../../services/calculationService", () => {
            const mockService = jest.requireActual("../../../services/calculationService");

            return {
                ...mockService,
                compileCalculationPreviewService: jest.fn(() => Promise.resolve({
                    data: mockFailedBuildResponse,
                    status: 400
                })),
                getCalculationProvidersService: jest.fn(() => Promise.resolve({
                    data: {},
                    status: 200
                })),
                getCalculationByIdService: jest.fn(() => Promise.resolve({
                    data: mockCalcData,
                    status: 200
                }))
            }
        });
    }
    const mockSuccessfulBuild = () => {
        jest.mock("../../../services/calculationService", () => {
            const mockService = jest.requireActual("../../../services/calculationService");

            return {
                ...mockService,
                compileCalculationPreviewService: jest.fn(() => Promise.resolve({
                    data: mockSuccessfulBuildResponse,
                    status: 200
                })),
                getCalculationByIdService: jest.fn(() => Promise.resolve({
                    data: mockCalcData,
                    status: 200
                })),
                getCalculationProvidersService: jest.fn(() => Promise.resolve({
                    data: {},
                    status: 200
                }))
            }
        });
    }
    const mockCalculationOnly = () => {
        jest.mock("../../../services/calculationService", () => {
            const mockService = jest.requireActual("../../../services/calculationService");

            return {
                ...mockService,
                getCalculationByIdService: jest.fn(() => Promise.resolve({
                    data: mockCalcData,
                    status: 200
                })),
            }
        });
    }
    const mockSuccessfulBuildAndSave = () => {
        jest.mock("../../../services/calculationService", () => {
            const mockService = jest.requireActual("../../../services/calculationService");

            return {
                ...mockService,
                compileCalculationPreviewService: jest.fn(() => Promise.resolve({
                    data: mockSuccessfulBuildResponse,
                    status: 200
                })),
                getCalculationByIdService: jest.fn(() => Promise.resolve({
                    data: mockCalcData,
                    status: 200
                })),
                getCalculationProvidersService: jest.fn(() => Promise.resolve({
                    data: {},
                    status: 200
                })),
                updateCalculationService: jest.fn(() => Promise.resolve({
                    data: mockSavedCalcData,
                    status: 200
                }))
            }
        });
    }
    const mockSuccessfulBuildWithNoProvider = () => {
        jest.mock("../../../services/calculationService", () => {
            const service = jest.requireActual("../../../services/calculationService");

            return {
                ...service,
                compileCalculationPreviewService: jest.fn(() => Promise.resolve({
                    data: mockSuccessfulBuildResponseWithNoProviderResponse,
                    status: 200
                })),
                getCalculationByIdService: jest.fn(() => Promise.resolve({
                    data: mockCalcData,
                    status: 200
                })),
                getCalculationProvidersService: jest.fn(() => Promise.resolve({
                    data: {},
                    status: 200
                }))
            }
        });
    }

    return {
        matchMock,
        calcData: mockCalcData,
        specData: mockSpecData,
        savedCalcData: mockSavedCalcData,
        renderEditCalculation,
        mockCalculationOnly,
        mockSuccessfulBuild,
        mockFailedBuild,
        mockOutMonacoEditor,
        mockWithFullPermissions,
        mockSpecification,
        mockNoCircularRefErrors,
        mockCircularRefErrors,
        mockWithNoPermissions,
        mockCircularRefErrorsLoading,
        mockSuccessfulBuildWithNoProvider,
        mockSuccessfulBuildAndSave
    }
}