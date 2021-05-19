import React from "react";
import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {SpecificationPermissionsResult} from "../../../hooks/Permissions/useSpecificationPermissions";
import {ViewSpecificationTestData} from "./ViewSpecificationTestData";
import {RunningStatus} from "../../../types/RunningStatus";
import {Permission} from "../../../types/Permission";
import * as useCalculationErrorsHook from "../../../hooks/Calculations/useCalculationErrors";
import {CalculationErrorQueryResult, ObsoleteItemType} from "../../../types/Calculations/CalculationError";

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useSelector: jest.fn(() => ({
        releaseTimetableVisible: false
    }))
}));

const calculationErrorsResult: CalculationErrorQueryResult = {
    clearCalculationErrorsFromCache(): Promise<void> {
        return Promise.resolve(undefined);
    },
    errorCheckingForCalculationErrors: null,
    calculationErrors: [{
        codeReference: "",
        enumValueName: "",
        fundingLineId: undefined,
        fundingStreamId: "",
        id: "",
        itemType: ObsoleteItemType.Calculation,
        specificationId: "Spec123",
        additionalCalculations: [],
        templateCalculations:[],
        title: "",
        templateCalculationId: 1
    }],
    isLoadingCalculationErrors: false,
    haveErrorCheckingForCalculationErrors: false,
    areCalculationErrorsFetched: false,
    isFetchingCalculationErrors: false,
    calculationErrorCount: 1
}

jest.spyOn(useCalculationErrorsHook, 'useCalculationErrors').mockImplementation(() => (calculationErrorsResult))
jest.mock("../../../components/AdminNav");


const testData = ViewSpecificationTestData();

describe('<ViewSpecification /> ', () => {
    describe('initial page load ', () => {
        beforeEach(async () => {
            testData.mockSpecificationPermissions();
            testData.mockSpecificationService();
            testData.mockFundingLineStructureService();
            testData.mockDatasetBySpecificationIdService();
            testData.mockCalculationService();
            testData.mockPublishService();
            testData.fundingConfigurationSpy();
            testData.jobMonitorSpy.mockImplementation(() => {
                return {
                    hasJob: false,
                    isCheckingForJob: false,
                    latestJob: {
                        isComplete: true,
                        jobId: "123",
                        statusDescription: "string",
                        jobDescription: "string",
                        runningStatus: RunningStatus.Completed,
                        failures: [],
                        isSuccessful: true,
                        isFailed: false,
                        isActive: false
                    },
                    isFetched: true,
                    isFetching: false,
                    isMonitoring: false,
                }
            });
            await testData.renderViewSpecificationPage();

        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe("Service call checks ", () => {
            it("it calls the specificationService", async () => {
                const {getSpecificationSummaryService} = require('../../../services/specificationService');
                await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1));
            });
        });

        describe('page render checks ', () => {
            it('shows approve status in funding line structure tab', async () => {
                expect(screen.getByText('Draft')).toBeInTheDocument();
            });

            it('renders the edit specification link correctly', async () => {
                const button = await screen.findByRole("link", {name: /Edit specification/}) as HTMLAnchorElement;
                expect(button).toBeInTheDocument();
                expect(button.getAttribute("href")).toBe("/Specifications/EditSpecification/SPEC123");
            });

            it('shows Variations tab given specification is not chosen for funding', async () => {
                await waitFor(() => {
                    expect(screen.getByText('Variations')).toBeVisible()
                });
            });

            it('shows that the specification is converter wizard enabled', async () => {
                await waitFor(() => {
                    expect(screen.getByText('In year opener enabled')).toBeVisible()
                });
            });
        });
    });

    describe("with ApproveAllCalculations permission ", () => {
        it("it calls correct services given approve all calculations button is clicked", async () => {
            testData.mockSpecificationPermissions();
            testData.mockSpecificationService();
            testData.mockFundingLineStructureService();
            testData.mockDatasetBySpecificationIdService();
            testData.mockCalculationService();
            testData.mockPublishService();
            await testData.renderViewSpecificationPage();
            const {getCalculationSummaryBySpecificationId} = require("../../../services/calculationService");

            const approveAllCalcsButton = await screen.findByTestId(`approve-calculations`);
            userEvent.click(approveAllCalcsButton);

            await waitFor(() => expect(getCalculationSummaryBySpecificationId).toBeCalled());
        });
    });

    describe("without ApproveAllCalculations permission ", () => {
        it("shows permission message when approve all calculations button is clicked", async () => {
            const withoutPermissions: SpecificationPermissionsResult = {
                userId: "3456",
                isCheckingForPermissions: false,
                hasPermission: (perm: Permission) => false,
                hasMissingPermissions: true,
                isPermissionsFetched: true,
                permissionsEnabled: [],
                permissionsDisabled: [Permission.CanApproveAllCalculations],
                missingPermissions: [Permission.CanApproveAllCalculations],
            };
            testData.mockSpecificationPermissions(withoutPermissions);
            testData.mockSpecificationService();
            testData.mockFundingLineStructureService();
            testData.mockDatasetBySpecificationIdService();
            testData.mockCalculationService();
            testData.mockPublishService();
            await testData.renderViewSpecificationPage();

            const approveAllCalcsButton = await screen.findByTestId(`approve-calculations`);
            userEvent.click(approveAllCalcsButton);

            await waitFor(() => expect(screen.getByText("You don't have permission to approve calculations")).toBeInTheDocument());
        });
    });

    describe('with a specification job  ', () => {
        beforeEach(async () => {
            testData.mockSpecificationPermissions();
            testData.mockSpecificationService();
            testData.mockFundingLineStructureService();
            testData.mockDatasetBySpecificationIdService();
            testData.mockCalculationService();
            testData.mockPublishService();
            testData.fundingConfigurationSpy();
            testData.jobMonitorSpy.mockImplementation(() => {
                return {
                    hasJob: true,
                    isCheckingForJob: false,
                    latestJob: {
                        isComplete: true,
                        jobId: "123",
                        statusDescription: "string",
                        jobDescription: "Converter Job",
                        runningStatus: RunningStatus.InProgress,
                        failures: [],
                        isSuccessful: true,
                        isFailed: true,
                        isActive: false,
                    },
                    isFetched: true,
                    isFetching: false,
                    isMonitoring: false
                }
            });
            await testData.renderViewSpecificationPage();

        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('shows job details', async () => {
            await waitFor(() => {
                expect((screen.getByTestId('job-notification-title') as HTMLSpanElement).textContent).toContain("Converter Job");
            });

        });
    });
});
