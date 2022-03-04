import { waitFor } from "@testing-library/dom";
import { render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { Route, Switch } from "react-router-dom";
import { createStore, Store } from "redux";

import { JobSubscriptionResult } from "../../../hooks/Jobs/useJobSubscription";
import * as useJobSubscription from "../../../hooks/Jobs/useJobSubscription";
import * as selectedSpecsHook from "../../../hooks/Specifications/useSpecsSelectedForFunding";
import { SpecsSelectedForFundingResult } from "../../../hooks/Specifications/useSpecsSelectedForFunding";
import * as specHook from "../../../hooks/useSpecificationSummary";
import { SpecificationSummaryQueryResult } from "../../../hooks/useSpecificationSummary";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { RunningStatus } from "../../../types/RunningStatus";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { featureFlagsTestUtils } from "../../testing-utils";

describe("<ViewSpecificationResults />", () => {
  describe("with specification chosen for funding", () => {
    beforeEach(() => {
      setupFeatureFlags({ enableNewFundingManagement: true });
      hasCompletedJob();
      hasSpecification(testSpecChosenForFunding);
      hasSelectedSpecifications();
    });

    afterEach(jest.clearAllMocks);

    it("shows the specification name", async () => {
      renderViewSpecificationResults();
      expect(await screen.findByRole("heading", { name: testSpecChosenForFunding.name })).toBeInTheDocument();
    });

    it("shows the specification funding period", async () => {
      renderViewSpecificationResults();
      expect(await screen.findByText(testSpecChosenForFunding.fundingPeriod.name)).toBeInTheDocument();
    });

    it("shows the correct tabs", async () => {
      renderViewSpecificationResults();
      expect(screen.getByTestId("tab-fundingline-structure")).toBeInTheDocument();
      expect(screen.getByTestId("tab-additional-calculations")).toBeInTheDocument();
      expect(screen.getByTestId("tab-downloadable-reports")).toBeInTheDocument();
    });

    it("does not show error notification badge given job has not failed", async () => {
      renderViewSpecificationResults();
      await waitFor(() => {
        expect(screen.queryByTestId("notification-badge") as HTMLSpanElement).not.toBeInTheDocument();
      });
    });

    it("shows the Chosen for funding tab", async () => {
      renderViewSpecificationResults();
      expect(await screen.findByText(/Chosen for funding/)).toBeInTheDocument();
    });

    it("shows the View funding link", async () => {
      renderViewSpecificationResults();
      const link = screen.getByRole("link", { name: /Funding approvals/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        `/FundingManagement/Approve/Results/${testSpecChosenForFunding.fundingStreams[0].id}/${testSpecChosenForFunding.fundingPeriod.id}/${testSpecChosenForFunding.id}`
      );
    });

    it("renders the link to the specification results page", async () => {
      renderViewSpecificationResults();

      const link = screen.getByRole("link", { name: /Manage specification/ }) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.getAttribute("href")).toBe(`/ViewSpecification/${testSpecChosenForFunding.id}`);
    });
  });

  describe("with specification NOT chosen for funding", () => {
    beforeEach(() => {
      hasCompletedJob();
      hasSpecification(testSpecNotChosenForFunding);
    });

    afterEach(jest.clearAllMocks);

    it("shows the specification name", async () => {
      renderViewSpecificationResults();
      expect(
        await screen.findByRole("heading", { name: testSpecNotChosenForFunding.name })
      ).toBeInTheDocument();
    });

    it("does not show the View Funding Link", async () => {
      renderViewSpecificationResults();
      expect(screen.queryByRole("link", { name: /View funding/ })).not.toBeInTheDocument();
    });

    it("does not show the Chosen for funding tag", async () => {
      renderViewSpecificationResults();
      expect(screen.queryByText(/Chosen for funding/)).not.toBeInTheDocument();
    });

    it("renders the link to the specification results page", async () => {
      renderViewSpecificationResults();

      const link = screen.getByRole("link", { name: /Manage specification/ }) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.getAttribute("href")).toBe(`/ViewSpecification/${testSpecNotChosenForFunding.id}`);
    });
  });
});

