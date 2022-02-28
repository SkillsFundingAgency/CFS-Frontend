import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";

import { fakery } from "../../fakes/fakery";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import { useFundingStreamsUtils } from "../../testing-utils/useFundingStreamsUtils";

describe("<ViewProvidersFundingStreamSelection />", () => {
  const { spy, hasFundingStreamsResult } = useFundingStreamsUtils;

  beforeEach(() => {
    hasFundingStreamsResult([stream1, stream2, stream3, stream4]);
    renderPage();
    expect(spy).toBeCalled();
    expect(screen.getByText(/Please wait whilst funding streams are loading/i)).not.toBeVisible();
  });

  afterEach(() => jest.resetAllMocks());

  it("renders funding streams in autocomplete drop-down", async () => {
    fireEvent.click(screen.getByRole("textbox"));
    expect(screen.getByText(/14-16/)).toBeInTheDocument();
    expect(screen.getByText(/16-19/)).toBeInTheDocument();
    expect(screen.getByText(/Academies General Annual Grant/)).toBeInTheDocument();
    expect(screen.getByText(/Dedicated Schools Grant/)).toBeInTheDocument();
  });

  it("shows validation message and does not redirect if Continue clicked without selecting a funding stream", async () => {
    fireEvent.click(screen.getByText(/Continue/));
    expect(screen.getByTestId("validation-error")).toBeInTheDocument();
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it("does not show validation message and does redirect if Continue clicked and funding stream has been selected", async () => {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Dedicated Schools Grant" } });
    fireEvent.click(screen.getByTestId("Dedicated Schools Grant"), {
      target: { innerText: "Dedicated Schools Grant" },
    });
    fireEvent.click(screen.getByText(/Continue/));
    expect(screen.queryByTestId("validation-error")).not.toBeInTheDocument();
    expect(mockHistoryPush).toBeCalledWith("/viewresults/ViewProvidersByFundingStream/DSG");
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
