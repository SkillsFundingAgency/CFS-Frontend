import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import { ViewSpecificationRoute } from "../../../pages/Specifications/ViewSpecification";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { Permission } from "../../../types/Permission";
import { fakery } from "../../fakes/fakery";
import {
  hasFullSpecPermissions,
  hasSpecPermissions,
  withMissingSpecPermissions,
} from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import {
  jobSubscriptionTestUtils,
  reduxMockingUtils,
  useSpecificationSummaryUtils,
  waitForLoadingToFinish,
} from "../../testing-utils";
import { useCalculationCircularDependenciesUtils } from "../../testing-utils/useCalculationCircularDependenciesUtils";
import { useGetCalculationErrorsUtils } from "../../testing-utils/useCalculationErrorsUtils";
import { useCalculationSummariesBySpecificationUtils } from "../../testing-utils/useCalculationSummariesBySpecificationUtils";
import { useFindSpecsWithResultsUtils } from "../../testing-utils/useFindSpecificationsWithResultsUtils";
import { useFundingConfigurationUtils } from "../../testing-utils/useFundingConfigurationUtils";
import { useGetFundingStructureUtils } from "../../testing-utils/useFundingStructureUtils";
import { useSpecsSelectedForFundingUtils } from "../../testing-utils/useSpecsSelectedForFundingUtils";

describe("<ViewSpecification />", () => {
  const { setupJobSpy, haveNoJobNotification } = jobSubscriptionTestUtils();

  describe("page render checks ", () => {
    beforeEach(async () => {
      hasFullSpecPermissions();
      haveNoJobNotification();
      setupJobSpy();
      useSpecificationSummaryUtils.hasSpecification(spec);
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useFindSpecsWithResultsUtils.hasNoSpecsWithResults();
      useSpecsSelectedForFundingUtils.hasNoSpecsSelectedForFunding();
      useGetCalculationErrorsUtils.hasNoCalculationErrors();
      useCalculationCircularDependenciesUtils.hasNoCalculationCircularDependencies();
      useCalculationSummariesBySpecificationUtils.hasNoCalculations();
      useGetFundingStructureUtils.hasNoFundingStructure();

      await renderPage();
    });
    afterEach(() => {
      jest.clearAllMocks();
      cleanup();
    });

    it("it makes all the expected calls to the API", async () => {
      expect(useSpecificationSummaryUtils.spy).toBeCalled();
      expect(useFundingConfigurationUtils.spy).toBeCalled();
      expect(useSpecsSelectedForFundingUtils.spy).toBeCalled();
      expect(useFindSpecsWithResultsUtils.spy).toBeCalled();
      expect(useGetCalculationErrorsUtils.spy).toBeCalled();
      expect(useCalculationCircularDependenciesUtils.spy).toBeCalled();
    });

    it("renders the breadcrumbs", async () => {
      await renderPage();
      const list = screen.getAllByRole("list", { name: /breadcrumb-list/i })[0];

      const { getAllByRole } = within(list);
      const items = getAllByRole("listitem");
      expect(items).toHaveLength(2);
    });

    it("renders the correct items in the breadcrumb list", async () => {
      await renderPage();
      const list = screen.getAllByRole("list", { name: /breadcrumb-list/i })[0];

      const { getAllByRole } = within(list);
      const items = getAllByRole("listitem");

      expect(items.length).toBe(2);
      expect(items[0]).toHaveTextContent(/Home/i);
      expect(items[1]).toHaveTextContent(/View specifications/i);
    })

    it("shows correct status in funding line structure tab", async () => {
      expect(screen.getByText("Draft")).toBeInTheDocument();
    });

    it("renders the edit specification link correctly", async () => {
      await waitForLoadingToFinish();
      const link = (await screen.findByRole("link", { name: /Edit specification/ })) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.getAttribute("href")).toBe(`/Specifications/EditSpecification/${spec.id}`);
    });

    it.skip("shows Variations tab given specification is not chosen for funding", async () => {
      await waitForLoadingToFinish();
      expect(await screen.findByText(/Variations/)).toBeInTheDocument();
    });

    it.skip("shows that the specification is converter wizard enabled", async () => {
      await waitForLoadingToFinish();
      expect(await screen.findByText(/In year opener enabled/)).toBeInTheDocument();
    });

    it.skip("does not render the link to the specification results page", async () => {
      await waitForLoadingToFinish();
      const link = (await screen.queryByRole("link", {
        name: /View specification results/,
      })) as HTMLAnchorElement;
      expect(link).not.toBeInTheDocument();
    });
  });

  describe("with ApproveAllCalculations permission ", () => {
    beforeEach(async () => {
      haveNoJobNotification();
      setupJobSpy();
      useSpecificationSummaryUtils.hasSpecification(spec);
      hasFullSpecPermissions();
      useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
      useFindSpecsWithResultsUtils.hasNoSpecsWithResults();
      useSpecsSelectedForFundingUtils.hasNoSpecsSelectedForFunding();
      useGetCalculationErrorsUtils.hasNoCalculationErrors();
      useCalculationCircularDependenciesUtils.hasNoCalculationCircularDependencies();

      await renderPage();
    });
    afterEach(() => jest.clearAllMocks());

    it.skip("it calls correct services given approve all calculations button is clicked", async () => {
      hasFullSpecPermissions();
      await waitForLoadingToFinish();

      const { getCalculationSummaryBySpecificationId } = require("../../../services/calculationService");

      const approveAllCalcsButton = await screen.findByTestId("approve-calculations");
      userEvent.click(approveAllCalcsButton);

      await waitFor(() => expect(getCalculationSummaryBySpecificationId).toBeCalled());
    });
  });

  describe("without ApproveAllCalculations permission ", () => {
    it.skip("shows permission message when approve all calculations button is clicked", async () => {
      hasSpecPermissions(withMissingSpecPermissions([Permission.CanApproveAllCalculations]));
      await waitForLoadingToFinish();

      const approveAllCalcsButton = await screen.findByTestId("approve-calculations");
      userEvent.click(approveAllCalcsButton);

      await waitFor(() =>
        expect(screen.getByText("You don't have permission to approve calculations")).toBeInTheDocument()
      );
    });
  });
});

const fundingStream = fakery.makeFundingStream();
const fundingPeriod = fakery.makeFundingPeriod();
const spec = fakery.makeSpecificationSummary({
  fundingStreams: [fundingStream],
  fundingPeriod,
});
const fundingConfig = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  providerSource: ProviderSource.CFS,
});

const renderPage = async () => {
  const { ViewSpecification } = require("../../../pages/Specifications/ViewSpecification");
  reduxMockingUtils.store.dispatch = jest.fn();
  render(
    <QueryClientProviderTestWrapper>
      <Provider store={reduxMockingUtils.store}>
        <ErrorContextWrapper>
          <MemoryRouter>
            <ViewSpecification
              location={location}
              history={history}
              match={fakery.makeMatch<ViewSpecificationRoute>({
                specificationId: spec.id,
              })}
            />
          </MemoryRouter>
        </ErrorContextWrapper>
      </Provider>
    </QueryClientProviderTestWrapper>
  );
};
