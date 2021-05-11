import React from "react";
import {match} from 'react-router';
import {MemoryRouter} from 'react-router-dom';
import {CreateAdditionalCalculation, CreateAdditionalCalculationRouteProps} from "../../../pages/Calculations/CreateAdditionalCalculation";
import userEvent from "@testing-library/user-event";
import {act, cleanup, render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import * as specHook from "../../../hooks/useSpecificationSummary";
import {SpecificationSummaryQueryResult} from "../../../hooks/useSpecificationSummary";
import {CalculationCompilePreviewResponse, CalculationDataType, CompileErrorSeverity} from "../../../types/Calculations/CalculationCompilePreviewResponse";
import * as specPermsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import * as permissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import {createLocation} from "history";
import {CalculationType} from "../../../types/CalculationSearchResponse";
import {PublishStatus} from "../../../types/PublishStatusModel";
import {ValueType} from "../../../types/ValueType";
import {Permission} from "../../../types/Permission";

function renderPage() {
    const {CreateAdditionalCalculation} = require("../../../pages/Calculations/CreateAdditionalCalculation");
    return render(<MemoryRouter>
        <CreateAdditionalCalculation
            excludeMonacoEditor={true}
            history={history}
            location={location}
            match={matchMock}/>
    </MemoryRouter>);
}
jest.mock("../../../components/AdminNav");


describe("<CreateAdditionalCalculation> tests", () => {

    describe("<CreateAdditionalCalculation> when user builds invalid source code", () => {
        beforeEach(() => {
            mockOutMonacoEditor();
            mockWithFullPermissions();
            mockSpecification();
            mockFailedBuild();

            renderPage();
        });
        afterEach(() => {
            cleanup();
            jest.clearAllMocks()
        });

        it("renders the error message", async () => {
            const buildButton = screen.getByRole("button", {name: /Build calculation/});

            act(() => userEvent.click(buildButton));

            expect(await screen.findByText(/There was a compilation error/)).toBeInTheDocument();
            expect(await screen.findByText(/Typo error/)).toBeInTheDocument();
            expect(screen.queryByText(/Build successful/)).not.toBeInTheDocument();
        });
    });

    describe("<CreateAdditionalCalculation> with no issues", () => {
        beforeEach(() => {
            mockOutMonacoEditor();
            mockWithFullPermissions();
            mockSpecification();

            renderPage();
        });
        afterEach(() => jest.clearAllMocks());

        it("does not render any errors", async () => {
            expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
        });

        it("renders the specification name", async () => {
            expect(screen.getByText(testSpec.name)).toBeInTheDocument();
        });

        it("renders the calculation name label", async () => {
            expect(screen.getByText(/Calculation name/)).toBeInTheDocument();
        });

        it("renders the calculation type label", async () => {
            expect(screen.getByText(/Value type/)).toBeInTheDocument();
        });
    });

    describe("<CreateAdditionalCalculation> with no permissions", () => {
        beforeEach(() => {
            mockOutMonacoEditor();
            mockWithNoPermissions();
            mockSpecification();

            renderPage();
        });
        afterEach(() => jest.clearAllMocks());

        it("renders permissions warning", async () => {
            const permissionsWarning = await screen.findByTestId("permission-alert-message");
            expect(within(permissionsWarning).getByText(/You do not have permissions to perform the following actions/)).toBeInTheDocument();
            expect(within(permissionsWarning).getByText(/Can approve calculations/)).toBeInTheDocument();
            expect(within(permissionsWarning).getByText(/Can edit calculations/)).toBeInTheDocument();
            expect(within(permissionsWarning).getByText(/Can approve any calculations/)).toBeInTheDocument();

            expect(screen.getByText(testSpec.name)).toBeInTheDocument();
        });

        it('disables save button given user is not allowed to create calculations', async () => {
            const button = screen.getByRole("button", {name: /Save and continue/});
            expect(button).toBeDisabled();
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
    templateIds: {},
};

const matchMock: match<CreateAdditionalCalculationRouteProps> = {
    isExact: true,
    path: "",
    url: "",
    params: {
        specificationId: testSpec.id,
    }
};
const specResult: SpecificationSummaryQueryResult = {
    specification: testSpec,
    isLoadingSpecification: false,
    errorCheckingForSpecification: null,
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: true
};
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
    }
};
const mockSuccessfulBuildResponse: CalculationCompilePreviewResponse = {
    compilerOutput: {
        success: true,
        sourceFiles: [{
            fileName: "",
            sourceCode: ""
        }],
        compilerMessages: []
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

const fullPermissions: permissionsHook.SpecificationPermissionsResult = {
    userId: "1234",
    isPermissionsFetched: true,
    hasPermission: () => true,
    hasMissingPermissions: false,
    isCheckingForPermissions: false,
    missingPermissions: [],
    permissionsDisabled: [],
    permissionsEnabled: [Permission.CanEditCalculations, Permission.CanApproveCalculations, Permission.CanApproveAllCalculations, Permission.CanApproveAnyCalculations],
};

const noPermissions: permissionsHook.SpecificationPermissionsResult = {
    userId: "1234",
    isPermissionsFetched: true,
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
        const service = jest.requireActual("../../../services/calculationService");

        return {
            ...service,
            compileCalculationPreviewService: jest.fn(() => Promise.resolve({
                data: mockSuccessfulBuildResponse,
                status: 200
            }))
        }
    });
}
