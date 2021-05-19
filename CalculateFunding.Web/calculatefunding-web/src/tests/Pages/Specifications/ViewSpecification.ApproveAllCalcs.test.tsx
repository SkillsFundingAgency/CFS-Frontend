import React from "react";
import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {ViewSpecificationTestData} from "./ViewSpecificationTestData";
import {CalculationErrorQueryResult, ObsoleteItemType} from "../../../types/Calculations/CalculationError";
import * as useCalculationErrorsHook from "../../../hooks/Calculations/useCalculationErrors";

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
    calculationErrorCount: 0,
    errorCheckingForCalculationErrors: null,
    calculationErrors: [{
        title: 'title',
        templateCalculations: [],
        codeReference: "",
        enumValueName: "",
        fundingLineId: 1,
        additionalCalculations: [],
        fundingStreamId: "",
        id: "",
        itemType: ObsoleteItemType.Calculation,
        specificationId: "Spec123",
        templateCalculationId: 1
    }],
    isLoadingCalculationErrors: false,
    haveErrorCheckingForCalculationErrors: false,
    areCalculationErrorsFetched: false,
    isFetchingCalculationErrors: false
}

jest.spyOn(useCalculationErrorsHook, 'useCalculationErrors').mockImplementation(() => (calculationErrorsResult));

const testData = ViewSpecificationTestData();

describe('<ViewSpecification /> ', () => {
    describe('approving all calcs', () => {
        beforeEach(async () => {
            testData.hasNoJobObserverState();
            testData.mockSpecificationPermissions();
            testData.mockApprovedSpecificationService();
            testData.mockFundingLineStructureService();
            testData.mockDatasetBySpecificationIdService();
            testData.mockCalculationWithDraftCalculationsService();
            testData.mockPublishService();
            testData.jobMonitorSpy.mockImplementation(() => {
                return {
                    hasJob: false,
                    isCheckingForJob: false,
                    latestJob: undefined,
                    isFetched: true,
                    isFetching: false,
                    isMonitoring: false,
                }
            });
            await testData.renderViewApprovedSpecificationPage();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("calls approve all calculations when calculations need approval", async () => {
            const {getCalculationSummaryBySpecificationId} = require("../../../services/calculationService");
            const approveAllCalculationsButton = await screen.findByTestId(`approve-calculations`);
            userEvent.click(approveAllCalculationsButton);
            const modalContinueButton = await screen.findByTestId(`confirm-modal-continue-button`) as HTMLButtonElement;
            await waitFor(() => {
                userEvent.click(modalContinueButton);
                expect(getCalculationSummaryBySpecificationId).toBeCalledTimes(3);
            });
        });
    });
});