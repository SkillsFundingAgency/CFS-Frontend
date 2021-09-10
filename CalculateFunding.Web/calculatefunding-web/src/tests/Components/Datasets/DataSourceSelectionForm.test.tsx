import { render, screen, within } from "@testing-library/react";
import React from "react";

import { DataSourceSelectionForm } from "../../../components/DatasetMapping/DataSourceSelectionForm";
import { DatasetRelationshipType } from "../../../types/Datasets/DatasetRelationshipType";
import {
  DatasetChangeType,
  DatasetVersionDetails,
  DatasetVersionSearchResponse,
} from "../../../types/Datasets/DatasetVersionSearchResponse";
import { DatasetVersionSummary } from "../../../types/Datasets/DatasetVersionSummary";
import {
  DataSourceRelationshipResponseViewModel,
  DatasetWithVersions,
} from "../../../types/Datasets/DataSourceRelationshipResponseViewModel";
import { DataSourceSelection } from "../../../types/Datasets/DataSourceSelection";

const renderComponent = (props: {
  selection: DataSourceSelection;
  relationshipData: DataSourceRelationshipResponseViewModel;
  isViewingAllVersions?: boolean;
  datasetVersionSearchResponse?: DatasetVersionSearchResponse | undefined;
}) => {
  const mockChangeVersion = jest.fn();
  const mockExpandToViewAllVersions = jest.fn();
  const mockContractToViewAllDataSets = jest.fn();
  const mockChangeSpecificationDataMapping = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnPageChange = jest.fn();
  const mockOnChangeDataset = jest.fn();

  render(
    <DataSourceSelectionForm
      isLoading={false}
      isBusy={false}
      isSearchingForDataSetVersions={false}
      hasMissingPermissions={false}
      isViewingAllVersions={!!props.isViewingAllVersions}
      relationshipData={props.relationshipData}
      originalSelection={props.selection}
      selection={props.selection}
      datasetVersionSearchResponse={props.datasetVersionSearchResponse}
      onVersionChanged={mockChangeVersion}
      expandToViewAllVersions={mockExpandToViewAllVersions}
      contractToViewAllDataSets={mockContractToViewAllDataSets}
      onSave={mockChangeSpecificationDataMapping}
      onCancel={mockOnCancel}
      setVersionsPage={mockOnPageChange}
      onChangeDataset={mockOnChangeDataset}
    />
  );
  return {
    mockChangeVersion,
    mockExpandToViewAllVersions,
    mockContractToViewAllDataSets,
    mockChangeSpecificationDataMapping,
    mockOnCancel,
    mockOnPageChange,
    mockOnChangeDataset,
  };
};

