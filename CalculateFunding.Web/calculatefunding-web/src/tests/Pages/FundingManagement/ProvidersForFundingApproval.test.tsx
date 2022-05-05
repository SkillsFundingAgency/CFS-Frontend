import { render, screen, within } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { ProvidersForFundingApprovalProps } from "../../../pages/FundingManagement/Approvals/ProvidersForFundingApproval";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { JobType } from "../../../types/jobType";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
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
import { useLastSuccessfulJobRunUtils } from "../../testing-utils/useLastSuccessfulJobRunUtils";

describe("<ProvidersForFundingApproval /> tests", () => {
  describe("When page loads normally with result(s)", () => {
    const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});

    beforeEach(async () => {
      hasFullSpecPermissions();
      haveNoJobNotification();
      setupJobSpy();
      const state = reduxMockingUtils.createFundingSearchSelectionState({
        searchCriteria: buildInitialPublishedProviderSearchRequest({
          fundingStreamId: fundingStream.id,
          fundingPeriodId: fundingPeriod.id,
          specificationId: spec.id,
          fundingAction: FundingActionType.Approve,
        }),
      });
      reduxMockingUtils.setupFundingSearchSelectionState(state);
      useSpecificationSummaryUtils.hasSpecification(spec);
      usePublishedProviderSearchUtils.hasSearchResults([provider1]);
      usePublishedProviderErrorSearchUtils.hasProvidersWithoutErrors();
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useLastSuccessfulJobRunUtils.hasLastSuccessfulJobResult(JobType.RefreshFundingJob);

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

    it("renders provider results section", async () => {
      expect(screen.getByTestId("published-provider-results")).toBeInTheDocument();
    });

    it("renders refresh buttons as enabled", async () => {
      const buttons = screen.getAllByRole("button", { name: /Refresh funding/ });
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toBeEnabled();
    });

    it("renders approve button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Approve funding/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it("renders provider name", async () => {
      expect(await screen.findByText(provider1.providerName)).toBeInTheDocument();
    });

    it("renders provider status", async () => {
      expect(await screen.findByText(provider1.fundingStatus)).toBeInTheDocument();
    });

    it("renders the link to the specification results page", async () => {
      const link = screen.getByRole("link", { name: /Manage specification/ }) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.getAttribute("href")).toBe(`/ViewSpecification/${spec.id}`);
    });
  });

  describe("when refresh job is active", () => {
    const { haveJobInProgressNotification, setupJobSpy } = jobSubscriptionTestUtils({});

    beforeEach(async () => {
      hasFullSpecPermissions();
      haveJobInProgressNotification({ jobType: JobType.RefreshFundingJob }, {});
      setupJobSpy();
      const state = reduxMockingUtils.createFundingSearchSelectionState({
        searchCriteria: buildInitialPublishedProviderSearchRequest({
          fundingStreamId: fundingStream.id,
          fundingPeriodId: fundingPeriod.id,
          specificationId: spec.id,
          fundingAction: FundingActionType.Approve,
        }),
      });
      reduxMockingUtils.setupFundingSearchSelectionState(state);
      useSpecificationSummaryUtils.hasSpecification(spec);
      usePublishedProviderSearchUtils.hasSearchResults([]);
      usePublishedProviderErrorSearchUtils.hasProvidersWithoutErrors();
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useLastSuccessfulJobRunUtils.hasNeverHadSuccessfulJobResult();

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

    it("does not render error section", async () => {
      expect(screen.queryByRole("alert", { name: "job-notification" })).not.toBeInTheDocument();
    });

    it("renders job progress spinner", async () => {
      expect(await screen.findByTestId("loader")).toBeInTheDocument();
      expect(screen.getByText(/is in progress:/)).toBeInTheDocument();
    });

    it("does not render filters", async () => {
      expect(screen.queryByRole("radio", { name: "Provider name" })).not.toBeInTheDocument();
    });

    it("does not render results", async () => {
      expect(screen.queryByTestId("published-provider-results")).not.toBeInTheDocument();
    });
  });

  describe("when job has failed", () => {
    const { haveFailedJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});

    beforeEach(async () => {
      hasFullSpecPermissions();
      haveFailedJobNotification({ jobType: JobType.RefreshFundingJob }, {});
      setupJobSpy();
      const state = reduxMockingUtils.createFundingSearchSelectionState({
        searchCriteria: buildInitialPublishedProviderSearchRequest({
          fundingStreamId: fundingStream.id,
          fundingPeriodId: fundingPeriod.id,
          specificationId: spec.id,
          fundingAction: FundingActionType.Approve,
        }),
      });
      reduxMockingUtils.setupFundingSearchSelectionState(state);
      useSpecificationSummaryUtils.hasSpecification(spec);
      usePublishedProviderSearchUtils.hasSearchResults([provider1]);
      usePublishedProviderErrorSearchUtils.hasProvidersWithoutErrors();
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useLastSuccessfulJobRunUtils.hasNeverHadSuccessfulJobResult();

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

    it("does not render loading spinner", async () => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("renders error section", async () => {
      expect(await screen.findByTestId("job-notification-banner")).toBeInTheDocument();
    });

    it("renders job error", async () => {
      expect(await screen.findByTestId("job-notification-banner")).toBeInTheDocument();
      expect(screen.getByText(/Job failed/)).toBeInTheDocument();
    });

    it("renders filters", async () => {
      expect(screen.getByRole("radio", { name: "Provider name" })).toBeInTheDocument();
    });

    it("renders results", async () => {
      expect(screen.getByTestId("published-provider-results")).toBeInTheDocument();
    });

    it("renders refresh button", async () => {
      const buttons = screen.getAllByRole("button", { name: /Refresh funding/ });
      expect(buttons).toHaveLength(1);
    });
  });

  describe("when job has completed successfully", () => {
    const { haveJobSuccessfulNotification, setupJobSpy } = jobSubscriptionTestUtils({});

    beforeEach(async () => {
      hasFullSpecPermissions();
      haveJobSuccessfulNotification({ jobType: JobType.RefreshFundingJob }, {});
      setupJobSpy();
      const state = reduxMockingUtils.createFundingSearchSelectionState({
        searchCriteria: buildInitialPublishedProviderSearchRequest({
          fundingStreamId: fundingStream.id,
          fundingPeriodId: fundingPeriod.id,
          specificationId: spec.id,
          fundingAction: FundingActionType.Approve,
        }),
      });
      reduxMockingUtils.setupFundingSearchSelectionState(state);
      useSpecificationSummaryUtils.hasSpecification(spec);
      usePublishedProviderSearchUtils.hasSearchResults([provider1]);
      usePublishedProviderErrorSearchUtils.hasProvidersWithoutErrors();
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useLastSuccessfulJobRunUtils.hasNeverHadSuccessfulJobResult();

      await renderPage();
    });

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

    it("does not render loading spinner", async () => {
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("does not render any errors", async () => {
      expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();
    });

    it("renders job completed successfully", async () => {
      expect(screen.getByText(/completed successfully/)).toBeInTheDocument();
    });

    it("renders filters", async () => {
      expect(screen.getByRole("radio", { name: "Provider name" })).toBeInTheDocument();
    });

    it("renders results", async () => {
      expect(screen.getByTestId("published-provider-results")).toBeInTheDocument();
    });

    it("renders refresh button", async () => {
      const buttons = screen.getAllByRole("button", { name: /Refresh funding/ });
      expect(buttons).toHaveLength(1);
    });
  });

  describe("when results with errors in Approve All mode", () => {
    const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});

    beforeEach(async () => {
      hasFullSpecPermissions();
      haveNoJobNotification();
      setupJobSpy();
      const state = reduxMockingUtils.createFundingSearchSelectionState({
        searchCriteria: buildInitialPublishedProviderSearchRequest({
          fundingStreamId: fundingStream.id,
          fundingPeriodId: fundingPeriod.id,
          specificationId: spec.id,
          fundingAction: FundingActionType.Approve,
        }),
      });
      reduxMockingUtils.setupFundingSearchSelectionState(state);
      useSpecificationSummaryUtils.hasSpecification(spec);
      usePublishedProviderSearchUtils.hasSearchResults([provider1, providerWithError1]);
      usePublishedProviderErrorSearchUtils.hasProvidersWithErrors(["Error: missing something"]);
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useLastSuccessfulJobRunUtils.hasNeverHadSuccessfulJobResult();

      await renderPage();
    });

    it("renders error summary", async () => {
      expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
      expect(await screen.findByText("There is a problem")).toBeInTheDocument();
    });

    it("renders error message", async () => {
      const alerts = await screen.findAllByRole("alert");
      alerts.some((alert) => within(alert).getByText(/Error: missing something/));
    });

    it("renders approve button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Approve funding/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
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
const fundingConfig = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  approvalMode: ApprovalMode.Batches,
});
const provider1 = fakery.makePublishedProviderResult({
  specificationId: spec.id,
  fundingPeriodId: fundingPeriod.id,
  fundingStreamId: fundingStream.id,
});
const providerWithError1 = fakery.makePublishedProviderResult({
  publishedProviderVersionId: "errrr",
  specificationId: spec.id,
  fundingPeriodId: fundingPeriod.id,
  fundingStreamId: fundingStream.id,
  hasErrors: true,
  errors: ["Error: missing something"],
});

const renderPage = () => {
  const {
    ProvidersForFundingApproval,
  } = require("../../../pages/FundingManagement/Approvals/ProvidersForFundingApproval");
  reduxMockingUtils.store.dispatch = jest.fn();
  return render(
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
