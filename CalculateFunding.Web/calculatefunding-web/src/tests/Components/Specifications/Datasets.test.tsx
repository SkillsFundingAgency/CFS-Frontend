import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import React from "react";
import * as ReactQuery from "react-query";
import { UseQueryResult } from "react-query/types/react/types";
import { MemoryRouter, Route, Switch } from "react-router";

import { DatasetRelationship } from "../../../types/DatasetRelationship";
import { DatasetRelationshipType } from "../../../types/Datasets/DatasetRelationshipType";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import { featureFlagsTestUtils } from "../../testing-utils";

const { setupFeatureFlags } = featureFlagsTestUtils();
const renderDatasets = async () => {
  const { Datasets } = require("../../../components/Specifications/Datasets");
  const page = render(
    <QueryClientProviderTestWrapper>
      <MemoryRouter initialEntries={["/Datasets/SPEC123"]}>
        <Switch>
          <Route path="/Datasets/:specificationId">
            <Datasets specificationId={"SPEC123"} lastConverterWizardReportDate={new Date()} />
          </Route>
        </Switch>
      </MemoryRouter>
    </QueryClientProviderTestWrapper>
  );

  await waitFor(() => {
    expect(screen.getByText("Loading data sets")).not.toBeVisible();
  });

  return page;
};

beforeAll(() => {
  hasDatasets();
});

afterEach(cleanup);

describe("<Datasets /> ", () => {
  beforeEach(async () => {
    setupFeatureFlags({ specToSpec: false });
    await renderDatasets();
  });

  it("renders definitions correctly", async () => {
    expect(await screen.findByText(/definition1/)).toBeInTheDocument();
  });

  it("renders the map data source file to data set link correctly", async () => {
    const button = (await screen.findByRole("link", {
      name: /Map data source file to data set/,
    })) as HTMLAnchorElement;
    expect(button).toBeInTheDocument();
    expect(button.getAttribute("href")).toBe("/Datasets/DataRelationships/SPEC123");
  });

  it("renders the create dataset link correctly", async () => {
    const button = (await screen.findByRole("link", { name: /Create dataset/ })) as HTMLAnchorElement;
    expect(button).toBeInTheDocument();
    expect(button.getAttribute("href")).toBe("/Datasets/CreateDataset/SPEC123");
  });

  it("renders the converter wizard report link correctly", async () => {
    const button = (await screen.findByRole("link", {
      name: /Converter wizard report/,
    })) as HTMLAnchorElement;
    expect(button).toBeInTheDocument();
    expect(button.getAttribute("href")).toBe("/api/datasets/reports/SPEC123/download");
  });

  it("renders the converter wizard report date correctly", async () => {
    expect(screen.getByText(/Converter wizard last run:/)).toBeInTheDocument();
  });
});

// TODO: refactor to use testing-utils custom hook test helper
const useQuerySpy = jest.spyOn(ReactQuery, "useQuery");
const hasDatasets = () => {
  useQuerySpy.mockReturnValue({
    data: [
      {
        definition: {
          description: "",
          id: "",
          name: "definition1",
        },
        relationshipDescription: "casual",
        relationshipType: DatasetRelationshipType.Uploaded,
        isProviderData: false,
        converterEligible: false,
        converterEnabled: false,
        id: "",
        name: "",
      },
      {
        definition: null,
        relationshipDescription: "how do I describe this relationship?",
        relationshipType: DatasetRelationshipType.ReleasedData,
        isProviderData: false,
        converterEligible: true,
        converterEnabled: false,
        id: "Con123",
        name: "",
      },
    ] as DatasetRelationship[],
    status: "success",
    isSuccess: true,
    isFetched: true,
  } as UseQueryResult<DatasetRelationship[], AxiosError>);
};
