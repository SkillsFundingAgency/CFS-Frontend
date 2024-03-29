import { render, screen, within } from "@testing-library/react";
import { createBrowserHistory, createLocation } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import * as redux from "react-redux";
import { Provider } from "react-redux";
import { match, MemoryRouter } from "react-router";
import { createStore, Store } from "redux";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import * as providerVersionHook from "../../../hooks/Providers/useProviderVersion";
import { ProviderVersionQueryResult } from "../../../hooks/Providers/useProviderVersion";
import * as specHook from "../../../hooks/useSpecificationSummary";
import { SpecificationSummaryQueryResult } from "../../../hooks/useSpecificationSummary";
import { ProviderFundingOverviewRoute } from "../../../pages/FundingManagement/ProviderFundingOverview";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { FeatureFlagsState } from "../../../states/FeatureFlagsState";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";
import { fakery } from "../../fakes/fakery";

describe("<ProviderFundingOverview/> when profilingPatternVisible false", () => {
  beforeEach(() => {
    hasSpecification();
    hasProvider();
    const featureFlagsState: FeatureFlagsState = {
      profilingPatternVisible: false,
      releaseTimetableVisible: false,
      templateBuilderVisible: false,
      enableReactQueryDevTool: false,
      specToSpec: false,
      enableNewFundingManagement: false,
    };
    useSelectorSpy.mockReturnValue(featureFlagsState);

    renderPage();
  });

  it("does not render any errors", async () => {
    expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
  });

  it("renders the specification name", async () => {
    const item = screen.getByRole("definition", { name: /Specification/ });
    expect(within(item).getByText(testSpec.name)).toBeInTheDocument();
  });

  it("renders the funding stream and period name", async () => {
    expect(
      screen.getByText(testSpec.fundingStreams[0].name + " for " + testSpec.fundingPeriod.name)
    ).toBeInTheDocument();
  });

  it("renders the Provider name", async () => {
    jest.mock("../../../services/providerService");
    const getProviderByIdAndVersionService = jest.fn();
    getProviderByIdAndVersionService.mockResolvedValue({ data: testProvider });
    expect(await screen.findByText(/Hogwarts School of Witchcraft and Wizardry/)).toBeInTheDocument();
  });

  it("renders funding stream history tab as active", async () => {
    expect(screen.getByTestId("tab-funding-stream-history")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("tab-funding-stream-history")).getByText(/funding stream history/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("tab-funding-stream-history")).toBeInTheDocument();
  });

  it("renders profiling tab as inactive", () => {
    expect(screen.getByTestId("tab-profiling")).toBeInTheDocument();
    expect(within(screen.getByTestId("tab-profiling")).getByText("Profiling")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-panel-profiling")).not.toBeInTheDocument();
  });

  it("renders calculations tab as inactive", () => {
    expect(screen.getByTestId("tab-calculations")).toBeInTheDocument();
    expect(within(screen.getByTestId("tab-calculations")).getByText("Calculations")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-panel-calculations")).not.toBeInTheDocument();
  });

  it("does not render profiling patterns", () => {
    expect(
      within(screen.getByTestId("tab-profiling")).queryByText(
        /View and makes changes to profile patterns by funding line/
      )
    ).not.toBeInTheDocument();
  });
});

describe("<ProviderFundingOverview/> when profilingPatternVisible true", () => {
  beforeEach(() => {
    hasSpecification();
    hasProvider();
    const featureFlagsState: FeatureFlagsState = {
      profilingPatternVisible: true,
      releaseTimetableVisible: false,
      templateBuilderVisible: false,
      enableReactQueryDevTool: false,
      specToSpec: false,
      enableNewFundingManagement: false,
    };
    useSelectorSpy.mockReturnValue(featureFlagsState);

    renderPage();
  });

  it("does not render any errors", async () => {
    expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
  });

  it("renders funding stream history tab as active", async () => {
    expect(screen.getByTestId("tab-funding-stream-history")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("tab-funding-stream-history")).getByText(/funding stream history/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("tab-panel-funding-stream-history")).toBeInTheDocument();
    expect(screen.getByText(/Funding Updated/)).toBeInTheDocument();
    expect(screen.getByText(/Profiling Updated/)).toBeInTheDocument();
  });

  it("renders profiling patterns tab as inactive", () => {
    expect(screen.getByTestId("tab-profiling")).toBeInTheDocument();
    expect(within(screen.getByTestId("tab-profiling")).getByText("Profiling")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-panel-profiling")).not.toBeInTheDocument();
  });
});

jest.mock("../../../services/fundingLineDetailsService", () => ({
  getCurrentProfileConfigService: jest.fn(),
}));

jest.mock("../../../services/providerService", () => ({
  getReleasedProviderTransactionsService: jest.fn(() =>
    Promise.resolve({
      data: {
        results: [
          {
            status: "Draft",
            author: "Robert SPARKS",
            dateChanged: "22 March 2021 at 7:51 PM",
            fundingStreamValue: "£92,540,428.00",
            variationReasons: ["FundingUpdated", "ProfilingUpdated"],
          },
        ],
        fundingTotal: "£92,540,428.00",
        latestStatus: "Draft",
      },
      status: 200,
    })
  ),
  getReleasedProfileTotalsService: jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 200,
    })
  ),
  getFundingStructureResultsForProviderAndSpecification: jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 200,
    })
  ),
}));

