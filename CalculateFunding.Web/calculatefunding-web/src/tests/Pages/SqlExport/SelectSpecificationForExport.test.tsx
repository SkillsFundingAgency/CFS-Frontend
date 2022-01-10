import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient } from "react-query";
import { MemoryRouter } from "react-router";
import { QueryClientProviderTestWrapper } from "tests/Hooks/QueryClientProviderTestWrapper";

import { SelectSpecificationForExport } from "../../../pages/Datasets/SqlDataExport/SelectSpecificationForExport";
import { fakery } from "../../fakes/fakery";
import { mockApiService } from "../../fakes/mockApiServices";

describe("<SelectSpecificationForExport /> tests", () => {
  let getFundingStreamsSpy: jest.SpyInstance<Promise<unknown>>;
  let getFundingPeriodsSpy: jest.SpyInstance<Promise<unknown>>;
  let getMatchingSpecsSpy: jest.SpyInstance<Promise<unknown>>;

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

      expect(screen.queryByRole("alert", { name: /Loading funding streams/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading funding periods/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading specifications/ })).not.toBeInTheDocument();
    });

    it("renders funding stream options", async () => {
      await setup();

      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));
      await waitFor(() => expect(screen.queryByTestId("loader-inline")).not.toBeInTheDocument());

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Funding stream/ });
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

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Funding stream/ });

      userEvent.selectOptions(fundingStreamSelector, mockFundingStream2.name);

      await waitFor(() => expect(getFundingPeriodsSpy).toBeCalledTimes(1));

      const fundingPeriodSelector = await screen.findByRole("combobox", { name: /Funding period/ });
      expect(within(fundingPeriodSelector).getAllByRole("option")).toHaveLength(3); // includes default non-option
      expect(
        within(fundingPeriodSelector).getByRole("option", { name: mockFundingPeriod1.name })
      ).toBeInTheDocument();
      expect(
        within(fundingPeriodSelector).getByRole("option", { name: mockFundingPeriod2.name })
      ).toBeInTheDocument();

      expect(screen.queryByRole("alert", { name: /Loading funding streams/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading funding periods/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading specifications/ })).not.toBeInTheDocument();
    });
  });

  describe("When funding period is selected", () => {
    beforeEach(async () => {
      getFundingStreamsSpy = mockApiService.makeFundingStreamsSpy([mockFundingStream1, mockFundingStream2]);
      getFundingPeriodsSpy = mockApiService.makeFundingPeriodsSpy([mockFundingPeriod1, mockFundingPeriod2]);
      getMatchingSpecsSpy = mockApiService.makeFindSpecsWithResultsSpy([
        specNotChosenForFunding,
        specChosenForFunding,
      ]);
    });

    it("renders specification options, with no Loading alerts", async () => {
      await setup();
      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Funding stream/ });

      userEvent.selectOptions(fundingStreamSelector, mockFundingStream2.name);

      await waitFor(() => expect(getFundingPeriodsSpy).toBeCalledTimes(1));

      const fundingPeriodSelector = await screen.findByRole("combobox", { name: /Funding period/ });

      userEvent.selectOptions(fundingPeriodSelector, mockFundingPeriod2.name);

      await waitFor(() => expect(getMatchingSpecsSpy).toBeCalledTimes(1));

      const specSelector = await screen.findByRole("combobox", { name: /Specification/ });
      expect(within(specSelector).getAllByRole("option")).toHaveLength(3); // includes default non-option
      expect(
        within(specSelector).getByRole("option", { name: /Please select a specification/ })
      ).toBeInTheDocument();
      expect(
        within(specSelector).getByRole("option", { name: specNotChosenForFunding.name })
      ).toBeInTheDocument();
      expect(
        within(specSelector).getByRole("option", {
          name: `${specChosenForFunding.name} (Chosen for funding)`,
        })
      ).toBeInTheDocument();

      expect(screen.queryByRole("alert", { name: /Loading funding streams/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading funding periods/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading specifications/ })).not.toBeInTheDocument();
    });
  });

  describe("When specification is selected", () => {
    beforeEach(async () => {
      getFundingStreamsSpy = mockApiService.makeFundingStreamsSpy([mockFundingStream1, mockFundingStream2]);
      getFundingPeriodsSpy = mockApiService.makeFundingPeriodsSpy([mockFundingPeriod1, mockFundingPeriod2]);
      getMatchingSpecsSpy = mockApiService.makeFindSpecsWithResultsSpy([
        specNotChosenForFunding,
        specChosenForFunding,
      ]);
    });

    it("renders continue link, with no Loading alerts", async () => {
      await setup();
      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Funding stream/ });

      userEvent.selectOptions(fundingStreamSelector, mockFundingStream2.name);

      await waitFor(() => expect(getFundingPeriodsSpy).toBeCalledTimes(1));

      const fundingPeriodSelector = await screen.findByRole("combobox", { name: /Funding period/ });

      userEvent.selectOptions(fundingPeriodSelector, mockFundingPeriod2.name);

      await waitFor(() => expect(getMatchingSpecsSpy).toBeCalledTimes(1));

      const specSelector = await screen.findByRole("combobox", { name: /Specification/ });

      userEvent.selectOptions(specSelector, specNotChosenForFunding.id);

      expect(screen.queryByRole("alert", { name: /Loading funding streams/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading funding periods/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading specifications/ })).not.toBeInTheDocument();

      const continueButton = screen.getByRole("button", { name: /Continue/ });
      expect(continueButton).toBeEnabled();
      expect(continueButton).toHaveAttribute("href", "/Datasets/Export/RunExportToSql/not-chosen");
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

const specNotChosenForFunding = fakery.makeSpecificationSummary({
  id: "not-chosen",
  name: "Not chosen spec",
  isSelectedForFunding: false,
});
const specChosenForFunding = fakery.makeSpecificationSummary({
  id: "chosen-for-funding",
  name: "chosen for funding spec name",
  isSelectedForFunding: true,
});

const setup = () =>
  render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <SelectSpecificationForExport />
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