describe("<DataSourceSelectionForm />", () => {
  afterAll(() => jest.clearAllMocks());

  describe("when viewing no datasets", () => {
    it("renders No Data notification", async () => {
      renderComponent({
        relationshipData: createDataSourceRelationshipData({
          datasets: [],
        }),
        selection: { dataset: undefined, version: undefined },
        isViewingAllVersions: false,
        datasetVersionSearchResponse: undefined,
      });

      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      expect(screen.getByTestId("no-data")).toBeInTheDocument();
      expect(screen.queryByTestId("data-set-selector")).not.toBeInTheDocument();
      expect(screen.queryByTestId("data-set-version-selector")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Save/ })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Back/ })).toBeEnabled();
    });
  });

  describe("when viewing single dataset result without pre-selection", () => {
    it("renders correctly", async () => {
      renderComponent({
        relationshipData: createDataSourceRelationshipData({
          datasets: [createDataSetWithVersions({ datasetId: "ds1", numberOfVersions: 3 })],
        }),
        selection: { dataset: undefined, version: undefined },
        isViewingAllVersions: false,
        datasetVersionSearchResponse: undefined,
      });

      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
      expect(screen.getByTestId("form-select-data-source")).toBeInTheDocument();
      expect(screen.getByTestId("data-set-selector")).toBeInTheDocument();
      expect(screen.queryByTestId("data-set-version-selector")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Save/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Cancel/ })).toBeEnabled();
      expect(screen.queryByRole("button", { name: /View all versions/ })).not.toBeInTheDocument();
    });
  });

  describe("when viewing single dataset result with pre-selection", () => {
    const dataset = createDataSetWithVersions({ datasetId: "ds1", numberOfVersions: 1 });
    it("renders correctly", async () => {
      renderComponent({
        relationshipData: createDataSourceRelationshipData({
          datasets: [dataset],
        }),
        selection: { dataset: dataset, version: dataset.versions[0].version },
        isViewingAllVersions: false,
        datasetVersionSearchResponse: undefined,
      });

      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
      expect(screen.getByTestId("form-select-data-source")).toBeInTheDocument();
      expect(screen.queryByTestId("data-set-selector")).not.toBeInTheDocument();
      expect(screen.getByTestId("data-set-version-selector")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Select data source version/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /View all versions/ })).not.toBeInTheDocument();
    });
  });

  describe("when viewing single dataset result with more than 5 versions", () => {
    const dataset = createDataSetWithVersions({ datasetId: "ds1", numberOfVersions: 6 });
    it("renders correctly", async () => {
      renderComponent({
        relationshipData: createDataSourceRelationshipData({
          datasets: [dataset],
        }),
        selection: { dataset: dataset, version: dataset.versions[0].version },
        isViewingAllVersions: false,
        datasetVersionSearchResponse: undefined,
      });

      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
      expect(screen.getByTestId("form-select-data-source")).toBeInTheDocument();
      expect(screen.queryByTestId("data-set-selector")).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Select data source version/ })).toBeInTheDocument();
      const datasetVersionsContainer = screen.getByTestId("data-set-version-selector");
      expect(datasetVersionsContainer).toBeInTheDocument();
      expect(
        within(datasetVersionsContainer).getByRole("button", { name: /View all versions/ })
      ).toBeInTheDocument();
    });
  });

  describe("when viewing multiple dataset results without pre-selection", () => {
    it("renders correctly", async () => {
      renderComponent({
        relationshipData: createDataSourceRelationshipData({
          datasets: [
            createDataSetWithVersions({ datasetId: "ds1" }),
            createDataSetWithVersions({ datasetId: "ds2" }),
          ],
        }),
        selection: { dataset: undefined, version: undefined },
        isViewingAllVersions: false,
        datasetVersionSearchResponse: undefined,
      });

      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
      expect(screen.getByTestId("form-select-data-source")).toBeInTheDocument();
      expect(screen.getByTestId("data-set-selector")).toBeInTheDocument();
      expect(screen.queryByTestId("data-set-version-selector")).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Select data source file/ })).toBeInTheDocument();
    });
  });

  describe("when viewing multiple dataset results with pre-selection", () => {
    const ds1 = createDataSetWithVersions({ datasetId: "ds1", numberOfVersions: 3 });
    const ds2 = createDataSetWithVersions({ datasetId: "ds2", numberOfVersions: 3 });
    const ds3 = createDataSetWithVersions({ datasetId: "ds3", numberOfVersions: 3 });

    it("renders correctly", async () => {
      renderComponent({
        relationshipData: createDataSourceRelationshipData({
          datasets: [ds1, ds2, ds3],
        }),
        selection: { dataset: ds2, version: ds2.versions[1].version },
        isViewingAllVersions: false,
        datasetVersionSearchResponse: undefined,
      });

      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
      expect(screen.getByTestId("form-select-data-source")).toBeInTheDocument();
      const datasetsContainer = screen.getByTestId("data-set-selector");
      expect(datasetsContainer).toBeInTheDocument();
      const datasetVersionsContainer = screen.getByTestId("data-set-version-selector");
      expect(datasetVersionsContainer).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Select data source version/ })).toBeInTheDocument();
      expect(within(datasetVersionsContainer).getByText(/Select data source version/)).toBeInTheDocument();
    });
  });

  describe("when viewing multiple dataset results with selected dataset having more than 5 versions", () => {
    const ds1 = createDataSetWithVersions({ datasetId: "ds1", numberOfVersions: 5 });
    const ds2 = createDataSetWithVersions({ datasetId: "ds2", numberOfVersions: 6 });
    const ds3 = createDataSetWithVersions({ datasetId: "ds3", numberOfVersions: 3 });

    it("renders correctly", async () => {
      renderComponent({
        relationshipData: createDataSourceRelationshipData({
          datasets: [ds1, ds2, ds3],
        }),
        selection: { dataset: ds2, version: ds2.versions[1].version },
        isViewingAllVersions: false,
        datasetVersionSearchResponse: undefined,
      });

      const datasetVersionsContainer = screen.getByTestId("data-set-version-selector");
      expect(datasetVersionsContainer).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Select data source version/ })).toBeInTheDocument();
      expect(
        within(datasetVersionsContainer).getByRole("button", { name: /View all versions/ })
      ).toBeInTheDocument();
    });
  });

  describe("when viewing all dataset versions for a dataset", () => {
    const ds1 = createDataSetWithVersions({ datasetId: "ds1", numberOfVersions: 5 });
    const ds2 = createDataSetWithVersions({ datasetId: "ds2", numberOfVersions: 6 });
    const ds3 = createDataSetWithVersions({ datasetId: "ds3", numberOfVersions: 3 });

    it("renders correctly", async () => {
      renderComponent({
        relationshipData: createDataSourceRelationshipData({
          datasets: [ds1, ds2, ds3],
        }),
        selection: { dataset: ds2, version: ds2.versions[1].version },
        isViewingAllVersions: true,
        datasetVersionSearchResponse: {
          results: [
            createDataSetVersion({ version: 1 }),
            createDataSetVersion({ version: 2 }),
            createDataSetVersion({ version: 3 }),
            createDataSetVersion({ version: 4 }),
            createDataSetVersion({ version: 5 }),
            createDataSetVersion({ version: 6 }),
          ],
          currentPage: 1,
          pageSize: 10,
          startItemNumber: 1,
          endItemNumber: 6,
          pagerState: {
            currentPage: 1,
            lastPage: 1,
            nextPage: 1,
            pages: [1],
            displayNumberOfPages: 1,
            previousPage: 1,
          },
          facets: undefined,
          totalErrorResults: 0,
          totalResults: 6,
        },
      });

      const datasetVersionsContainer = screen.getByTestId("data-set-version-selector");
      expect(datasetVersionsContainer).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Select data source version/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /View all versions/ })).not.toBeInTheDocument();
      expect(screen.getByText(/version 1/)).toBeInTheDocument();
      expect(screen.getByText(/version 2/)).toBeInTheDocument();
      expect(screen.getByText(/version 3/)).toBeInTheDocument();
      expect(screen.getByText(/version 4/)).toBeInTheDocument();
      expect(screen.getByText(/version 5/)).toBeInTheDocument();
      expect(screen.getByText(/version 6/)).toBeInTheDocument();
      expect(screen.getByText(/Showing 1 - 6 of 6 results/)).toBeInTheDocument();
    });
  });
});

