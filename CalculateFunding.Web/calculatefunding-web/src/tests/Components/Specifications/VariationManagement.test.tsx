import { render, screen, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import * as ReactQuery from "react-query";
import { UseQueryResult } from "react-query/types/react/types";
import { MemoryRouter, Route, Switch } from "react-router";

import { VariationManagement } from "../../../components/Specifications/VariationManagement";
import * as pointersHook from "../../../hooks/Variation/useProfileVariationPointers";
import { ProfileVariationPointersResult } from "../../../hooks/Variation/useProfileVariationPointers";
import { AvailableVariationPointerFundingLine } from "../../../types/Publishing/AvailableVariationPointerFundingLine";
import { FundingLineProfileVariationPointer } from "../../../types/Specifications/ProfileVariationPointer";

const specificationId = "SPEC123";

const renderVariationManagement = async () => {
  render(
    <MemoryRouter initialEntries={[`/VariationManagement/${specificationId}`]}>
      <QueryClientProvider client={new QueryClient()}>
        <Switch>
          <Route path={`/VariationManagement/${specificationId}`}>
            <VariationManagement
              specificationId={specificationId}
              addError={jest.fn()}
              clearErrorMessages={jest.fn()}
              fundingPeriodId={"aaa"}
              fundingStreamId={"bbb"}
            />
          </Route>
        </Switch>
      </QueryClientProvider>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByTestId("loader")).not.toBeInTheDocument());
};

const useQuerySpy = jest.spyOn(ReactQuery, "useQuery");
const pointersHookSpy = jest.spyOn(pointersHook, "useProfileVariationPointers");

const mockPointers: FundingLineProfileVariationPointer[] = [
  {
    fundingLineName: "FL One",
    fundingLineId: "FL1",
    profileVariationPointer: {
      fundingStreamId: "FS1",
      fundingLineId: "FL2",
      periodType: "CalendarMonth",
      typeValue: "December",
      year: 2002,
      occurrence: 1,
    },
  },
  {
    fundingLineName: "FL Two",
    fundingLineId: "FL2",
    profileVariationPointer: {
      fundingStreamId: "FS1",
      fundingLineId: "FL2",
      periodType: "CalendarMonth",
      typeValue: "December",
      year: 2002,
      occurrence: 1,
    },
  },
];
const mockPointerResults: ProfileVariationPointersResult = {
  isLoadingVariationManagement: false,
  isFetchingVariationManagement: false,
  profileVariationPointers: mockPointers,
};

const hasVariationPointers = () => pointersHookSpy.mockImplementation(() => mockPointerResults);

const mockFundingLines: AvailableVariationPointerFundingLine[] = [
  {
    fundingLineCode: "MOCK-001",
    fundingLineName: "MockPeriod",
    selectedPeriod: {
      periodType: "MockPeriodType",
      year: 2000,
      occurrence: 1,
      period: "MockPeriod",
    },
    periods: [],
  },
];
const hasAvailableFundingLines = () =>
  useQuerySpy.mockReturnValue({
    data: mockFundingLines,
    status: "success",
    isSuccess: true,
    isFetching: false,
    isLoading: false,
    isFetched: true,
  } as UseQueryResult<AvailableVariationPointerFundingLine[], AxiosError>);

describe("<VariationManagement /> ", () => {
  beforeEach(async () => {
    hasVariationPointers();
    hasAvailableFundingLines();

    await renderVariationManagement();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("does not render No Results message", async () => {
    await waitFor(() => expect(screen.queryByTestId("no-data")).not.toBeInTheDocument());
  });

  it("renders correctly", async () => {
    expect(
      screen.getByRole("cell", {
        name: /MockPeriodType 2000 Instalment 1/,
      })
    );
  });
});
