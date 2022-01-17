import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Switch } from "react-router";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import { ProviderVersionQueryResult } from "../../../hooks/Providers/useProviderVersion";
import * as providerVersionHook from "../../../hooks/Providers/useProviderVersion";
import { fakery } from "../../fakes/fakery";

describe("<ViewProviderResults />", () => {
  beforeEach(async () => {
    mockProviderService();
    mockSpecificationService();
    await renderPage();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays provider details", async () => {
    expect(screen.getAllByText("Hogwarts School of Witchcraft and Wizardry").length).toBe(2);
    expect(screen.getByText("ukprn test")).toBeInTheDocument();
  });

  it("displays provider data establishment details", async () => {
    const providerDataTab = (await screen.findByTestId("tab-provider-data")) as HTMLLabelElement;
    act(() => userEvent.click(providerDataTab));

    expect(screen.getByText("establishmentNumberTest")).toBeInTheDocument();
    expect(((await screen.findByTestId("successors")) as HTMLDListElement).textContent).toBe(
      "successors1, successors2"
    );
    expect(((await screen.findByTestId("predecessors")) as HTMLDListElement).textContent).toBe(
      "predecessors1, predecessors2"
    );
  });
});

const renderPage = async () => {
  const { ViewProviderResults } = require("../../../pages/ViewResults/ViewProviderResults");
  const page = render(
    <MemoryRouter initialEntries={["/ViewResults/ViewProviderResults/Hog/1619"]}>
      <Switch>
        <ErrorContextWrapper>
          <Route
            path="/ViewResults/ViewProviderResults/:providerId/:fundingStreamId"
            component={ViewProviderResults}
          />
        </ErrorContextWrapper>
      </Switch>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("Loading provider details")).not.toBeVisible();
  });

  return page;
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
jest.spyOn(global.console, "error").mockImplementation(() => jest.fn());

const mockProviderService = () => {
  jest.mock("../../../services/providerService", () => {
    const service = jest.requireActual("../../../services/providerService");
    return {
      ...service,
      getProviderResultsService: jest.fn(() =>
        Promise.resolve({
          data: {
            id: "1",
            name: "privider name",
            lastEditDate: new Date(),
            fundingPeriod: "funding period",
            fundingStreamIds: ["1619"],
            fundingPeriodEnd: new Date(),
          },
        })
      ),
    };
  });
};

const mockSpecificationService = () => {
  jest.mock("../../../services/specificationService", () => {
    const service = jest.requireActual("../../../services/specificationService");
    return {
      ...service,
      getSpecificationSummaryService: jest.fn(() =>
        Promise.resolve({
          data: {
            name: "test spec",
            id: "test spec id",
            approvalStatus: "",
            isSelectedForFunding: true,
            description: "",
            fundingPeriod: "funding period",
            fundingStreamIds: ["1619"],
            providerSnapshotId: 11,
            templateIds: { [""]: "" },
            dataDefinitionRelationshipIds: [],
          },
        })
      ),
    };
  });
};
