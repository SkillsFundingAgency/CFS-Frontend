import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApprovalMode } from "../../../types/ApprovalMode";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { SpecificationTestData } from "./SpecificationTestData";

const {
  waitForPageToLoad,
  fundingStream,
  fundingPeriod,
  template1,
  template2,
  specificationCfs,
  hasEditPermissions,
  mockSpecificationService,
  mockProviderService,
  mockProviderVersionService,
  mockPolicyService,
  renderEditSpecificationPage,
  coreProvider1,
  coreProvider2,
} = SpecificationTestData();
const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestHelper({
  mockSpecId: specificationCfs.id,
});

describe("<EditSpecification />", () => {
  describe("<EditSpecification /> with CFS", () => {
    beforeEach(async () => {
      haveNoJobNotification();
      setupJobSpy();
      hasEditPermissions();
      mockSpecificationService(specificationCfs);
      mockProviderService();
      mockProviderVersionService();
      mockPolicyService(ProviderSource.CFS, ApprovalMode.All, UpdateCoreProviderVersion.Manual);

      await renderEditSpecificationPage(specificationCfs.id);
    });

    afterEach(() => jest.clearAllMocks());

    describe("service call tests", () => {
      it("it makes all the expected calls to the API", async () => {
        const { getSpecificationSummaryService } = require("../../../services/specificationService");
        const { getPublishedTemplatesByStreamAndPeriod } = require("../../../services/policyService");
        const { getFundingConfiguration } = require("../../../services/policyService");
        const { getCoreProvidersByFundingStream } = require("../../../services/providerVersionService");
        await waitFor(() => {
          expect(getSpecificationSummaryService).toBeCalledTimes(1);
          expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1);
          expect(getFundingConfiguration).toBeCalledTimes(1);
          expect(getCoreProvidersByFundingStream).toBeCalledTimes(1);
        });
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
        expect(specNameInput).toHaveValue(specificationCfs.name);
      });

      it("renders the specification description", async () => {
        const specNameInput = screen.getByRole("textbox", { name: /Can you provide more detail?/ });
        expect(specNameInput).toHaveValue(specificationCfs.description);
      });

      it("renders the funding stream name", async () => {
        expect(screen.getByText("Funding stream")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: specificationCfs.fundingStreams[0].id }));
      });

      it("renders the funding period name", async () => {
        expect(screen.getByText("Funding period")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: specificationCfs.fundingPeriod.name }));
      });

      it("renders the Core provider options", async () => {
        const { getCoreProvidersByFundingStream } = require("../../../services/providerVersionService");
        await waitFor(() => expect(getCoreProvidersByFundingStream).toBeCalledTimes(1));

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
        const { getPublishedTemplatesByStreamAndPeriod } = require("../../../services/policyService");
        await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));

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
        const { updateSpecificationService } = require("../../../services/specificationService");

        await waitForPageToLoad();

        const button = screen.getByRole("button", { name: /Save and continue/ });
        expect(button).toBeEnabled();
        await waitFor(() => userEvent.click(button));

        expect(updateSpecificationService).toHaveBeenCalledWith(
          {
            assignedTemplateIds: { "stream-547": template2.templateVersion },
            description: "Lorem ipsum lalala",
            fundingPeriodId: fundingPeriod.id,
            fundingStreamId: fundingStream.id,
            name: specificationCfs.name,
            providerVersionId: coreProvider2.providerVersionId,
          },
          specificationCfs.id
        );
        expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
      });

      it("it submits form given all fields are provided", async () => {
        await waitForPageToLoad();

        const coreProviderSelect = screen.getByRole("combobox", {
          name: /Core provider data/,
        }) as HTMLSelectElement;
        expect(coreProviderSelect).toHaveLength(3);

        userEvent.selectOptions(coreProviderSelect, coreProvider1.name);

        const templateVersionSelect = screen.getByRole("combobox", { name: /Template version/ });
        expect(templateVersionSelect).toHaveLength(3);
        expect(within(templateVersionSelect).getByRole("option", { name: /Select template version/ }));
        const templateVersionOptions = screen.getAllByTestId("templateVersion-option");
        expect((templateVersionOptions[0] as HTMLOptionElement).value).toEqual("3.2");
        expect((templateVersionOptions[1] as HTMLOptionElement).value).toEqual("9.9");

        userEvent.selectOptions(templateVersionSelect, template1.templateVersion);

        const descriptionTextArea = screen.getByRole("textbox", { name: /Can you provide more detail?/ });
        userEvent.clear(descriptionTextArea);
        userEvent.type(descriptionTextArea, "new description");
        expect(screen.queryByText("error-summary")).not.toBeInTheDocument();

        const button = screen.getByRole("button", { name: /Save and continue/ });
        await waitFor(() => userEvent.click(button));

        const { updateSpecificationService } = require("../../../services/specificationService");
        expect(updateSpecificationService).toHaveBeenCalledWith(
          {
            assignedTemplateIds: { "stream-547": template1.templateVersion },
            description: "new description",
            fundingPeriodId: fundingPeriod.id,
            fundingStreamId: fundingStream.id,
            name: specificationCfs.name,
            providerVersionId: coreProvider1.providerVersionId,
          },
          specificationCfs.id
        );

        expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
      });
    });
  });
});
