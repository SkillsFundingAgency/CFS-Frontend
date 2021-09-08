import React from "react";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { createLocation, createMemoryHistory } from "history";
import { match, MemoryRouter } from "react-router";
import { EditVariationPointsRouteProps } from "../../../pages/Specifications/EditVariationPoints";
import { QueryClient, QueryClientProvider } from "react-query";
import * as specificationService from "../../../services/specificationService";
import * as profilingService from "../../../services/profilingService";

jest.mock("../../../components/AdminNav");

describe("<EditVariationPoints />", () => {
  afterEach(() => {
    getProfileVariationPointersServiceSpy.mockReset();
    setProfileVariationPointersServiceSpy.mockClear();
    mockHistoryPush.mockClear();
  });

  describe("When an existing variation pointer has been set", () => {
    beforeEach(() => {
      getProfileVariationPointersServiceSpy.mockResolvedValue({
        data: [
          {
            fundingLineId: fundingLineId,
            fundingLineName: "funding line name",
            profileVariationPointer: {
              fundingStreamId: fundingStreamId,
              fundingLineId: fundingLineId,
              occurrence: 2,
              periodType: "CalendarMonth",
              typeValue: "March",
              year: 2021,
            },
          },
        ],
        status: 200,
        statusText: "",
        headers: {},
        config: {},
      });
    });

    it("renders the funding line id", async () => {
      await renderPage();
      expect(screen.getByText(fundingLineId)).toBeInTheDocument();
    });

    it("renders the only future installments as select options", async () => {
      await renderPage();
      expect(screen.queryByText(/March 2021 Installment 1/i)).not.toBeInTheDocument();
      expect(screen.getByText(/April 2021 Installment 1/i)).toBeInTheDocument();
      expect(screen.getByText(/April 2021 Installment 2/i)).toBeInTheDocument();
      expect(screen.getByText(/May 2021 Installment 1/i)).toBeInTheDocument();
    });

    it("calls save endpoint when save is clicked and redirects to View Specification page", async () => {
      await renderPage();

      const instalmentInput = screen.getByTestId("select");

      await waitFor(() => {
        fireEvent.change(instalmentInput, { target: { value: "2021-May-1" } });
        fireEvent.blur(instalmentInput);
        fireEvent.click(screen.getByText(/Save and continue/i));
        expect(setProfileVariationPointersServiceSpy).toHaveBeenLastCalledWith(specificationId, [
          {
            fundingLineId: "DSG-002",
            fundingStreamId: "DSG",
            occurrence: 1,
            periodType: "CalendarMonth",
            typeValue: "May",
            year: 2021,
          },
        ]);
        expect(mockHistoryPush).toHaveBeenLastCalledWith(`/ViewSpecification/${specificationId}`);
      });
    });
  });

  describe("When no variation pointer has been set", () => {
    beforeEach(() => {
      getProfileVariationPointersServiceSpy.mockResolvedValue({
        data: [
          {
            fundingLineId: fundingLineId,
            fundingLineName: "funding line name",
            profileVariationPointer: null,
          },
        ],
        status: 200,
        statusText: "",
        headers: {},
        config: {},
      });
    });

    it("renders the funding line id", async () => {
      await renderPage();
      expect(screen.getByText(fundingLineId)).toBeInTheDocument();
    });

    it("renders all installments as select options", async () => {
      await renderPage();
      expect(screen.getByText(/March 2021 Installment 1/i)).toBeInTheDocument();
      expect(screen.getByText(/March 2021 Installment 2/i)).toBeInTheDocument();
      expect(screen.getByText(/April 2021 Installment 1/i)).toBeInTheDocument();
      expect(screen.getByText(/April 2021 Installment 2/i)).toBeInTheDocument();
      expect(screen.getByText(/May 2021 Installment 1/i)).toBeInTheDocument();
    });
  });

  describe("When latest variation pointer has been set", () => {
    beforeEach(() => {
      getProfileVariationPointersServiceSpy.mockResolvedValue({
        data: [
          {
            fundingLineId: fundingLineId,
            fundingLineName: "funding line name",
            profileVariationPointer: {
              fundingStreamId: fundingStreamId,
              fundingLineId: fundingLineId,
              occurrence: 1,
              periodType: "CalendarMonth",
              typeValue: "May",
              year: 2021,
            },
          },
        ],
        status: 200,
        statusText: "",
        headers: {},
        config: {},
      });
    });

    it("renders the funding line id", async () => {
      await renderPage();
      expect(screen.getByText(fundingLineId)).toBeInTheDocument();
    });

    it("renders no installments in select options", async () => {
      await renderPage();
      expect(screen.getByText(/None Available/i)).toBeInTheDocument();
      expect(screen.queryByText(/March 2021 Installment 1/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/March 2021 Installment 2/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/April 2021 Installment 1/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/April 2021 Installment 2/i)).not.toBeInTheDocument();
    });
  });
});

