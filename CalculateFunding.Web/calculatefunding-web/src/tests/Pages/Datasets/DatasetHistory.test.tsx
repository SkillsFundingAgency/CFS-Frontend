import { render, screen, waitFor, within } from "@testing-library/react";
import { createLocation } from "history";
import React from "react";
import { match, MemoryRouter } from "react-router";

import { DatasetHistoryRouteProps } from "../../../pages/Datasets/DatasetHistory";
import {
  DatasetChangeType,
  DatasetVersionDetails,
  DatasetVersionSearchResponse,
} from "../../../types/Datasets/DatasetVersionSearchResponse";

const mockHistory = { push: jest.fn() };
const location = createLocation("", "", "");
const datasetId = "seritdhu9w4";
const mockRoute: match<DatasetHistoryRouteProps> = {
  params: {
    datasetId: datasetId,
  },
  url: "",
  path: "",
  isExact: true,
};

const renderPage = () => {
  const { DatasetHistory } = require("../../../pages/Datasets/DatasetHistory");
  return render(
    <MemoryRouter>
      <DatasetHistory history={mockHistory} location={location} match={mockRoute} />
    </MemoryRouter>
  );
};

describe("<DatasetHistory />", () => {
  describe("<DatasetHistory /> when loading normally", () => {
    beforeEach(async () => {
      mockDatasetService();
      renderPage();
      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });
    });
    afterEach(() => jest.clearAllMocks());

    it("does not render any errors", async () => {
      expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
    });

    it("renders correct heading", async () => {
      expect(screen.getByRole("heading", { name: mockHistoryData.results[0].name })).toBeInTheDocument();
    });

    it("renders table of versions", async () => {
      expect(screen.getByRole("table", { name: /Dataset Versions/ })).toBeInTheDocument();
    });

    it("renders new version correctly", async () => {
      const table = screen.getByRole("table", { name: /Dataset Versions/ });
      expect(table).toBeInTheDocument();
      expect(
        within(table).getByRole("rowheader", { name: /Version 3 Change note change note 3/ })
      ).toBeInTheDocument();
      expect(within(table).getByRole("cell", { name: "New Version" })).toBeInTheDocument();
    });

    it("renders merge version correctly", async () => {
      const table = screen.getByRole("table", { name: /Dataset Versions/ });
      expect(table).toBeInTheDocument();
      expect(
        within(table).getByRole("rowheader", { name: /Version 4 Change note change note 4/ })
      ).toBeInTheDocument();
      expect(within(table).getByRole("cell", { name: "Merge" })).toBeInTheDocument();
    });

    it("when merge type, renders version file and merge file download link", async () => {
      const table = screen.getByRole("table", { name: /Dataset Versions/ });
      const mergeVersionRow = within(table).getByRole("row", { name: /Version 4/ });
      const versionLink = within(mergeVersionRow).getByRole("link", { name: /version4/ });
      expect(versionLink).toBeInTheDocument();
      expect(versionLink).toHaveAttribute("href", "/api/datasets/download-dataset-file/4/4");
      const mergeLink = within(mergeVersionRow).getByRole("link", { name: /download/ });
      expect(mergeLink).toBeInTheDocument();
      expect(mergeLink).toHaveAttribute("href", "/api/datasets/download-merge-file/4/4");
    });

    it("when new version, renders new version file download link", async () => {
      const table = screen.getByRole("table", { name: /Dataset Versions/ });
      const mergeVersionRow = within(table).getByRole("row", { name: /Version 3/ });
      const link = within(mergeVersionRow).getByRole("link", { name: /version3/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/api/datasets/download-dataset-file/3/3");
    });

    it("renders paging correctly", async () => {
      const paging = screen.getByRole("navigation", { name: /Pagination/ });
      expect(paging).toBeInTheDocument();
      expect(within(paging).getByText(/Showing 3 - 4 of 6 results/)).toBeInTheDocument();
    });
  });

  const mockDataset1: DatasetVersionDetails = {
    fundingStreamId: "",
    fundingStreamName: "",
    blobName: "version3",
    changeNote: "change note 3",
    changeType: DatasetChangeType.NewVersion,
    datasetId: "3",
    definitionName: "blah",
    description: "blah blah",
    id: "3",
    lastUpdatedByName: "whoever",
    lastUpdatedDate: new Date(2000, 0, 1, 0, 0),
    name: "Dataset Blahblah",
    version: 3,
  };
  const mockDataset2: DatasetVersionDetails = {
    fundingStreamId: "",
    fundingStreamName: "",
    blobName: "version4",
    changeNote: "change note 4",
    changeType: DatasetChangeType.Merge,
    datasetId: "4",
    definitionName: "blah",
    description: "blah blah",
    id: "4",
    lastUpdatedByName: "whoever",
    lastUpdatedDate: new Date(2000, 0, 4, 0, 0),
    name: "Dataset Blahblah",
    version: 4,
  };
  const mockResults: DatasetVersionDetails[] = [mockDataset2, mockDataset1];
  const mockHistoryData: DatasetVersionSearchResponse = {
    results: mockResults,
    currentPage: 2,
    startItemNumber: 3,
    endItemNumber: 4,
    facets: [],
    pagerState: {
      currentPage: 2,
      pages: [],
      lastPage: 3,
      displayNumberOfPages: 3,
      nextPage: 3,
      previousPage: 1,
    },
    pageSize: 2,
    totalErrorResults: 0,
    totalResults: 6,
  };

  const mockDatasetService = () => {
    jest.mock("../../../services/datasetService", () => {
      const service = jest.requireActual("../../../services/datasetService");
      return {
        ...service,
        searchDatasetVersions: jest.fn(() =>
          Promise.resolve({
            data: mockHistoryData,
          })
        ),
      };
    });
  };
});
