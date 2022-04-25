import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Switch } from "react-router";

import * as calcHook from "../../hooks/Calculations/useCalculation";
import * as specHook from "../../hooks/useSpecificationSummary";
import { SpecificationSummaryQueryResult } from "../../hooks/useSpecificationSummary";
import { CalculationDetails } from "../../types/CalculationDetails";
import { CalculationProviderSearchRequest } from "../../types/calculationProviderSearchRequest";
import { CalculationDataType } from "../../types/Calculations/CalculationCompilePreviewResponse";
import { CalculationType } from "../../types/CalculationSearchResponse";
import { PublishStatus } from "../../types/PublishStatusModel";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { ValueType } from "../../types/ValueType";
import { FundingPeriod, FundingStream } from "../../types/viewFundingTypes";
import { fakery } from "../fakes/fakery";
import { jobSubscriptionTestUtils } from "../testing-utils";
import { useCalcProviderSearchUtils } from "../testing-utils/useCalculationProviderSearchUtils";

jest.mock("../../components/Header");

const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestUtils({});

const renderViewCalculationResultsPage = () => {
  const { ViewCalculationResults } = require("../../pages/ViewCalculationResults");
  return render(
    <MemoryRouter initialEntries={[`/ViewCalculationResults/${testCalc1.id}`]}>
      <Switch>
        <Route path="/ViewCalculationResults/:calculationId" component={ViewCalculationResults} />
      </Switch>
    </MemoryRouter>
  );
};

describe("<ViewCalculationResults />", () => {
  beforeEach(() => {
    haveNoJobNotification();
    setupJobSpy();
    const searchResponse = fakery.makeCalcProviderSearchResponse([
      fakery.makeCalcProviderSearchResult({
        calculationId: testCalc1.id,
        calculationName: testCalc1.name,
      }),
    ]);
    useCalcProviderSearchUtils.hasCalculationProvidersResponse({ calculationProvidersData: searchResponse });
    mockCalculation();
    mockSpecification();
  });

  afterEach(() => jest.clearAllMocks());

  describe("<ViewCalculationResults /> service call checks ", () => {
    it("it calls the api", async () => {
      renderViewCalculationResultsPage();

      expect(useCalcProviderSearchUtils.spy).toBeCalled();
    });
  });

  describe("<ViewCalculationResults /> page render checks ", () => {
    it("renders the calculation name in heading", async () => {
      renderViewCalculationResultsPage();
      expect(await screen.findByRole("heading", { name: testCalc1.name }));
    });

    it("renders the view calculation button link correctly", async () => {
      renderViewCalculationResultsPage();

      const button = (await screen.findByRole("button", { name: /View calculation/ })) as HTMLInputElement;
      expect(button).toBeInTheDocument();
      expect(button.getAttribute("href")).toBe("/Specifications/EditCalculation/" + testCalc1.id);
    });

    it("the calculation results are populated", async () => {
      const { container } = renderViewCalculationResultsPage();

      expect(
        await screen.findByRole("link", {
          name: /View provider calculations/,
        })
      ).toBeInTheDocument();
      await waitFor(() => expect(container.querySelectorAll(".govuk-accordion__section")).toHaveLength(1));
    });

    it("search filters exist", async () => {
      const { container } = renderViewCalculationResultsPage();
      await waitFor(() => {
        expect(container.querySelector("#search-options-providers")).toBeInTheDocument();
        expect(container.querySelector("#search-options-UKPRN")).toBeInTheDocument();
        expect(container.querySelector("#search-options-UPIN")).toBeInTheDocument();
        expect(container.querySelector("#search-options-URN")).toBeInTheDocument();
      });
    });
  });

  describe("<ViewCalculationResults /> search filters checks", () => {
    it("search value changes when searching for providerName", async () => {
      const { container } = renderViewCalculationResultsPage();
      // (first call is with default search which will be ignored by the hook internally)
      await waitFor(() => expect(useCalcProviderSearchUtils.spy).toBeCalledTimes(2));
      const secondCall: CalculationProviderSearchRequest = useCalcProviderSearchUtils.spy.mock.calls[1][0];
      expect(secondCall.calculationId).toBe(testCalc1.id);
      expect(secondCall.calculationValueType).toBe(testCalc1.valueType);
      useCalcProviderSearchUtils.spy.mockClear();

      fireEvent.change(container.querySelector("#providerName") as HTMLInputElement, {
        target: { value: "provider-search-text" },
      });

      await waitFor(() => expect(useCalcProviderSearchUtils.spy).toBeCalledTimes(1));

      const request: CalculationProviderSearchRequest = useCalcProviderSearchUtils.spy.mock.calls[0][0];
      expect(request.calculationId).toBe(testCalc1.id);
      expect(request.searchTerm).toBe("provider-search-text");
      expect(request.searchFields).toHaveLength(1);
      expect(request.searchFields).toContain("providerName");
    });

    it("search value changes when searching for urn", async () => {
      const { container } = renderViewCalculationResultsPage();

      useCalcProviderSearchUtils.spy.mockClear();

      userEvent.click(container.querySelector("#search-options-URN") as HTMLInputElement);

      const urnSearchBox = container.querySelector("#urn") as HTMLInputElement;
      expect(urnSearchBox).toBeInTheDocument();

      fireEvent.change(urnSearchBox, {
        target: { value: 1234 },
      });

      await waitFor(() => expect(useCalcProviderSearchUtils.spy).toBeCalledTimes(1));

      const request: CalculationProviderSearchRequest = useCalcProviderSearchUtils.spy.mock.calls[0][0];
      expect(request.calculationId).toBe(testCalc1.id);
      expect(request.calculationValueType).toBe(testCalc1.valueType);
      expect(request.searchTerm).toBe("1234");
      expect(request.searchFields).toHaveLength(1);
      expect(request.searchFields).toContain("urn");
    });

    it("finds the Indicative flag", async () => {
      const { container } = renderViewCalculationResultsPage();
      await waitFor(() => expect(container.querySelectorAll(".govuk-accordion__section")).toHaveLength(1));
      expect(container.querySelectorAll(".govuk-tag--grey")).toHaveLength(1);
    });
  });
});