const renderPage = async () => {
  const { EditVariationPoints } = require("../../../pages/Specifications/EditVariationPoints");
  const component = render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <EditVariationPoints match={editVariationPointsRouteProps} location={location} history={history} />
      </QueryClientProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Variation occurrence/i)).toBeInTheDocument();
  });

  return component;
};

// Setup mocks
const specificationId = "056fcfcd-fb12-45ed-8a1b-079a0e2fc8c5";
const fundingStreamId = "DSG";
const fundingLineId = "DSG-002";

const getProfileVariationPointersServiceSpy = jest.spyOn(
  specificationService,
  "getProfileVariationPointersService"
);

const getSpecificationSummaryServiceSpy = jest.spyOn(specificationService, "getSpecificationSummaryService");
getSpecificationSummaryServiceSpy.mockResolvedValue({
  data: {
    id: specificationId,
    name: "specificationName",
    description: "",
    fundingPeriod: {
      id: "fundingPeriodId",
      name: "fundingPeriod",
    },
    approvalStatus: "Approved",
    isSelectedForFunding: true,
    fundingStreams: [
      {
        id: fundingStreamId,
        name: "fundingStream",
      },
    ],
    dataDefinitionRelationshipIds: [],
    templateIds: {},
    coreProviderVersionUpdates: undefined,
  },
  status: 200,
  statusText: "",
  headers: {},
  config: {},
});

const setProfileVariationPointersServiceSpy = jest.spyOn(
  specificationService,
  "setProfileVariationPointersService"
);
setProfileVariationPointersServiceSpy.mockResolvedValue({
  data: {},
  status: 200,
  statusText: "",
  headers: {},
  config: {},
});

const getProfilePatternsServiceSpy = jest.spyOn(profilingService, "getProfilePatternsForFundingLine");
getProfilePatternsServiceSpy.mockResolvedValue({
  data: [
    {
      installmentYear: 2021,
      installmentMonth: "March",
      installmentNumber: 1,
      installmentValue: 0.0,
      periodType: "",
      isPaid: false,
    },
    {
      installmentYear: 2021,
      installmentMonth: "March",
      installmentNumber: 2,
      installmentValue: 0.0,
      periodType: "",
      isPaid: false,
    },
    {
      installmentYear: 2021,
      installmentMonth: "April",
      installmentNumber: 1,
      installmentValue: 0.0,
      periodType: "",
      isPaid: false,
    },
    {
      installmentYear: 2021,
      installmentMonth: "April",
      installmentNumber: 2,
      installmentValue: 0.0,
      periodType: "",
      isPaid: false,
    },
    {
      installmentYear: 2021,
      installmentMonth: "May",
      installmentNumber: 1,
      installmentValue: 0.0,
      periodType: "",
      isPaid: false,
    },
  ],
  status: 200,
  statusText: "",
  headers: {},
  config: {},
});

const editVariationPointsRouteProps: match<EditVariationPointsRouteProps> = {
  params: {
    specificationId: specificationId,
    fundingLineId: fundingLineId,
  },
  isExact: true,
  path: "",
  url: "",
};

const mockHistoryPush = jest.fn();
const history = createMemoryHistory();
const location = createLocation("", "", "");

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));
