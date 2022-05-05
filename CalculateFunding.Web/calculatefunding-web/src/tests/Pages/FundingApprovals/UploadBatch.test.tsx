import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createLocation } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
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

describe("<UploadBatch />", () => {
  describe("<UploadBatch /> when loading normally", () => {
    beforeEach(() => {
      testData.hasNoActiveJobsRunning();
      testData.hasFundingConfigWithApproveBatchMode();
      testData.hasSpecification();
      renderPage();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders correct heading", async () => {
      expect(screen.getByRole("heading", { name: /Upload batch file/ })).toBeInTheDocument();
    });

    it("renders file upload input", async () => {
      const input = await screen.getByLabelText(/Upload an XLSX file/);
      expect(input).toBeInTheDocument();
      expect(input).toBeEnabled();
    });

    it("renders approve button as disabled", async () => {
      const button = screen.getByRole("button", { name: /Approve funding/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it("renders release button as disabled", async () => {
      const button = screen.getByRole("button", { name: /Release funding/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it("renders selected specification name", async () => {
      expect(screen.getByText("test spec name selected")).toBeInTheDocument();
    });
  });

  describe("<UploadBatch /> when user selects file to upload", () => {
    beforeEach(async () => {
      testData.hasNoActiveJobsRunning();
      testData.hasFundingConfigWithApproveBatchMode();
      testData.hasSpecification();
      const file = new File(["hello"], "hello.png", { type: "image/png" });

      renderPage();

      const input = await screen.getByLabelText(/Upload an XLSX file/);
      userEvent.upload(input, file);
    });
    afterEach(() => jest.clearAllMocks());

    it("renders file upload input", async () => {
      const input = await screen.getByLabelText(/Upload an XLSX file/);
      expect(input).toBeInTheDocument();
      expect(input).toBeEnabled();
    });

    it("renders approve button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Approve funding/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it("renders release button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Release funding/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });
  });
});
