import { render, screen, waitFor, within} from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import { fakery } from "../../fakes/fakery";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import { mockApiService } from "../../fakes/mockApiServices";

describe("<ViewProvidersFundingStreamSelection />", () => {
  let getFundingStreamsSpy: jest.SpyInstance<Promise<unknown>>;
  let getFundingPeriodsSpy: jest.SpyInstance<Promise<unknown>>;
  let getMatchingSpecsSpy: jest.SpyInstance<Promise<unknown>>;

  afterEach(() => {
    jest.resetAllMocks();
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
    });

    it("renders funding stream options", async () => {
      await setup();

      await waitFor(() => expect(getFundingStreamsSpy).toBeCalledTimes(1));

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Select funding stream:/ });
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

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Select funding stream:/ });

      userEvent.selectOptions(fundingStreamSelector, mockFundingStream2.name);

      await waitFor(() => expect(getFundingPeriodsSpy).toBeCalledTimes(1));

      const fundingPeriodSelector = await screen.findByRole("combobox", { name: /Select funding period:/ });
      expect(within(fundingPeriodSelector).getAllByRole("option")).toHaveLength(3); // includes default non-option
      expect(
        within(fundingPeriodSelector).getByRole("option", { name: mockFundingPeriod1.name })
      ).toBeInTheDocument();
      expect(
        within(fundingPeriodSelector).getByRole("option", { name: mockFundingPeriod2.name })
      ).toBeInTheDocument();

      expect(screen.queryByRole("alert", { name: /Loading funding streams/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading funding periods/ })).not.toBeInTheDocument();
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

      const fundingStreamSelector = await screen.findByRole("combobox", { name: /Select funding stream:/ });

      userEvent.selectOptions(fundingStreamSelector, mockFundingStream2.name);

      await waitFor(() => expect(getFundingPeriodsSpy).toBeCalledTimes(1));

      const fundingPeriodSelector = await screen.findByRole("combobox", { name: /Select funding period:/ });

      userEvent.selectOptions(fundingPeriodSelector, mockFundingPeriod2.name);

      await waitFor(() => expect(getMatchingSpecsSpy).toBeCalledTimes(1));

      const specSelector = await screen.findByRole("combobox", { name: /Select specification:/ });
      expect(within(specSelector).getAllByRole("option")).toHaveLength(3); // includes default non-option
      expect(
        within(specSelector).getByRole("option", { name: /Please select a specification/ })
      ).toBeInTheDocument();
      expect(
        within(specSelector).getByRole("option", { name: specNotChosenForFunding.name })
      ).toBeInTheDocument();

      expect(screen.queryByRole("alert", { name: /Loading funding streams/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading funding periods/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert", { name: /Loading specifications/ })).toBeInTheDocument();
    });
  });

});

const stream1 = fakery.makeFundingStream({ id: "1416", name: "14-16" });
const stream2 = fakery.makeFundingStream({ id: "1619", name: "16-19" });
const stream3 = fakery.makeFundingStream({ id: "GAG", name: "Academies General Annual Grant" });
const stream4 = fakery.makeFundingStream({ id: "DSG", name: "Dedicated Schools Grant" });

const renderPage = () => {
  const {
    ViewProvidersFundingStreamSelection,
  } = require("../../../pages/ViewResults/ViewProvidersFundingStreamSelection");
  render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <ViewProvidersFundingStreamSelection />
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
};

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

const setup = () =>{
const {
  ViewProvidersFundingStreamSelection,
} = require("../../../pages/ViewResults/ViewProvidersFundingStreamSelection");
render(
  <MemoryRouter>
    <QueryClientProviderTestWrapper>
      <ViewProvidersFundingStreamSelection />
    </QueryClientProviderTestWrapper>
  </MemoryRouter>
);
}