const fundingStream: FundingStream = {
  name: "FS123",
  id: "Wizard Training Scheme",
};
const fundingPeriod: FundingPeriod = {
  id: "FP123",
  name: "2019-20",
};
const testSpec1: SpecificationSummary = {
  coreProviderVersionUpdates: undefined,
  name: "test spec name",
  id: "3567357",
  approvalStatus: "Cal",
  isSelectedForFunding: true,
  description: "sgdsg",
  providerVersionId: "sgds",
  fundingStreams: [fundingStream],
  fundingPeriod: fundingPeriod,
  dataDefinitionRelationshipIds: [],
  templateIds: {},
};
const testCalc1: CalculationDetails = {
  dataType: CalculationDataType.Decimal,
  id: "C123",
  name: "Calc123",
  fundingStreamId: "PSG",
  specificationId: testSpec1.id,
  valueType: ValueType.Number,
  calculationType: CalculationType.Additional,
  namespace: "TestNamespace",
  wasTemplateCalculation: true,
  description: "Test Description",
  publishStatus: PublishStatus.Draft,
  lastUpdated: new Date(),
  author: null,
  sourceCode: "",
  sourceCodeName: "",
};

const mockCalculation = () =>
  jest.spyOn(calcHook, "useCalculation").mockImplementation(() => ({
    calculation: testCalc1,
    specificationId: testCalc1.specificationId,
    isLoadingCalculation: false,
  }));
const result: SpecificationSummaryQueryResult = {
  clearSpecificationFromCache: () => Promise.resolve(),
  specification: testSpec1,
  isLoadingSpecification: false,
  errorCheckingForSpecification: null,
  haveErrorCheckingForSpecification: false,
  isFetchingSpecification: false,
  isSpecificationFetched: true,
};
const mockSpecification = () =>
  jest.spyOn(specHook, "useSpecificationSummary").mockImplementation(() => result);
