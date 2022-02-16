import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { EditSpecificationRouteProps } from "../../../pages/Specifications/EditSpecification";
import { ProviderSnapshot, ProviderSource } from "../../../types/CoreProviderSummary";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { UpdateSpecificationModel } from "../../../types/Specifications/UpdateSpecificationModel";
import { fakery } from "../../fakes/fakery";
import { mockApiService } from "../../fakes/mockApiServices";
import { hasFullSpecPermissions } from "../../fakes/testFactories";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import {
  jobSubscriptionTestUtils,
  reduxMockingUtils,
  useSpecificationSummaryUtils,
  waitForLoadingToFinish,
} from "../../testing-utils";
import { useFundingConfigurationUtils } from "../../testing-utils/useFundingConfigurationUtils";
import { useGetCoreProvidersUtils } from "../../testing-utils/useGetCoreProvidersUtils";
import { useGetProviderSnapshotsUtils } from "../../testing-utils/useGetProviderSnapshotsUtils";
import { useGetPublishedTemplatesUtils } from "../../testing-utils/useGetPublishedTemplatesUtils";

describe("<EditSpecification /> FDZ tracking latest provider data", () => {
  const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});
  const updateSpecSpy = mockApiService.makeUpdateSpecSpy();

  beforeEach(async () => {
    hasFullSpecPermissions();
    haveNoJobNotification();
    setupJobSpy();
    useSpecificationSummaryUtils.hasSpecification(spec);
    useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
    useGetProviderSnapshotsUtils.hasProviderSnapshots([providerSnapshot1, providerSnapshot2]);
    useGetCoreProvidersUtils.hasNoCoreProviders();
    useGetPublishedTemplatesUtils.hasPublishedTemplates([template1, template2]);

    await renderPage();
  });
  afterEach(() => jest.clearAllMocks());

  describe("service call tests", () => {
    it("it makes all the expected calls to the API", async () => {
      expect(useSpecificationSummaryUtils.spy).toBeCalled();
      expect(useFundingConfigurationUtils.spy).toBeCalled();
      expect(useGetPublishedTemplatesUtils.spy).toBeCalled();
      expect(useGetCoreProvidersUtils.spy).toBeCalled();
      expect(useGetProviderSnapshotsUtils.spy).toBeCalled();
    });
  });

  describe("page render tests", () => {
    it("does not render any errors", async () => {
      expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
    });

    it("the breadcrumbs are correct", async () => {
      expect((await screen.findAllByText(/Edit specification/))[0]).toHaveClass(
        "govuk-breadcrumbs__list-item"
      );
    });

    it("will have the correct breadcrumbs", async () => {
      expect(await screen.findAllByTestId("breadcrumb")).toHaveLength(3);
    });

    it("will have the correct <H1 /> title", async () => {
      expect((await screen.findAllByText(/Edit specification/))[1]).toHaveClass("govuk-fieldset__heading");
    });

    it("renders the specification name", async () => {
      const specNameInput = screen.getByRole("textbox", { name: /Specification name/ });
      expect(specNameInput).toHaveValue(spec.name);
    });

    it("renders the specification description", async () => {
      const specNameInput = screen.getByRole("textbox", { name: /Can you provide more detail?/ });
      expect(specNameInput).toHaveValue(spec.description);
    });

    it("renders the funding stream name", async () => {
      expect(screen.getByText("Funding stream")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: spec.fundingStreams[0].id }));
    });

    it("renders the funding period name", async () => {
      expect(screen.getByText("Funding period")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: spec.fundingPeriod.name }));
    });

    it("renders the provider tracking options correctly", async () => {
      await waitForLoadingToFinish();
      expect(useGetProviderSnapshotsUtils.spy).toBeCalled();

      const trackingSelect = screen.getByRole("radiogroup", {
        name: /Track latest core provider data?/,
      }) as HTMLInputElement;
      const optionYes = within(trackingSelect).getByRole("radio", { name: /Yes/ }) as HTMLInputElement;
      expect(optionYes).toBeChecked();
      const optionNo = within(trackingSelect).getByRole("radio", { name: /No/ }) as HTMLInputElement;
      expect(optionNo).not.toBeChecked();
    });

    it("does not render the Core provider options when tracking enabled", async () => {
      await waitForLoadingToFinish();
      expect(useGetProviderSnapshotsUtils.spy).toBeCalled();

      expect(screen.queryByRole("combobox", { name: /Core provider data/ })).not.toBeInTheDocument();
    });

    it("renders the template options", async () => {
      await waitForLoadingToFinish();
      expect(useGetPublishedTemplatesUtils.spy).toBeCalled();

      const templateVersionSelect = screen.getByRole("combobox", { name: /Template version/ });
      expect(templateVersionSelect).toHaveLength(3);
      expect(within(templateVersionSelect).getByRole("option", { name: /Select template version/ }));
      const templateVersionOptions = screen.getAllByTestId("templateVersion-option");
      expect((templateVersionOptions[0] as HTMLOptionElement).value).toEqual(template1.templateVersion);
      expect((templateVersionOptions[1] as HTMLOptionElement).value).toEqual(template2.templateVersion);

      const option = within(templateVersionSelect).getByRole("option", {
        name: template2.templateVersion,
      }) as HTMLOptionElement;
      expect(option.selected).toBeTruthy();
    });

    it("renders the save button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Save and continue/ });
      expect(button).toBeEnabled();
    });
  });

  describe("form submission tests", () => {
    it("it submits form successfully given nothing is changed", async () => {
      await waitForLoadingToFinish();

      const button = screen.getByRole("button", { name: /Save and continue/ });
      expect(button).toBeEnabled();
      await waitFor(() => userEvent.click(button));

      expect(updateSpecSpy).toHaveBeenCalledWith(
        {
          assignedTemplateIds: { "FS-555": template2.templateVersion },
          description: spec.description,
          fundingPeriodId: fundingPeriod.id,
          fundingStreamId: fundingStream.id,
          name: spec.name,
          providerSnapshotId: undefined,
          providerVersionId: undefined,
          coreProviderVersionUpdates: "UseLatest",
        } as UpdateSpecificationModel,
        spec.id
      );
      expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
    });

    it("it submits form given all fields are provided", async () => {
      await waitForLoadingToFinish();

      const trackingSelect = screen.getByRole("radiogroup", {
        name: /Track latest core provider data?/,
      }) as HTMLInputElement;
      const optionNo = within(trackingSelect).getByRole("radio", { name: /No/ }) as HTMLInputElement;

      userEvent.click(optionNo);

      const coreProviderSelect = screen.getByRole("combobox", {
        name: /Core provider data/,
      }) as HTMLSelectElement;
      expect(coreProviderSelect).toHaveLength(3);

      userEvent.selectOptions(coreProviderSelect, providerSnapshot1.name);

      const templateVersionSelect = screen.getByRole("combobox", { name: /Template version/ });
      expect(templateVersionSelect).toHaveLength(3);
      expect(within(templateVersionSelect).getByRole("option", { name: /Select template version/ }));
      const templateVersionOptions = screen.getAllByTestId("templateVersion-option");
      expect((templateVersionOptions[0] as HTMLOptionElement).value).toEqual(template1.templateVersion);
      expect((templateVersionOptions[1] as HTMLOptionElement).value).toEqual(template2.templateVersion);

      userEvent.selectOptions(templateVersionSelect, template1.templateVersion);

      const descriptionTextArea = screen.getByRole("textbox", { name: /Can you provide more detail?/ });
      userEvent.clear(descriptionTextArea);
      userEvent.type(descriptionTextArea, "new description");
      expect(screen.queryByText("error-summary")).not.toBeInTheDocument();

      const button = screen.getByRole("button", { name: /Save and continue/ });
      await waitFor(() => userEvent.click(button));

      expect(updateSpecSpy).toHaveBeenCalledWith(
        {
          assignedTemplateIds: { "FS-555": template1.templateVersion },
          description: "new description",
          fundingPeriodId: fundingPeriod.id,
          fundingStreamId: fundingStream.id,
          name: spec.name,
          providerSnapshotId: providerSnapshot1.providerSnapshotId,
          providerVersionId: undefined,
          coreProviderVersionUpdates: "Manual",
        } as UpdateSpecificationModel,
        spec.id
      );

      expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
    });
  });
});

const fundingStream = fakery.makeFundingStream({ id: "FS-555" });
const fundingPeriod = fakery.makeFundingPeriod();
const providerSnapshot1 = fakery.makeProviderSnapshot({
  providerSnapshotId: 111,
  name: "Provider Snapshot 1",
  fundingStreamCode: fundingStream.id,
  fundingStreamName: fundingStream.name,
});
const providerSnapshot2 = {
  ...providerSnapshot1,
  providerSnapshotId: 222,
  name: "Provider Snapshot 2",
} as ProviderSnapshot;
const template1 = fakery.makePublishedFundingTemplate({
  templateVersion: "3.0",
});
const template2 = fakery.makePublishedFundingTemplate({
  templateVersion: "4.1",
});
const spec = fakery.makeSpecificationSummary({
  name: "FDZ Spec with Tracking",
  fundingStreams: [fundingStream],
  fundingPeriod,
  providerVersionId: undefined,
  providerSnapshotId: providerSnapshot2.providerSnapshotId,
  templateIds: { "FS-555": template2.templateVersion },
  coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest,
});
const fundingConfig = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  providerSource: ProviderSource.FDZ,
  updateCoreProviderVersion: UpdateCoreProviderVersion.ToLatest,
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
