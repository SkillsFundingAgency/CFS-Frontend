import React from "react";
import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {ViewSpecificationTestData} from "./ViewSpecificationTestData";

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useSelector: jest.fn(() => ({
        releaseTimetableVisible: false
    }))
}));

const testData = ViewSpecificationTestData();

describe('<ViewSpecification /> ', () => {
    describe('choosing approved specification for funding ', () => {
        beforeEach(async () => {
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