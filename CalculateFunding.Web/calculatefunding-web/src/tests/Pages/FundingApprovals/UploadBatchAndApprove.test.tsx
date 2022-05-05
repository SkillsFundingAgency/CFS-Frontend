import "@testing-library/jest-dom/extend-expect";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createLocation } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import * as redux from "react-redux";
import { match, MemoryRouter } from "react-router";
import { createStore, Store } from "redux";

import { UploadBatchRouteProps } from "../../../pages/FundingApprovals/UploadBatchOld";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { FundingApprovalTestSetup } from "./FundingApprovalTestSetup";

const mockHistory = { push: jest.fn() };
const location = createLocation("", "", "");
const store: Store<IStoreState> = createStore(rootReducer);
const testData = FundingApprovalTestSetup();
const mockRoute: match<UploadBatchRouteProps> = {
  params: {
    specificationId: testData.testSpec2.id,
    fundingStreamId: testData.fundingStream2.id,
    fundingPeriodId: testData.fundingPeriod2.id,
  },
  url: "",
  path: "",
  isExact: true,
};
const renderPage = () => {
  const { UploadBatchOld } = require("../../../pages/FundingApprovals/UploadBatchOld");
  store.dispatch = jest.fn();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <UploadBatchOld location={location} history={mockHistory} match={mockRoute} />
        </Provider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};
const useDispatchSpy = jest.spyOn(redux, "useDispatch");

describe("<UploadBatch />", () => {
  describe("<UploadBatch /> when user approves batch file upload", () => {
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    beforeEach(async () => {
      testData.hasNoActiveJobsRunning();
      testData.hasFundingConfigWithApproveBatchMode();
      testData.mockPublishedProviderService();
      testData.hasLatestJob(testData.successfulValidationJob);
      testData.hasSpecification();

      renderPage();

      const input = await screen.getByLabelText(/Upload an XLSX file/);
      userEvent.upload(input, file);

      const button = screen.getByRole("button", { name: /Approve funding/ });
      await userEvent.click(button);

      await waitFor(() => expect(useDispatchSpy).toBeCalled());
    });
    afterEach(() => jest.clearAllMocks());

    it("does not render file upload input", async () => {
      expect(screen.queryByText(/Upload an XLSX file/)).not.toBeInTheDocument();
    });

    it("does not render approve button", async () => {
      expect(screen.queryByText(/Approve funding/)).not.toBeInTheDocument();
    });

    it("does not render release button", async () => {
      expect(screen.queryByText(/Release funding/)).not.toBeInTheDocument();
    });

    it("calls api to upload file", async () => {
      await waitFor(() => expect(testData.mockUploadFileService).toHaveBeenCalledWith(file));
    });

    it("calls api to create batch validation job", async () => {
      await waitFor(() =>
        expect(testData.mockCreateValidationJobService).toHaveBeenCalledWith({
          batchId: "asdgasfgwer",
          fundingPeriodId: testData.fundingPeriod2.id,
          fundingStreamId: testData.fundingStream2.id,
          specificationId: testData.testSpec2.id,
        })
      );
    });

    it("calls api to get selected providers", async () => {
      await waitFor(() => expect(testData.mockGetPublishedProvidersByBatchService).toHaveBeenCalled());
    });
  });
});
