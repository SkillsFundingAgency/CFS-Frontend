import {act, screen} from "@testing-library/react";
import {JobNotification} from "../../../hooks/Jobs/useJobSubscription";
import {ViewSpecificationTestData} from "./ViewSpecificationTestData";


const testData = ViewSpecificationTestData();

describe('<ViewSpecification /> ', () => {
    describe('with a converter wizard job in progress', () => {
        beforeEach(async () => {
            testData.mockSpecificationPermissions();
            testData.mockSpecificationService();
            testData.mockFundingLineStructureService();
            testData.mockDatasetBySpecificationIdService();
            testData.mockCalculationService();
            testData.mockPublishService();
            testData.fundingConfigurationSpy();
            testData.hasNoCalcErrors();
            testData.hasNoLatestJob();
            await testData.renderViewSpecificationPage();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('displays job details / banner', async () => {
            act(() => {
                const notification: JobNotification = testData.haveConverterJobInProgressNotification();
                testData.getNotificationCallback()(notification);
            });

            expect(await screen.findByTestId('job-notification')).toBeInTheDocument();
        });
    });
});