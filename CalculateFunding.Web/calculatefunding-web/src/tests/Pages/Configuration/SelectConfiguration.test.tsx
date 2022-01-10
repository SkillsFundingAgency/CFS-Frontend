import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient } from "react-query";
import { MemoryRouter } from "react-router";

import { SelectConfiguration } from "../../../pages/Configuration/SelectConfiguration";
import { fakery } from "../../fakes/fakery";
import { mockApiService } from "../../fakes/mockApiServices";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";

describe("<SelectConfiguration /> tests", () => {
  let getFundingStreamsSpy: jest.SpyInstance<Promise<unknown>>;
  let getFundingPeriodsSpy: jest.SpyInstance<Promise<unknown>>;

  afterEach(() => {
    jest.resetAllMocks();
    new QueryClient().getQueryCache().clear();
  });

  describe("After initial page load", () => {
    beforeEach(async () => {
      getFundingStreamsSpy = mockApiService.makeFundingStreamsSpy([mockFundingStream1, mockFundingStream2]);
      mockApiService.makeFundingPeriodsSpy([mockFundingPeriod1, mockFundingPeriod2]);
    });

    it("calls the correct services on initial page load", async () => {
      await setup();

      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));
    });

    it("renders no Loading alerts", async () => {
      await setup();

      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));

      expect(screen.queryByRole("alert", { name: /Loading.../ })).not.toBeInTheDocument();
    });

    it("renders funding stream options", async () => {
      await setup();

      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));
      await waitFor(() => expect(screen.queryByTestId("loader-inline")).not.toBeInTheDocument());

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Select funding stream/ });
      expect(within(fundingStreamSelector).getAllByRole("option")).toHaveLength(3); // includes default non-option
      expect(
        within(fundingStreamSelector).getByRole("option", { name: mockFundingStream1.name })
      ).toBeInTheDocument();
      expect(
        within(fundingStreamSelector).getByRole("option", { name: mockFundingStream2.name })
      ).toBeInTheDocument();
    });
  });

  describe("When funding stream is selected", () => {
    beforeEach(async () => {
      getFundingStreamsSpy = mockApiService.makeFundingStreamsSpy([mockFundingStream1, mockFundingStream2]);
      getFundingPeriodsSpy = mockApiService.makeFundingPeriodsSpy([mockFundingPeriod1, mockFundingPeriod2]);
    });

    it("renders funding period options with no Loading alerts", async () => {
      await setup();
      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Select funding stream/ });

      userEvent.selectOptions(fundingStreamSelector, mockFundingStream2.name);

      await waitFor(() => expect(getFundingPeriodsSpy).toBeCalledTimes(1));
      await waitFor(() => expect(screen.queryByTestId("loader-inline")).not.toBeInTheDocument());

      const fundingPeriodSelector = await screen.findByRole("combobox", { name: /Select funding period/ });
      expect(within(fundingPeriodSelector).getAllByRole("option")).toHaveLength(3); // includes default non-option
      expect(
        within(fundingPeriodSelector).getByRole("option", { name: mockFundingPeriod1.name })
      ).toBeInTheDocument();
      expect(
        within(fundingPeriodSelector).getByRole("option", { name: mockFundingPeriod2.name })
      ).toBeInTheDocument();

      expect(screen.queryByRole("alert", { name: /Loading.../ })).not.toBeInTheDocument();
    });
  });

  describe("When funding period is selected", () => {
    beforeEach(async () => {
      getFundingStreamsSpy = mockApiService.makeFundingStreamsSpy([mockFundingStream1, mockFundingStream2]);
      getFundingPeriodsSpy = mockApiService.makeFundingPeriodsSpy([mockFundingPeriod1, mockFundingPeriod2]);
    });

    it("renders continue link, with no Loading alerts", async () => {
      await setup();
      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Select funding stream/ });

      userEvent.selectOptions(fundingStreamSelector, mockFundingStream2.name);

      await waitFor(() => expect(getFundingPeriodsSpy).toBeCalledTimes(1));

      const fundingPeriodSelector = await screen.findByRole("combobox", { name: /Select funding period/ });

      userEvent.selectOptions(fundingPeriodSelector, mockFundingPeriod2.name);
      await waitFor(() => expect(screen.queryByTestId("loader-inline")).not.toBeInTheDocument());

      expect(screen.queryByRole("alert", { name: /Loading funding streams/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading funding periods/ })).not.toBeInTheDocument();

      const continueButton = screen.getByRole("button", { name: /Continue/ });
      expect(continueButton).toBeEnabled();
      expect(continueButton).toHaveAttribute("href", "/Configuration/ConfigurationDownloads/fs2/fp2");
    });
  });
});

const mockHistoryPush = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const mockFundingStream1 = fakery.makeFundingStream({ id: "fs1", name: "Stream 1" });
const mockFundingStream2 = fakery.makeFundingStream({ id: "fs2", name: "Stream 2" });
const mockFundingPeriod1 = fakery.makeFundingPeriod({ id: "fp1", name: "Period 1" });
const mockFundingPeriod2 = fakery.makeFundingPeriod({ id: "fp2", name: "Period 2" });

const setup = () =>
  render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <SelectConfiguration />
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