const history = createBrowserHistory();
const location = createLocation("", "", "", { search: "", pathname: "", hash: "", key: "", state: "" });
const useSelectorSpy = jest.spyOn(redux, "useSelector");
const store: Store<IStoreState> = createStore(rootReducer);
const fundingStream: FundingStream = {
  name: "FS123",
  id: "Wizard Training Scheme",
};
const fundingPeriod: FundingPeriod = {
  id: "FP123",
  name: "2019-20",
};
const testSpec: SpecificationSummary = {
  name: "Wizard Training",
  approvalStatus: "",
  description: "",
  fundingPeriod: fundingPeriod,
  fundingStreams: [fundingStream],
  id: "ABC123",
  isSelectedForFunding: true,
  providerVersionId: "",
  dataDefinitionRelationshipIds: [],
  templateIds: {},
  coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
};
const specResult: SpecificationSummaryQueryResult = {
  clearSpecificationFromCache: () => Promise.resolve(),
  specification: testSpec,
  isLoadingSpecification: false,
  errorCheckingForSpecification: null,
  haveErrorCheckingForSpecification: false,
  isFetchingSpecification: false,
  isSpecificationFetched: true,
};
const testProvider = fakery.makeProviderSummary({});
const providerResult: ProviderVersionQueryResult = {
  providerVersion: testProvider,
  isLoadingProviderVersion: false,
  errorLoadingProviderVersion: null,
  isErrorLoadingProviderVersion: false,
  isFetchingProviderVersion: false,
};
const matchMock: match<ProviderFundingOverviewRoute> = {
  params: {
    actionType: FundingActionType.Approve,
    providerId: testProvider.providerId,
    specificationId: testSpec.id,
    specCoreProviderVersionId: "provider-version-id-123",
  },
  isExact: true,
  path: "",
  url: "",
};
const renderPage = () => {
  const { ProviderFundingOverview } = require("../../../pages/FundingManagement/ProviderFundingOverview");
  store.dispatch = jest.fn();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <ErrorContextWrapper>
          <Provider store={store}>
            <ProviderFundingOverview location={location} history={history} match={matchMock} />
          </Provider>
        </ErrorContextWrapper>
      </QueryClientProvider>
    </MemoryRouter>
  );
};
const hasSpecification = () =>
  jest.spyOn(specHook, "useSpecificationSummary").mockImplementation(() => specResult);
const hasProvider = () =>
  jest.spyOn(providerVersionHook, "useProviderVersion").mockImplementation(() => providerResult);
store.dispatch = jest.fn();
