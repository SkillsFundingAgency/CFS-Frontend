import { render, screen, within } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { EditSpecificationRouteProps } from "../../../pages/Specifications/EditSpecification";
import { Permission } from "../../../types/Permission";
import { fakery } from "../../fakes/fakery";
import { hasSpecPermissions, withMissingSpecPermissions } from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import {
  jobSubscriptionTestUtils,
  reduxMockingUtils,
  useSpecificationSummaryUtils,
} from "../../testing-utils";
import { useFundingConfigurationUtils } from "../../testing-utils/useFundingConfigurationUtils";
import { useGetCoreProvidersUtils } from "../../testing-utils/useGetCoreProvidersUtils";
import { useGetProviderSnapshotsUtils } from "../../testing-utils/useGetProviderSnapshotsUtils";
import { useGetPublishedTemplatesUtils } from "../../testing-utils/useGetPublishedTemplatesUtils";

describe("<EditSpecification /> permissions tests", () => {
  const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});

  beforeEach(async () => {
    hasSpecPermissions(withMissingSpecPermissions([Permission.CanEditSpecification]));
    haveNoJobNotification();
    setupJobSpy();
    useSpecificationSummaryUtils.hasSpecification(spec);
    useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
    useGetProviderSnapshotsUtils.hasNoProviderSnapshots();
    useGetCoreProvidersUtils.hasNoCoreProviders();
    useGetPublishedTemplatesUtils.hasNoPublishedTemplates();

    await renderPage();
  });
  afterEach(() => jest.clearAllMocks());

  describe("when user doesn't have edit spec permissions", () => {
    it("renders default warning", async () => {
      const permissionsWarning = await screen.findByTestId("permission-alert-message");
      expect(
        within(permissionsWarning).getByText(/You do not have permissions to perform the following action/)
      ).toBeInTheDocument();
      expect(within(permissionsWarning).getByText(/Can edit specifications/)).toBeInTheDocument();
    });
  });
});

const fundingStream = fakery.makeFundingStream({ id: "FS-888" });
const fundingPeriod = fakery.makeFundingPeriod();
const spec = fakery.makeSpecificationSummary({
  name: "FDZ Spec with Tracking",
  fundingStreams: [fundingStream],
  fundingPeriod,
});
const fundingConfig = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
});

const renderPage = async () => {
  const { EditSpecification } = require("../../../pages/Specifications/EditSpecification");
  reduxMockingUtils.store.dispatch = jest.fn();
  render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <Provider store={reduxMockingUtils.store}>
          <EditSpecification
            location={location}
            history={history}
            match={fakery.makeMatch<EditSpecificationRouteProps>({
              specificationId: spec.id,
            })}
          />
        </Provider>
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
};
