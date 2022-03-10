import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";

import { PurposeOfFundingReleaseProps } from "../../../pages/FundingManagement/Releases/PurposeOfFundingRelease";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { fakery } from "../../fakes/fakery";
import { hasFullSpecPermissions } from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import { useSpecificationSummaryUtils } from "../../testing-utils";
import { useFundingConfigurationUtils } from "../../testing-utils/useFundingConfigurationUtils";

describe("<PurposeOfFundingRelease />", () => {
  describe("<PurposeOfFundingRelease /> with no channels", () => {
    beforeEach(async () => {
      hasFullSpecPermissions();
      useSpecificationSummaryUtils.hasSpecification(spec);
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfigWithoutChannels);

      await renderPage();
    });
    afterEach(() => jest.resetAllMocks());

    it("renders heading", async () => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /For which purposes would you like to release?/,
        })
      ).toBeVisible();
    });

    it("finishes loading", async () => {
      expect(screen.queryByRole("heading", { name: /Loading/ })).not.toBeInTheDocument();
    });

    it("shows warning text", async () => {
      expect(
        screen.getByRole("alert", {
          name: /There are no release purposes configured for the selected funding stream and funding period./,
        })
      ).toBeVisible();
    });

    it("hides continue button", async () => {
      expect(screen.queryByRole("button", { name: /continue/i })).not.toBeInTheDocument();
    });

    it("shows cancel button", async () => {
      expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
    });
  });

  describe("<PurposeOfFundingRelease /> with release channels", () => {
    beforeEach(async () => {
      hasFullSpecPermissions();
      useSpecificationSummaryUtils.hasSpecification(spec);
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfigWithChannels);

      await renderPage();
    });
    afterEach(() => jest.resetAllMocks());

    it("renders heading", async () => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /For which purposes would you like to release?/,
        })
      ).toBeVisible();
    });

    it("finishes loading", async () => {
      expect(screen.queryByRole("heading", { name: /Loading/ })).not.toBeInTheDocument();
    });

    it("shows no warning text", async () => {
      expect(
        screen.queryByRole("alert", {
          name: /There are no release purposes configured for the selected funding stream and funding period./,
        })
      ).not.toBeInTheDocument();
    });

    it("shows correct number of channel options", async () => {
      expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    });

    it("shows correct channel option", async () => {
      expect(screen.getByRole("checkbox", { name: /channel-A/i })).toBeVisible();
    });

    it("does not show channel option set to invisible", async () => {
      expect(screen.queryByRole("checkbox", { name: /channel-invisible/i })).not.toBeInTheDocument();
    });

    it("shows continue button", async () => {
      expect(screen.getByRole("button", { name: /continue/i })).toBeVisible();
    });

    it("shows cancel button", async () => {
      expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
    });
  });
});

const fundingStream = fakery.makeFundingStream();
const fundingPeriod = fakery.makeFundingPeriod();
const spec = fakery.makeSpecificationSummary({
  name: "Horse Riding",
  fundingStreams: [fundingStream],
  fundingPeriod,
});
const fundingConfigWithoutChannels = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  approvalMode: ApprovalMode.Batches,
  releaseChannels: undefined,
});
const fundingConfigWithChannels = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  approvalMode: ApprovalMode.Batches,
  releaseChannels: [
    { channelCode: "channel-A", isVisible: true },
    { channelCode: "channel-invisible", isVisible: false },
  ],
});

const renderPage = async () => {
  const {
    PurposeOfFundingRelease,
  } = require("../../../pages/FundingManagement/Releases/PurposeOfFundingRelease");
  render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <PurposeOfFundingRelease
          location={location}
          history={history}
          match={fakery.makeMatch<PurposeOfFundingReleaseProps>({
            specificationId: spec.id,
            fundingStreamId: fundingStream.id,
            fundingPeriodId: fundingPeriod.id,
          })}
        />
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
};
