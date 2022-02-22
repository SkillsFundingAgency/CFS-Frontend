import { render, screen } from "@testing-library/react";
import React from "react";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import { ProviderVersionQueryResult } from "../../../hooks/Providers/useProviderVersion";
import * as providerVersionHook from "../../../hooks/Providers/useProviderVersion";
import { fakery } from "../../fakes/fakery";

describe("<ProviderDataTab />", () => {
  beforeEach(async () => {
    await renderComponent();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays provider details", async () => {
    expect(screen.getByText(testProvider.name)).toBeInTheDocument();
    expect(screen.getByText(testProvider.ukprn)).toBeInTheDocument();
  });

  it("displays provider data establishment details", async () => {
    expect(screen.getByText("establishmentNumberTest")).toBeInTheDocument();
    expect(((await screen.findByTestId("successors")) as HTMLDListElement).textContent).toBe(
      "successors1, successors2"
    );
    expect(((await screen.findByTestId("predecessors")) as HTMLDListElement).textContent).toBe(
      "predecessors1, predecessors2"
    );
  });

  it("displays London region code", async () =>{
    expect(screen.getByText("London region code")).toBeInTheDocument();
    expect((await screen.getByText("CDN"))).toBeInTheDocument();
  })

  it("displays London region name", async () =>{
    expect(screen.getByText("London region name")).toBeInTheDocument();
    expect((await screen.getByText("Camden"))).toBeInTheDocument();
  })

  it("displays Regional schools commissioner region name", async () =>{
    expect(screen.getByText("Regional schools commissioner region name")).toBeInTheDocument();
    expect((await screen.getByText("South Central"))).toBeInTheDocument();
  })

  it("displays Regional schools commissioner region code", async () =>{
    expect(screen.getByText("Regional schools commissioner region code")).toBeInTheDocument();
    expect((await screen.getByText("SC"))).toBeInTheDocument();
  })

  it("displays Government office region name", async () =>{
    expect(screen.getByText("Government office region name")).toBeInTheDocument();
    expect((await screen.getByText("London"))).toBeInTheDocument();
  })

  it("displays Government office region code", async () =>{
    expect(screen.getByText("Government office region code")).toBeInTheDocument();
    expect((await screen.getByText("LDN"))).toBeInTheDocument();
  })
});

const renderComponent = async () => {
  const { ProviderDataTab } = require("../../../components/Funding/ProviderDataTab");
  const component = render(
    <ErrorContextWrapper>
      <ProviderDataTab
        providerId={testProvider.providerId}
        providerVersionId={testProvider.providerVersionId}
      />
    </ErrorContextWrapper>
  );

  return component;
};

const testProvider = fakery.makeProviderSummary({});
const providerResult: ProviderVersionQueryResult = {
  providerVersion: testProvider,
  isLoadingProviderVersion: false,
  errorLoadingProviderVersion: null,
  isErrorLoadingProviderVersion: false,
  isFetchingProviderVersion: false,
};
jest.spyOn(providerVersionHook, "useProviderVersion").mockImplementation(() => providerResult);
