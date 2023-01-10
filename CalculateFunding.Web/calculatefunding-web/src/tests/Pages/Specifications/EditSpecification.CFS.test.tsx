import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { EditSpecificationRouteProps } from "../../../pages/Specifications/EditSpecification";
import { ProviderSource } from "../../../types/CoreProviderSummary";
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

describe("<EditSpecification /> CFS", () => {
  const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});
  const updateSpecSpy = mockApiService.makeUpdateSpecSpy();

  beforeEach(async () => {
    hasFullSpecPermissions();
    haveNoJobNotification();
    setupJobSpy();
    useSpecificationSummaryUtils.hasSpecification(spec);
    useFundingConfigurationUtils.hasFundingConfigurationResult(fundingConfig);
    useGetProviderSnapshotsUtils.hasNoProviderSnapshots();
    useGetCoreProvidersUtils.hasCoreProviders([coreProvider1, coreProvider2]);
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
    it("does not render default warning", async () => {
      expect(screen.queryByTestId("permission-alert-message")).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          /You do not have permissions to perform the following action: Can edit specification/
        )
      ).not.toBeInTheDocument();
    });

    it("does render any errors", async () => {
      expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
    });

    it("will have the correct breadcrumbs", async () => {
      expect(await screen.findAllByTestId("breadcrumb")).toHaveLength(2);
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

    it("renders the Core provider options", async () => {
      await waitFor(() => expect(useGetCoreProvidersUtils.spy).toBeCalled());

      const coreProviderSelect = screen.getByRole("combobox", {
        name: /Core provider data/,
      }) as HTMLSelectElement;
      expect(within(coreProviderSelect).getByRole("option", { name: /Select core provider/ }));
      expect(within(coreProviderSelect).getByRole("option", { name: coreProvider1.name }));
      const option2 = within(coreProviderSelect).getByRole("option", {
        name: coreProvider2.name,
      }) as HTMLOptionElement;

      expect(option2.selected).toBeTruthy();
    });

    it("renders the template options", async () => {
      expect(useGetPublishedTemplatesUtils.spy).toBeCalled();

      const templateVersionSelect = screen.getByRole("combobox", { name: /Template version/ });
      expect(templateVersionSelect).toHaveLength(3);
      expect(within(templateVersionSelect).getByRole("option", { name: /Select template version/ }));
      const option1 = within(templateVersionSelect).getByRole("option", {
        name: template1.templateVersion,
      }) as HTMLOptionElement;
      expect(option1.selected).toBeFalsy();
      const option2 = within(templateVersionSelect).getByRole("option", {
        name: template2.templateVersion,
      }) as HTMLOptionElement;
      await waitFor(() => expect(option2.selected).toBeTruthy());
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
          assignedTemplateIds: { "FS-BLAH": template2.templateVersion },
          description: spec.description,
          fundingPeriodId: fundingPeriod.id,
          fundingStreamId: fundingStream.id,
          name: spec.name,
          providerVersionId: coreProvider2.providerVersionId,
          coreProviderVersionUpdates: undefined,
          providerSnapshotId: undefined,
        } as UpdateSpecificationModel,
        spec.id
      );
      expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
    });

    it("it submits form given all fields are provided", async () => {
      await waitForLoadingToFinish();

      const coreProviderSelect = screen.getByRole("combobox", {
        name: /Core provider data/,
      }) as HTMLSelectElement;
      expect(coreProviderSelect).toHaveLength(3);

      userEvent.selectOptions(coreProviderSelect, coreProvider1.name);

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
          assignedTemplateIds: { "FS-BLAH": template1.templateVersion },
          description: "new description",
          fundingPeriodId: fundingPeriod.id,
          fundingStreamId: fundingStream.id,
          name: spec.name,
          providerVersionId: coreProvider1.providerVersionId,
          coreProviderVersionUpdates: undefined,
          providerSnapshotId: undefined,
        } as UpdateSpecificationModel,
        spec.id
      );

      expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
    });
  });
});

const fundingStream = fakery.makeFundingStream({ id: "FS-BLAH" });
const fundingPeriod = fakery.makeFundingPeriod();
const coreProvider1 = fakery.makeCoreProviderSummary({
  providerVersionId: "v111",
  name: "Core Provider 1",
  fundingStream: fundingStream.id,
});
const coreProvider2 = fakery.makeCoreProviderSummary({
  providerVersionId: "v222",
  name: "Core Provider 2",
  fundingStream: fundingStream.id,
});
const template1 = fakery.makePublishedFundingTemplate({
  templateVersion: "3.0",
});
const template2 = fakery.makePublishedFundingTemplate({
  templateVersion: "4.1",
});
const spec = fakery.makeSpecificationSummary({
  name: "Elephant Riding",
  fundingStreams: [fundingStream],
  fundingPeriod,
  providerVersionId: coreProvider2.providerVersionId,
  providerSnapshotId: undefined,
  templateIds: { "FS-BLAH": template2.templateVersion },
});
const fundingConfig = fakery.makeFundingConfiguration({
  fundingStreamId: fundingStream.id,
  fundingPeriodId: fundingPeriod.id,
  providerSource: ProviderSource.CFS,
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
