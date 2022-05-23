import { render, screen, within } from "@testing-library/react";
import React from "react";
import * as redux from "react-redux";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { createStore, Store } from "redux";

import { ProviderFundingProfilingPatternsProps } from "../../../components/Funding/ProviderFundingProfilingPatterns";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { FeatureFlagsState } from "../../../states/FeatureFlagsState";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { FundingApprovalTestData } from "../../Pages/FundingManagement/FundingApprovalTestData";

const useSelectorSpy = jest.spyOn(redux, "useSelector");
const store: Store<IStoreState> = createStore(rootReducer);
const renderComponent = (inputs: ProviderFundingProfilingPatternsProps) => {
  const {
    ProviderFundingProfilingPatterns,
  } = require("../../../components/Funding/ProviderFundingProfilingPatterns");
  store.dispatch = jest.fn();
  return render(
    <MemoryRouter>
      <Provider store={store}>
        <ProviderFundingProfilingPatterns {...inputs} />
      </Provider>
    </MemoryRouter>
  );
};

const test = FundingApprovalTestData();

describe("<ProviderFundingProfilingPatterns/> tests", () => {
  describe("with full profiling data", () => {
    const props: ProviderFundingProfilingPatternsProps = {
      actionType: FundingActionType.Approve,
      specification: test.testSpec,
      providerId: test.provider1.publishedProviderVersionId,
      specCoreProviderVersionId: test.testSpec.providerVersionId,
      profilingPatterns: [test.fundingLineProfile1],
    };

    beforeEach(() => {
      const featureFlagsState: FeatureFlagsState = {
        profilingPatternVisible: false,
        releaseTimetableVisible: false,
        templateBuilderVisible: false,
        enableReactQueryDevTool: false,
        specToSpec: false,
        enableNewFundingManagement: false,
      };
      useSelectorSpy.mockReturnValue(featureFlagsState);
      renderComponent(props);
    });

    it("renders funding line profiling table", async () => {
      expect(screen.getByTestId("profiling-table")).toBeInTheDocument();
    });

    it("renders funding line name", async () => {
      expect(
        screen.getByRole("rowheader", {
          name: `${props.profilingPatterns[0].fundingLineName} (${props.profilingPatterns[0].fundingLineCode})`,
          exact: false,
        })
      ).toBeInTheDocument();
    });

    it("renders pattern type", async () => {
      expect(
        screen.getByRole("cell", { name: props.profilingPatterns[0].profilePatternName })
      ).toBeInTheDocument();
    });

    it("renders total allocation", async () => {
      expect(screen.getByRole("cell", { name: /£895,436.74/ })).toBeInTheDocument();
    });

    it("renders link", async () => {
      const link = screen.getByRole("link", {
        name: `${props.profilingPatterns[0].fundingLineName} (${props.profilingPatterns[0].fundingLineCode})`,
      }) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.getAttribute("href")).toBe(
        `/Approvals/ProviderFundingOverview/${props.specification.id}/${props.providerId}/${props.specCoreProviderVersionId}/${props.specification.fundingStreams[0].id}/${props.specification.fundingPeriod.id}/${props.profilingPatterns[0].fundingLineCode}/view`
      );
    });
  });

  describe("with null total allocation", () => {
    const props: ProviderFundingProfilingPatternsProps = {
      actionType: FundingActionType.Approve,
      specification: test.testSpec,
      providerId: test.provider1.publishedProviderVersionId,
      specCoreProviderVersionId: test.testSpec.providerVersionId,
      profilingPatterns: [test.fundingLineProfileWithMissingTotalAllocation],
    };
    beforeEach(() => {
      const featureFlagsState: FeatureFlagsState = {
        profilingPatternVisible: false,
        releaseTimetableVisible: false,
        templateBuilderVisible: false,
        enableReactQueryDevTool: false,
        specToSpec: false,
        enableNewFundingManagement: false,
      };
      useSelectorSpy.mockReturnValue(featureFlagsState);
      renderComponent(props);
    });

    it("renders funding line name", async () => {
      const table = screen.getByTestId("profiling-table");
      expect(table).toBeInTheDocument();
      expect(
        within(table).getByRole("rowheader", {
          name: `${props.profilingPatterns[0].fundingLineName} (${props.profilingPatterns[0].fundingLineCode})`,
        })
      ).toBeInTheDocument();
    });

    it("does not render pattern type", async () => {
      expect(
        screen.queryByRole("cell", { name: props.profilingPatterns[0].profilePatternName })
      ).not.toBeInTheDocument();
    });

    it("renders total allocation as excluded", async () => {
      expect(screen.getByRole("cell", { name: /Excluded/ })).toBeInTheDocument();
    });

    it("does not render link", async () => {
      expect(screen.queryByRole("link", { name: /View/ })).not.toBeInTheDocument();
    });
  });

  describe("with profiling funding line error", () => {
    const props: ProviderFundingProfilingPatternsProps = {
      actionType: FundingActionType.Approve,
      specification: test.testSpec,
      providerId: test.provider1.publishedProviderVersionId,
      specCoreProviderVersionId: test.testSpec.providerVersionId,
      profilingPatterns: [test.fundingLineWithError],
    };
    beforeEach(() => {
      const featureFlagsState: FeatureFlagsState = {
        profilingPatternVisible: false,
        releaseTimetableVisible: false,
        templateBuilderVisible: false,
        enableReactQueryDevTool: false,
        specToSpec: false,
        enableNewFundingManagement: false,
      };
      useSelectorSpy.mockReturnValue(featureFlagsState);
      renderComponent(props);
    });

    it("renders funding line profiling table with error on funding line", async () => {
      expect(screen.getByTestId("profiling-table")).toBeInTheDocument();
      expect(screen.findByText(/There is an error with this funding line/));
    });
  });
});
