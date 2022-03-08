import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { ProvidersForFundingApprovalProps } from "../../../pages/FundingManagement/Approvals/ProvidersForFundingApproval";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { buildInitialPublishedProviderSearchRequest } from "../../../types/publishedProviderSearchRequest";
import { fakery } from "../../fakes/fakery";
import { hasFullSpecPermissions } from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import {
  jobSubscriptionTestUtils,
  reduxMockingUtils,
  usePublishedProviderErrorSearchUtils,
  usePublishedProviderSearchUtils,
  useSpecificationSummaryUtils,
} from "../../testing-utils";
import { useFundingConfigurationUtils } from "../../testing-utils/useFundingConfigurationUtils";

describe("<ProvidersForFundingApproval />", () => {
  const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});

  beforeEach(async () => {
    hasFullSpecPermissions();
    haveNoJobNotification();
    setupJobSpy();
    const state = reduxMockingUtils.createFundingSearchSelectionState({
      searchCriteria: buildInitialPublishedProviderSearchRequest(fundingStream.id, fundingPeriod.id, spec.id),
    });
    reduxMockingUtils.setupFundingSearchSelectionState(state);
    useSpecificationSummaryUtils.hasSpecification(spec);
    usePublishedProviderSearchUtils.hasSearchResults([]);
    usePublishedProviderErrorSearchUtils.hasProvidersWithoutErrors();
    useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);

    await renderPage();
  });
  afterEach(() => jest.resetAllMocks());

  it("renders Specification details", async () => {
    expect(screen.getByRole("heading", { level: 1, name: /Horse Riding/ })).toBeVisible();
    const expectedSubtitle = `${fundingStream.name} for ${fundingPeriod.name}`;
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: expectedSubtitle,
      })
    ).toBeVisible();
  });

  it("finishes loading", async () => {
    expect(screen.queryByRole("alert", { name: /Loading/ })).not.toBeInTheDocument();
  });

  it("secondary nav: renders upload batch link", async () => {
    expect(screen.getByRole("link", { name: /Upload batch of providers/ })).toBeVisible();
  });

  it("secondary nav: renders Release management link", async () => {
    expect(screen.getByRole("link", { name: /Release management/ })).toBeVisible();
  });

  it("secondary nav: renders Manage specification link", async () => {
    expect(screen.getByRole("link", { name: /Manage specification/ })).toBeVisible();
  });

  it("secondary nav: renders Specification reports link", async () => {
    expect(screen.getByRole("link", { name: /Specification reports/ })).toBeVisible();
  });
});

const fundingStream = fakery.makeFundingStream();
const fundingPeriod = fakery.makeFundingPeriod();
const spec = fakery.makeSpecificationSummary({
  name: "Horse Riding",
  fundingStreams: [fundingStream],
  fundingPeriod,
});
const fundingConfig = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  approvalMode: ApprovalMode.Batches,
});

const renderPage = async () => {
  const {
    ProvidersForFundingApproval,
  } = require("../../../pages/FundingManagement/Approvals/ProvidersForFundingApproval");
  reduxMockingUtils.store.dispatch = jest.fn();
  render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <Provider store={reduxMockingUtils.store}>
          <ProvidersForFundingApproval
            location={location}
            history={history}
            match={fakery.makeMatch<ProvidersForFundingApprovalProps>({
              specificationId: spec.id,
              fundingStreamId: fundingConfig.fundingStreamId,
              fundingPeriodId: fundingConfig.fundingPeriodId,
            })}
          />
        </Provider>
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
};
