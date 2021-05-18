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
    describe('choosing approved specification for funding ', () => {
        beforeEach(async () => {
            testData.hasNoJobObserverState();
            testData.mockSpecificationPermissions();
            testData.mockApprovedSpecificationService();
            testData.mockFundingLineStructureService();
            testData.mockDatasetBySpecificationIdService();
            testData.mockCalculationService();
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

        it("calls refresh specification service given user is allowed to choose specification", async () => {
            const {refreshSpecificationFundingService} = require("../../../services/publishService");
            const chooseForFundingButton = await screen.findByTestId(`choose-for-funding`);
            userEvent.click(chooseForFundingButton);
            const modalContinueButton = await screen.findByTestId(`confirm-modal-continue-button`) as HTMLButtonElement;

            await waitFor(() => {
                userEvent.click(modalContinueButton);
                expect(refreshSpecificationFundingService).toBeCalledTimes(1);
            });
        });

        it("shows error given refresh job is not successful", async () => {
            const {refreshSpecificationFundingService} = require("../../../services/publishService");
            const chooseForFundingButton = await screen.findByTestId(`choose-for-funding`);
            userEvent.click(chooseForFundingButton);
            const modalContinueButton = await screen.findByTestId(`confirm-modal-continue-button`) as HTMLButtonElement;

            await waitFor(() => {
                userEvent.click(modalContinueButton);
                expect(refreshSpecificationFundingService).toBeCalledTimes(1);
                testData.sendFailedJobNotification();
            });

            expect(screen.getByText(`Error while choosing specification for funding`)).toBeInTheDocument();
        });
    });
});