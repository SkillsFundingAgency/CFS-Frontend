import { render, screen, within } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";

import { ProviderFundingProfilingProps } from "../../../components/Funding/ProviderFundingProfilingPatterns";
import { FundingApprovalTestData } from "../../Pages/FundingApprovals/FundingApprovalTestData";

const renderComponent = (inputs: ProviderFundingProfilingProps) => {
  const {
    ProviderFundingProfilingPatterns,
  } = require("../../../components/Funding/ProviderFundingProfilingPatterns");
  return render(
    <MemoryRouter>
      <ProviderFundingProfilingPatterns
        routeParams={inputs.routeParams}
        profilingPatterns={inputs.profilingPatterns}
      />
    </MemoryRouter>
  );
};

const test = FundingApprovalTestData();

describe("<ProviderFundingProfilingPatterns/> tests", () => {
  describe("with full profiling data", () => {
    const props: ProviderFundingProfilingProps = {
      routeParams: {
        specificationId: test.provider1.specificationId,
        fundingStreamId: test.provider1.fundingStreamId,
        fundingPeriodId: test.provider1.fundingPeriodId,
        providerId: test.provider1.publishedProviderVersionId,
        specCoreProviderVersionId: test.testSpec.providerVersionId,
      },
      profilingPatterns: [test.fundingLineProfile1],
    };

    beforeEach(() => {
      renderComponent(props);
    });

    it("renders funding line profiling table", async () => {
      expect(screen.getByTestId("profiling-table")).toBeInTheDocument();
    });

    it("renders funding line name", async () => {
      expect(
        screen.getByRole("rowheader", { name: `${props.profilingPatterns[0].fundingLineName} (${props.profilingPatterns[0].fundingLineCode})`, exact: false })
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
      const link = screen.getByRole("link", { name: `${props.profilingPatterns[0].fundingLineName} (${props.profilingPatterns[0].fundingLineCode})` }) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.getAttribute("href")).toBe(
        `/Approvals/ProviderFundingOverview/${props.routeParams.specificationId}/${props.routeParams.providerId}/${props.routeParams.specCoreProviderVersionId}/${props.routeParams.fundingStreamId}/${props.routeParams.fundingPeriodId}/${props.profilingPatterns[0].fundingLineCode}/view`
      );
    });
  });

  describe("with null total allocation", () => {
    const props: ProviderFundingProfilingProps = {
      routeParams: {
        specificationId: test.provider1.specificationId,
        fundingStreamId: test.provider1.fundingStreamId,
        fundingPeriodId: test.provider1.fundingPeriodId,
        providerId: test.provider1.publishedProviderVersionId,
        specCoreProviderVersionId: test.testSpec.providerVersionId,
      },
      profilingPatterns: [test.fundingLineProfileWithMissingTotalAllocation],
    };
    beforeEach(() => {
      renderComponent(props);
    });

    it("renders funding line name", async () => {
      const table = screen.getByTestId("profiling-table");
      expect(table).toBeInTheDocument();
      expect(
        within(table).getByRole("rowheader", { name: `${props.profilingPatterns[0].fundingLineName} (${props.profilingPatterns[0].fundingLineCode})` })
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
    const props: ProviderFundingProfilingProps = {
      routeParams: {
        specificationId: test.provider1.specificationId,
        fundingStreamId: test.provider1.fundingStreamId,
        fundingPeriodId: test.provider1.fundingPeriodId,
        providerId: test.provider1.publishedProviderVersionId,
        specCoreProviderVersionId: test.testSpec.providerVersionId,
      },
      profilingPatterns: [test.fundingLineWithError],
    };
    beforeEach(() => {
      renderComponent(props);
    });

    it("renders funding line profiling table with error on funding line", async () => {
      expect(screen.getByTestId("profiling-table")).toBeInTheDocument();
      expect(screen.findByText(/There is an error with this funding line/));
    });
  });
});
