import "@testing-library/jest-dom/extend-expect";

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router";

import * as hook from "../../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding";
import { FundingManagementTestSetup } from "./FundingManagementTestSetup";

const renderPage = () => {
  const { FundingManagementApprovalSelection } = require("../../../pages/FundingManagement/FundingManagementApprovalSelection");
  return render(
    <MemoryRouter>
      <FundingManagementApprovalSelection />
    </MemoryRouter>
  );
};

const testData = FundingManagementTestSetup();

describe("Renders <FundingManagementApprovalSelection /> correctly when selecting a funding configuration with All Approval mode", () => {
  beforeEach(() => {
    jest.spyOn(hook, "useOptionsForSpecificationsSelectedForFunding").mockImplementation(() => ({
      fundingStreams: testData.mockSelectionData,
      isLoadingOptions: false,
      isErrorCheckingForOptions: false,
      errorCheckingForOptions: "",
    }));
    testData.hasFundingConfigWithApproveAllMode();

    renderPage();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders Funding approvals label", async () => {
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Funding approvals");
  });

  it("renders Funding streams", async () => {
    const dropdown = await screen.findByTestId("funding-stream-dropdown");
    expect(dropdown).toBeInTheDocument();
    expect(dropdown.childNodes).toHaveLength(3);
  });

  it("renders Funding periods when funding stream selected", async () => {
    const fundingStreamSelect = await screen.findByTestId("funding-stream-dropdown");

    act(() => userEvent.selectOptions(fundingStreamSelect, testData.mockSelectionData[1].id));

    const fundingPeriodSelect = await screen.findByTestId("funding-period-dropdown");
    expect(fundingPeriodSelect).toBeInTheDocument();
    expect(fundingPeriodSelect.childNodes).toHaveLength(2);
  });

  it("renders specification when funding period selected with Approval mode ALL", async () => {
    const fundingStreamSelect = await screen.findByTestId("funding-stream-dropdown");
    act(() => userEvent.selectOptions(fundingStreamSelect, testData.mockSelectionData[0].id));

    const fundingPeriodSelect = await screen.findByTestId("funding-period-dropdown");
    act(() => userEvent.selectOptions(fundingPeriodSelect, testData.mockSelectionData[0].periods[0].id));

    await waitFor(() => {
      expect(screen.getByText(testData.testSpec1.name)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/ })).toBeEnabled();
      expect(
        screen.queryByText(/Select yes if you wish to process a preselected batch of providers/)
      ).not.toBeInTheDocument();
    });
  });
});

describe("Renders <FundingManagementApprovalSelection /> correctly when selecting a funding configuration with Batch Approval mode", () => {
  beforeEach(() => {
    jest.spyOn(hook, "useOptionsForSpecificationsSelectedForFunding").mockImplementation(() => ({
      fundingStreams: testData.mockSelectionData,
      isLoadingOptions: false,
      isErrorCheckingForOptions: false,
      errorCheckingForOptions: "",
    }));
    testData.hasFundingConfigWithApproveBatchMode();

    renderPage();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders Funding approvals heading", async () => {
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Funding approvals");
  });

  it("renders Funding streams", async () => {
    const dropdown = await screen.findByTestId("funding-stream-dropdown");
    expect(dropdown).toBeInTheDocument();
    expect(dropdown.childNodes).toHaveLength(3);
  });

  it("renders Funding periods when funding stream selected", async () => {
    const fundingStreamSelect = await screen.findByTestId("funding-stream-dropdown");

    act(() => userEvent.selectOptions(fundingStreamSelect, testData.mockSelectionData[1].id));

    const fundingPeriodSelect = await screen.findByTestId("funding-period-dropdown");
    expect(fundingPeriodSelect).toBeInTheDocument();
    expect(fundingPeriodSelect.childNodes).toHaveLength(2);
  });

  it("renders specification when funding period selected with Approval mode Batches", async () => {
    const fundingStreamSelect = await screen.findByTestId("funding-stream-dropdown");
    act(() => userEvent.selectOptions(fundingStreamSelect, testData.mockSelectionData[1].id));

    const fundingPeriodSelect = await screen.findByTestId("funding-period-dropdown");
    act(() => userEvent.selectOptions(fundingPeriodSelect, testData.mockSelectionData[1].periods[0].id));

    await waitFor(() => {
      expect(screen.getByText(testData.testSpec2.name)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/ })).toBeInTheDocument();
      //expect(screen.getByRole("button", { name: /Continue/ })).toBeDisabled();
      expect(
        screen.getByText(/Select yes if you wish to process a preselected batch of providers/)
      ).toBeInTheDocument();
    });
  });
});
