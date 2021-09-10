import "@testing-library/jest-dom/extend-expect";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ApprovalMode } from "../../../types/ApprovalMode";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { SpecificationTestData } from "./SpecificationTestData";

const test = SpecificationTestData();

describe("<CreateSpecification /> with duplicated specification name", () => {
  beforeEach(async () => {
    test.hasReduxState({
      permissions: test.withCreatePermissions,
      jobMonitorFilter: undefined,
    });
    test.mockPolicyService(ProviderSource.CFS, ApprovalMode.All, UpdateCoreProviderVersion.Manual);
    test.mockSpecificationServiceWithDuplicateNameResponse();
    test.mockProviderService();
    test.mockProviderVersionService();

    await test.renderCreateSpecificationPage();
  });

  afterEach(() => jest.clearAllMocks());

  it("displays error response", async () => {
    const { createSpecificationService } = require("../../../services/specificationService");
    const {
      getFundingStreamsService,
      getFundingConfiguration,
      getPublishedTemplatesByStreamAndPeriod,
    } = require("../../../services/policyService");
    const { getCoreProvidersByFundingStream } = require("../../../services/providerVersionService");
    expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();

    const specificationField = (await screen.findByTestId("specification-name-input")) as HTMLInputElement;
    userEvent.type(specificationField, "test specification name");

    await waitFor(() => expect(getFundingStreamsService).toBeCalledTimes(1));
    const fundingStreamSelect = await screen.findByTestId("funding-stream-dropdown");
    expect(fundingStreamSelect).toHaveLength(2);
    userEvent.selectOptions(fundingStreamSelect, test.fundingStream.name);

    const { getFundingPeriodsByFundingStreamIdService } = require("../../../services/specificationService");
    await waitFor(() => expect(getFundingPeriodsByFundingStreamIdService).toBeCalledTimes(1));
    expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();

    const fundingPeriodSelect = await screen.findByTestId("funding-period-dropdown");
    expect(fundingPeriodSelect).toHaveLength(2);
    userEvent.selectOptions(fundingPeriodSelect, test.fundingPeriod.name);

    await waitFor(() => expect(getFundingConfiguration).toBeCalledTimes(1));

    await waitFor(() => expect(getCoreProvidersByFundingStream).toBeCalledTimes(1));
    const coreProviderSelect = await screen.findByTestId("core-provider-dropdown");
    expect(coreProviderSelect).toHaveLength(3);

    userEvent.selectOptions(coreProviderSelect, test.coreProvider2.name);

    await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
    const templateVersionSelect = await screen.findByTestId("template-version-dropdown");
    expect(templateVersionSelect).toHaveLength(3);
    userEvent.selectOptions(templateVersionSelect, test.template2.templateVersion);

    const moreDetailField = await screen.findByTestId("description-textarea");
    userEvent.type(moreDetailField, "test description");
    expect(screen.queryByText("error-summary")).not.toBeInTheDocument();

    const button = screen.getByRole("button", { name: /Save and continue/ });
    userEvent.click(button);

    await waitFor(() => expect(createSpecificationService).toBeCalledTimes(1));
    expect(screen.queryByText("error-summary")).not.toBeInTheDocument();

    const buildButton = screen.getByRole("button", { name: /Save and continue/ });
    userEvent.click(buildButton);

    await waitFor(() => {
      expect(screen.queryByText(/unique name error/)).toBeInTheDocument();
    });
  });
});
