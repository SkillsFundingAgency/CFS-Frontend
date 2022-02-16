import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { EditSpecificationRouteProps } from "../../../pages/Specifications/EditSpecification";
import { JobType } from "../../../types/jobType";
import { fakery } from "../../fakes/fakery";
import { hasFullSpecPermissions } from "../../fakes/testFactories";
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

describe("<EditSpecification /> with specification jobs running", () => {
  const { haveJobInProgressNotification, setupJobSpy } = jobSubscriptionTestUtils({});

  beforeEach(async () => {
    hasFullSpecPermissions();
    haveJobInProgressNotification({ jobType: JobType.RunConverterDatasetMergeJob }, {});
    setupJobSpy();
    useSpecificationSummaryUtils.hasSpecification(spec);
    useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
    useGetProviderSnapshotsUtils.hasNoProviderSnapshots();
    useGetCoreProvidersUtils.hasNoCoreProviders();
    useGetPublishedTemplatesUtils.hasNoPublishedTemplates();

    await renderPage();
  });
  afterEach(() => jest.clearAllMocks());

  it("displays specification job running", async () => {
    expect(screen.getByText(/Specification is being updated in the background/)).toBeInTheDocument();
  });

  it("does not display form", async () => {
    expect(screen.queryByTestId("edit-specification-form")).not.toBeInTheDocument();
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
