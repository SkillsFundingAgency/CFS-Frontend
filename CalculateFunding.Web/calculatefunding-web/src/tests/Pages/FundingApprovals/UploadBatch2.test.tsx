import React from 'react';
import {match, MemoryRouter} from "react-router";
import {createLocation} from "history";
import {render, screen, waitFor, waitForElementToBeRemoved, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {QueryCache, ReactQueryCacheProvider} from "react-query";
import {UploadBatch, UploadBatchRouteProps} from "../../../pages/FundingApprovals/UploadBatch";
import userEvent from "@testing-library/user-event";
import * as redux from "react-redux";
import {FundingApprovalTestSetup} from "./FundingApprovalTestSetup";
const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const mockHistory = {push: jest.fn()};
const location = createLocation("", "", "");
const store: Store<IStoreState> = createStore(rootReducer);
const testData = FundingApprovalTestSetup();
const mockRoute: match<UploadBatchRouteProps> = {
    params: {
        specificationId: testData.testSpec2.id,
        fundingStreamId: testData.fundingStream2.id,
        fundingPeriodId: testData.fundingPeriod2.id
    },
    url: "",
    path: "",
    isExact: true,
};
const renderPage = () => {
    const {UploadBatch} = require('../../../pages/FundingApprovals/UploadBatch');
    store.dispatch = jest.fn();
    return render(<MemoryRouter>
        <ReactQueryCacheProvider queryCache={new QueryCache()}>
            <Provider store={store}>
                <UploadBatch location={location} history={mockHistory} match={mockRoute}/>
            </Provider>
        </ReactQueryCacheProvider>
    </MemoryRouter>);
};

describe("<UploadBatch />", () => {

    describe("<UploadBatch /> when user approves batch file upload", () => {
        const file = new File(['hello'], 'hello.png', {type: 'image/png'})
        beforeEach(async () => {
            testData.hasNoActiveJobsRunning();
            testData.hasFundingConfigWithApproveBatchMode();
            testData.mockPublishedProviderService();
            testData.hasLatestJob(testData.successfulValidationJob);

            renderPage();

            const input = await screen.getByLabelText(/Upload an XLSX file/);
            userEvent.upload(input, file);

            const button = screen.getByRole("button", {name: /Approve funding/});
            userEvent.click(button);
            await waitForElementToBeRemoved(screen.getByTestId("loader"))
        });
        afterEach(() => jest.clearAllMocks());

        it('disables file upload input', async () => {
            const input = await screen.getByLabelText(/Upload an XLSX file/);
            expect(input).toBeInTheDocument();
            expect(input).toBeDisabled();
        });

        it('disables approve button', async () => {
            const button = screen.getByRole("button", {name: /Approve funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it('disables release button', async () => {
            const button = screen.getByRole("button", {name: /Release funding/});
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it('calls api to upload file', async () => {
            await waitFor(() => expect(testData.mockUploadFileService)
                .toHaveBeenCalledWith(file));
        });

        it('calls api to create batch validation job', async () => {
            await waitFor(() => expect(testData.mockCreateValidationJobService)
                .toHaveBeenCalledWith({
                    batchId: "asdgasfgwer",
                    fundingPeriodId: testData.fundingPeriod2.id,
                    fundingStreamId: testData.fundingStream2.id,
                    specificationId: testData.testSpec2.id
                }));
        });
    });
});