const testSpecChosenForFunding: SpecificationSummary = {
  id: "ABC123",
  coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
  name: "Wizard Training",
  approvalStatus: "",
  description: "",
  fundingPeriod: {
    id: "FP123",
    name: "2019-20",
  },
  fundingStreams: [
    {
      id: "FS123",
      name: "Wizard Training Scheme",
    },
  ],
  isSelectedForFunding: true,
  providerVersionId: "",
  templateIds: {},
  dataDefinitionRelationshipIds: [],
};
const testSpecNotChosenForFunding: SpecificationSummary = {
  id: "RE2945",
  coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest,
  name: "Circuit Training",
  approvalStatus: "Approved",
  description: "",
  fundingPeriod: {
    id: "KF123",
    name: "2019-20",
  },
  fundingStreams: [
    {
      name: "RE123",
      id: "Circuit Training Scheme",
    },
  ],
  isSelectedForFunding: false,
  providerVersionId: "",
  templateIds: {},
  dataDefinitionRelationshipIds: [],
};

const completedLatestJob: JobSubscriptionResult = {
  addSub: jest.fn(),
  removeAllSubs: jest.fn(),
  removeSub: jest.fn(),
  replaceSubs:jest.fn(),
  subs: [],
  results: [{
    latestJob: {
      isComplete: true,
      jobId: "123",
      statusDescription: "string",
      jobDescription: "string",
      runningStatus: RunningStatus.Completed,
      failures: [],
      isSuccessful: true,
      isFailed: false,
      isActive: false,
    },
    subscription: {
      id: "123",
      filterBy : {},
      onError: (err) => {return err},
      isEnabled: false,
      startDate: DateTime.fromSeconds(1)
    }
  }]

}

const hasCompletedJob = () =>
  jest
    .spyOn(useJobSubscription, "useJobSubscription")
    .mockImplementation(() => completedLatestJob);

const specResult = (spec: SpecificationSummary): SpecificationSummaryQueryResult => {
  return {
    clearSpecificationFromCache: () => Promise.resolve(),
    specification: spec,
    isLoadingSpecification: false,
    errorCheckingForSpecification: null,
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: true,
  };
};

const selectedSpecsResult: SpecsSelectedForFundingResult = {
  isLoadingSpecsSelectedForFunding: false,
  specsSelectedForFunding: [
    {
      approvalStatus: "",
      dataDefinitionRelationshipIds: [],
      description: "",
      fundingPeriod: {
        id: "1",
        name: "One",
      },
      fundingStreams: [],
      isSelectedForFunding: false,
      lastEditedDate: new Date(),
      name: "",
      providerVersionId: "",
      templateIds: {},
      id: "",
    },
  ],
};

const { setupFeatureFlags } = featureFlagsTestUtils();

const hasSpecification = (spec: SpecificationSummary) =>
  jest.spyOn(specHook, "useSpecificationSummary").mockImplementation(() => specResult(spec));

const hasSelectedSpecifications = () =>
  jest.spyOn(selectedSpecsHook, "useSpecsSelectedForFunding").mockImplementation(() => selectedSpecsResult);

jest.mock("../../../components/fundingLineStructure/FundingLineResults");
jest.mock("../../../components/Calculations/AdditionalCalculations");
jest.mock("../../../components/Reports/DownloadableReports");

const store: Store<IStoreState> = createStore(rootReducer);
store.dispatch = jest.fn();

const renderViewSpecificationResults = () => {
  const { ViewSpecificationResults } = require("../../../pages/Specifications/ViewSpecificationResults");

  return render(
    <MemoryRouter
      initialEntries={[`/Specifications/ViewSpecificationResults/${testSpecChosenForFunding.id}`]}
    >
      <Provider store={store}>
        <QueryClientProvider client={new QueryClient()}>
          <Switch>
            <Route
              path="/Specifications/ViewSpecificationResults/:specificationId"
              component={ViewSpecificationResults}
            />
          </Switch>
        </QueryClientProvider>
      </Provider>
    </MemoryRouter>
  );
};
