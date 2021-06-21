import React from "react";
import {act, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ViewSpecificationTestData} from "./ViewSpecificationTestData";
import {JobNotification} from "../../../hooks/Jobs/useJobSubscription";


describe('<ViewSpecification /> ', () => {
    const testData = ViewSpecificationTestData();
    describe('choosing approved specification for funding ', () => {
        beforeEach(async () => {
            testData.hasNoJobObserverState();
            testData.mockSpecificationPermissions();
            testData.mockApprovedSpecificationService();
            testData.mockFundingLineStructureService();
            testData.mockDatasetBySpecificationIdService();
            testData.mockCalculationService();
            testData.mockPublishService();
            testData.fundingConfigurationSpy();
            testData.haveNoJobNotification();
            testData.hasNoLatestJob();
            testData.hasNoCalcErrors();
            await testData.renderViewApprovedSpecificationPage();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("shows error when refresh job fails", async () => {
            const {refreshSpecificationFundingService} = require("../../../services/publishService");
            const chooseForFundingButton = await screen.findByTestId(`choose-for-funding`);
            userEvent.click(chooseForFundingButton);
            
            const modalContinueButton = await screen.findByTestId(`confirm-modal-continue-button`) as HTMLButtonElement;
            userEvent.click(modalContinueButton);

            await waitFor(() => expect(refreshSpecificationFundingService).toBeCalledTimes(1));

            act(() => {
                const notification: JobNotification = testData.haveRefreshFailedJobNotification();
                testData.getNotificationCallback()(notification);
            });

            const errorNotification = await screen.findByTestId("error-summary");
            expect(errorNotification).toBeInTheDocument();
            expect(within(errorNotification as HTMLElement).getByText(/Failed to choose specification for funding/)).toBeInTheDocument();
        });
    });
});