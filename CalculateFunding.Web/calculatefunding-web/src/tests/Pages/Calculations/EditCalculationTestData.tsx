import React from "react";
import {EditCalculationRouteProps} from "../../../pages/Calculations/EditCalculation";
import {createLocation, createMemoryHistory} from 'history';
import {match} from 'react-router';
import {MemoryRouter} from 'react-router-dom';
import {act, cleanup, render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as specHook from "../../../hooks/useSpecificationSummary";
import {SpecificationSummaryQueryResult} from "../../../hooks/useSpecificationSummary";
import * as specPermsHook from "../../../hooks/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/useSpecificationPermissions";
import * as calcHook from "../../../hooks/Calculations/useCalculation";
import {CalculationQueryResult} from "../../../hooks/Calculations/useCalculation";
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

const history = createMemoryHistory();
export function EditCalculationTestData() {
    function renderEditCalculation() {
        const {EditCalculation} = require("../../../pages/Calculations/EditCalculation");
        return render(
            <MemoryRouter>
                <EditCalculation
                    excludeMonacoEditor={true}
                    history={history}
                    location={location}
                    match={matchMock}/>
            </MemoryRouter>);
    }

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
    const testCalc: CalculationDetails = {
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
        specificationId: testSpec.id,
        dataType: CalculationDataType.Decimal,
        valueType: ValueType.Currency,
        wasTemplateCalculation: false
    }
    const calcResult: CalculationQueryResult = {
        calculation: testCalc,
        isLoadingCalculation: false
    }

    const matchMock: match<EditCalculationRouteProps> = {
        isExact: true,
        path: "",
        url: "",
        params: {
            calculationId: testCalc.id,
        }
    };
    const withCircularRefErrorsResult: CalculationCircularDependenciesQueryResult = {
        circularReferenceErrors: [{
            node: {
                calculationid: testCalc.id,
                calculationName: testCalc.name,
                calculationType: testCalc.calculationType,
                fundingStream: fundingStream.id,
                specificationId: testSpec.id
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
    const mockSuccessfulPreviewProviderCalculation: PreviewProviderCalculationResponseModel = {
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
        providerName: "123"
    }
    const mockSuccessfulCalculation: CalculationDetails = {
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
        dataType: CalculationDataType.Boolean,
        wasTemplateCalculation: false,
        calculationType: CalculationType.Template
    }
    const mockSuccessfulBuildResponse: CalculationCompilePreviewResponse = {
        compilerOutput: mockSuccessfulCompilerOutput,
        previewProviderCalculation: mockSuccessfulPreviewProviderCalculation,
        calculation: mockSuccessfulCalculation
    };
    const mockSuccessfulBuildResponseWithNoProvider: CalculationCompilePreviewResponse = {
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
        calculation: mockSuccessfulCalculation
    };
    const specFullPermsResult: SpecificationPermissionsResult = {
        canApproveFunding: false,
        canCreateSpecification: false,
        canEditCalculation: true,
        canEditSpecification: false,
        canMapDatasets: false,
        canRefreshFunding: false,
        canReleaseFunding: false,
        canApproveCalculation: true,
        hasMissingPermissions: false,
        isCheckingForPermissions: false,
        isPermissionsFetched: true,
        missingPermissions: [],
        canCreateAdditionalCalculation: true,
        canApproveAllCalculations: true,
        canChooseFunding: true
    }
    const specNoPermsResult: SpecificationPermissionsResult = {
        canApproveFunding: false,
        canCreateSpecification: false,
        canEditCalculation: false,
        canEditSpecification: false,
        canMapDatasets: false,
        canRefreshFunding: false,
        canReleaseFunding: false,
        canApproveCalculation: false,
        hasMissingPermissions: false,
        isCheckingForPermissions: false,
        isPermissionsFetched: true,
        missingPermissions: ["Edit Calculations", "Approve Calculations",],
        canCreateAdditionalCalculation: false,
        canChooseFunding: false,
        canApproveAllCalculations: false
    }
    const location = createLocation(matchMock.url);
    const mockOutMonacoEditor = () => jest.mock("../../../components/GdsMonacoEditor", () => <></>);
    const mockWithFullPermissions = () => jest.spyOn(specPermsHook, 'useSpecificationPermissions')
        .mockImplementation(() => (specFullPermsResult));
    const mockWithNoPermissions = () => jest.spyOn(specPermsHook, 'useSpecificationPermissions')
        .mockImplementation(() => (specNoPermsResult));
    const mockSpecification = () => jest.spyOn(specHook, 'useSpecificationSummary')
        .mockImplementation(() => (specResult));
    const mockCalculation = () => jest.spyOn(calcHook, 'useCalculation')
        .mockImplementation(() => (calcResult));
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
                    data: mockSuccessfulBuildResponseWithNoProvider,
                    status: 200
                }))
            }
        });
    }

    return {
        matchMock,
        testCalc,
        testSpec,
        renderEditCalculation,
        mockSuccessfulBuild,
        mockFailedBuild,
        mockOutMonacoEditor,
        mockWithFullPermissions,
        mockSpecification,
        mockCalculation,
        mockNoCircularRefErrors,
        mockCircularRefErrors,
        mockWithNoPermissions,
        mockCircularRefErrorsLoading,
        mockSuccessfulBuildWithNoProvider
    }
}