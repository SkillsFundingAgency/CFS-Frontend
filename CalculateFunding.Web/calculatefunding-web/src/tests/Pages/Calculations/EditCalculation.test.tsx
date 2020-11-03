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
import {CalculationType} from "../../../types/CalculationSearchResponse";
import {ValueType} from "../../../types/ValueType";
import userEvent from "@testing-library/user-event";
import {CalculationCompilePreviewResponse, CompileErrorSeverity} from "../../../types/Calculations/CalculationCompilePreviewResponse";
import {CalculationDetails} from "../../../types/CalculationDetails";

const history = createMemoryHistory();


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

describe("<EditCalculation> tests", () => {

    describe("<EditCalculation> when user builds invalid source code", () => {
        beforeEach(() => {
            mockOutMonacoEditor();
            mockWithFullPermissions();
            mockSpecification();
            mockCalculation();
            mockNoCircularRefErrors();
            mockFailedBuild();

            renderEditCalculation();

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

    describe("<EditCalculation> with no circular ref errors", () => {
        beforeEach(() => {
            mockOutMonacoEditor();
            mockWithFullPermissions();
            mockSpecification();
            mockCalculation();
            mockNoCircularRefErrors();

            renderEditCalculation();
        });
        afterEach(() => jest.clearAllMocks());

        it("does not render any errors", async () => {
            expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
        });

        it("renders the specification name", async () => {
            expect(screen.getByText(testSpec.name)).toBeInTheDocument();
        });

        it("renders the calculation name", async () => {
            expect(screen.getByText("Calculation name")).toBeInTheDocument();
            expect(screen.getByText(testCalc.name)).toBeInTheDocument();
        });

        it("renders the calculation status", async () => {
            expect(screen.getByText("Calculation status")).toBeInTheDocument();
            expect(screen.getByText(testCalc.publishStatus)).toBeInTheDocument();
        });

        it("renders the calculation type", async () => {
            expect(screen.getByText("Value type")).toBeInTheDocument();
            expect(screen.getByText(testCalc.valueType)).toBeInTheDocument();
        });

        it("does not render CircularReferenceErrors when there are no circular reference errors", async () => {
            expect(screen.queryByText("Calculations are not able to run due to the following problem")).not.toBeInTheDocument();
        });

        it('disables save button given user has not edited the calculation', async () => {
            const saveButton = screen.getByRole("button", {name: /Save and continue/});
            expect(saveButton).toBeDisabled();
        });

        it('enables approve button given user is allowed to approve calculation', async () => {
            const approveButton = screen.getByRole("button", {name: /Approve/});
            expect(approveButton).toBeEnabled();
       });
    });
    describe("<EditCalculation> with no permissions", () => {
        beforeEach(() => {
            mockOutMonacoEditor();
            mockWithNoPermissions();
            mockSpecification();
            mockCalculation();
            mockNoCircularRefErrors();

            renderEditCalculation();
        });
        afterEach(() => jest.clearAllMocks());

        it("renders permissions warning", async () => {
            const permissionsWarning = await screen.findByTestId("permission-alert-message");
            expect(within(permissionsWarning).getByText(/You do not have permissions to perform the following actions:/)).toBeInTheDocument();
            expect(within(permissionsWarning).getByText(/Approve Calculations/)).toBeInTheDocument();
            expect(within(permissionsWarning).getByText(/Edit Calculations/)).toBeInTheDocument();

            expect(screen.getByText(testSpec.name)).toBeInTheDocument();
        });
        
        it('disables approve button given user is not allowed to approve calculation', async () => {
            const approveButton = screen.getByRole("button", {name: /Approve/});
            expect(approveButton).toBeDisabled();
       });
    });

    describe("<EditCalculation> when loading circular ref errors", () => {
        beforeEach(() => {
            mockOutMonacoEditor();
            mockSpecification();
            mockCalculation();
            mockCircularRefErrorsLoading();

            renderEditCalculation();
        });
        afterEach(() => jest.clearAllMocks());

        it("renders the specification", async () => {
            expect(screen.getByText(testSpec.name)).toBeInTheDocument();
        });

        it("renders the calculation", async () => {
            expect(screen.getByText("Calculation name")).toBeInTheDocument();
            expect(screen.getByText(testCalc.publishStatus)).toBeInTheDocument();
        });

        it("renders CircularReferenceErrors loading", async () => {
            expect(await screen.findByText(/Checking for circular reference errors/)).toBeInTheDocument();
        });
    });

    describe("<EditCalculation> with a circular ref error", () => {
        beforeEach(() => {
            mockOutMonacoEditor();
            mockSpecification();
            mockCalculation();
            mockCircularRefErrors();

            renderEditCalculation();
        });
        afterEach(() => jest.clearAllMocks());

        it("renders the specification", async () => {
            expect(screen.getByText(testSpec.name)).toBeInTheDocument();
        });

        it("renders the calculation", async () => {
            expect(screen.getByText("Calculation name")).toBeInTheDocument();
            expect(screen.getByText(testCalc.publishStatus)).toBeInTheDocument();
        });

        it("renders CircularReferenceErrors when there are circular reference errors", async () => {
            expect(screen.getByText("Calculations are not able to run due to the following problem")).toBeInTheDocument();
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
    dataDefinitionRelationshipIds: []
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
    calculationType: CalculationType.Additional,
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
    }
};
const mockSuccessfulBuildResponse: CalculationCompilePreviewResponse = {
    compilerOutput: {
        success: true,
        sourceFiles: [{
            fileName: "",
            sourceCode: ""
        }],
        compilerMessages: [],
    }
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
    canCreateAdditionalCalculation: true
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
    canCreateAdditionalCalculation: false
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