function createDataSourceRelationshipData(props: {
  datasets: DatasetWithVersions[];
}): DataSourceRelationshipResponseViewModel {
  return {
    datasets: props.datasets,
    definitionId: "def1",
    definitionName: "def name",
    relationshipId: "Rel111",
    relationshipType: DatasetRelationshipType.Uploaded,
    relationshipName: "Relationship Name",
    sourceSpecificationId: "SourceSpec444",
    sourceSpecificationName: "Source Spec 444 Name",
    specificationId: "Spec999",
    specificationName: "Spec Name",
  };
}

function createDataSetWithVersions(props: {
  datasetId: string;
  numberOfVersions?: number;
}): DatasetWithVersions {
  return {
    name: "Dataset " + props.datasetId,
    id: props.datasetId,
    totalCount: props.numberOfVersions || 1,
    versions: !props.numberOfVersions
      ? [createDataSetVersionSummary({ version: 1 })]
      : [...Array(Math.max(props.numberOfVersions, 5)).keys()].map((n) =>
          createDataSetVersionSummary({ version: n + 1 })
        ),
    description: "",
  };
}

function createDataSetVersionSummary(props: { version: number }): DatasetVersionSummary {
  return {
    id: "asdfasdf",
    author: { id: "jbloggs", name: "Joe Bloggs" },
    date: new Date(),
    version: props.version,
  };
}

function createDataSetVersion(props: { version: number }): DatasetVersionDetails {
  return {
    id: "asdfasdf",
    name: `Version ${props.version}`,
    version: props.version,
    datasetId: "",
    description: "",
    definitionName: "def name",
    lastUpdatedByName: "Joe Bloggs",
    lastUpdatedDate: new Date(),
    blobName: "",
    changeNote: "",
    changeType: DatasetChangeType.NewVersion,
    fundingStreamId: "stream1",
    fundingStreamName: "Stream 1",
  };
}
