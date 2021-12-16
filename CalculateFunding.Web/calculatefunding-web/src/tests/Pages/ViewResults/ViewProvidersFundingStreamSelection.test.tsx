import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";

import * as policyService from "../../../services/policyService";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";

jest.mock("../../../components/AdminNav");

describe("<ViewProvidersFundingStreamSelection />", () => {
  it("renders funding streams in autocomplete drop-down", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole("textbox"));
    expect(screen.getByText(/14-16/)).toBeInTheDocument();
    expect(screen.getByText(/16-19/)).toBeInTheDocument();
    expect(screen.getByText(/Academies General Annual Grant/)).toBeInTheDocument();
    expect(screen.getByText(/Dedicated Schools Grant/)).toBeInTheDocument();
  });

  it("shows validation message and does not redirect if Continue clicked without selecting a funding stream", async () => {
    await renderPage();
    fireEvent.click(screen.getByText(/Continue/));
    expect(screen.getByTestId("validation-error")).toBeInTheDocument();
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it("does not show validation message and does redirect if Continue clicked and funding stream has been selected", async () => {
    await renderPage();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Dedicated Schools Grant" } });
    fireEvent.click(screen.getByTestId("Dedicated Schools Grant"), {
      target: { innerText: "Dedicated Schools Grant" },
    });
    fireEvent.click(screen.getByText(/Continue/));
    expect(screen.queryByTestId("validation-error")).not.toBeInTheDocument();
    expect(mockHistoryPush).toBeCalledWith("/viewresults/ViewProvidersByFundingStream/DSG");
  });
});

const renderPage = async () => {
  const {
    ViewProvidersFundingStreamSelection,
  } = require("../../../pages/ViewResults/ViewProvidersFundingStreamSelection");
  const component = render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <ViewProvidersFundingStreamSelection />
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Please wait whilst funding streams are loading/i)).not.toBeInTheDocument();
  });
  return component;
};

const getFundingStreamsServiceSpy = jest.spyOn(policyService, "getFundingStreamsService");
getFundingStreamsServiceSpy.mockResolvedValue({
  data: [
    { id: "1416", name: "14-16" },
    { id: "1619", name: "16-19" },
    { id: "GAG", name: "Academies General Annual Grant" },
    { id: "DSG", name: "Dedicated Schools Grant" },
  ],
  status: 200,
  statusText: "",
  headers: {},
  config: {},
});

const mockHistoryPush = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));
