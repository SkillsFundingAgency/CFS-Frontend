import { render, screen, waitFor } from "@testing-library/react";
import { createBrowserHistory, createLocation } from "history";
import * as useSpecificationSummaryHook from "hooks/useSpecificationSummary";
import { DateTime } from "luxon";
import React from "react";
import { QueryClient } from "react-query";
import { match, MemoryRouter } from "react-router";
import { QueryClientProviderTestWrapper } from "tests/Hooks/QueryClientProviderTestWrapper";
import { SpecificationSummary } from "types/SpecificationSummary";

import * as useExportToSqlJobsHook from "../../../hooks/ExportToSql/useExportToSqlJobs";
import { UseExportToSqlJobsHookResults } from "../../../hooks/ExportToSql/useExportToSqlJobs";
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import { RunExportToSql } from "../../../pages/Datasets/SqlDataExport/RunExportToSql";
import { Permission } from "../../../types/Permission";
import { fakery } from "../../fakes/fakery";
import { mockApiService } from "../../fakes/mockApiServices";
import {
  hasFullSpecPermissions,
  withExportSqlJobs,
  withMissingSpecPermissions,
  withSpecification,
} from "../../fakes/testFactories";
import { waitForLoadingToFinish } from "../../testing-utils";

describe("<RunExportToSql /> tests", () => {
  afterEach(() => {
    jest.resetAllMocks();
    new QueryClient().getQueryCache().clear();
  });

  describe("when no previous sql job exists", () => {
    it("push data button is disabled when user does not have canRefreshPublishedQa permission", async () => {
      const getSpecSpy = mockApiService.makeSpecificationSummarySpy(spec);
      hasMissingPermissions();
      mockSpyImplementation({
        latestPublishedDate: { value: DateTime.fromISO(latestPublishedDate).toJSDate() },
      });
      await renderPage();

      expect(screen.getByText(/you do not have permissions/i)).toBeInTheDocument();

      await waitFor(() => expect(getSpecSpy).toBeCalled());
      await waitForLoadingToFinish();

      expect(screen.getAllByText(/23 November 2020/i)).toHaveLength(1);
      expect(screen.getAllByText("N/A", { exact: false })).toBeTruthy();

      const buttons = screen.getAllByRole("button", { name: /Create SQL data/ });
      expect(buttons[0]).toBeDisabled();
      expect(buttons[1]).toBeDisabled();
    });

    it("if specification is not chosen then user should not be able to run export on release/current allocations", async () => {
      hasSpecificationChosenForFunding(specNotChosen);
      hasExportSqlJobs();
      hasFullSpecPermissions();

      await renderPage();

      await waitForLoadingToFinish();

      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toBeEnabled();
      expect(buttons.length).toBe(1);
    });
  });
});

const latestPublishedDate = "2020-11-23T17:35:01.1080915+00:00";
const spec = fakery.makeSpecificationSummary();
const specNotChosen = fakery.makeSpecificationSummaryNotChosen();
const mockTriggerCalcResultsExport = jest.fn();
const mockTriggerCurrentAllocationResultsExport = jest.fn();
const mockTriggerReleasedResultsExport = jest.fn();

const useRunExportToSqlSpy = jest.spyOn(useExportToSqlJobsHook, "useExportToSqlJobs");
const mockSpyImplementation = (overrides: Partial<UseExportToSqlJobsHookResults>) => {
  useRunExportToSqlSpy.mockImplementation(() => {
    return {
      exportJob: undefined,
      hasRunningSqlJob: false,
      isExportingReleasedResults: false,
      lastCalcResultsExportJob: undefined,
      lastExportAllocationDataJob: undefined,
      lastReleasedAllocationJob: undefined,
      triggerCalcResultsExport: mockTriggerCalcResultsExport,
      triggerCurrentAllocationResultsExport: mockTriggerCurrentAllocationResultsExport,
      triggerReleasedResultsExport: mockTriggerReleasedResultsExport,
      latestPublishedDate: { value: null },
      isLoadingLatestPublishedDate: false,
      hasRunningFundingJobs: false,
      isExporting: false,
      isAnotherUserRunningSqlJob: false,
      exportJobId: "",
      exportJobStatusMessage: "",
      fundingJobStatusMessage: "",
      isExportBlockedByJob: false,
      isExportingCurrentResults: false,
      isExportingCalcResults: false,
      isLatestAllocationDataAlreadyExported: false,
      isLatestCalcResultsAlreadyExported: false,
      isLatestReleaseDataAlreadyExported: false,
      isCurrentAllocationStateBlockedByJob: false,
      isLatestAllocationStateBlockedByJob: false,
      ...overrides,
    } as UseExportToSqlJobsHookResults;
  });
};
const history = createBrowserHistory();
const location = createLocation("", "", "", { search: "", pathname: "", hash: "", key: "", state: "" });

const hasMissingPermissions = () => {
  jest
    .spyOn(useSpecificationPermissionsHook, "useSpecificationPermissions")
    .mockImplementation(() => withMissingSpecPermissions([Permission.CanRefreshPublishedQa]));
};

const hasSpecificationChosenForFunding = (specification: SpecificationSummary) => {
  jest
    .spyOn(useSpecificationSummaryHook, "useSpecificationSummary")
    .mockImplementation(() => withSpecification(specification));
};

const hasExportSqlJobs = () => {
  jest.spyOn(useExportToSqlJobsHook, "useExportToSqlJobs").mockImplementation(() => withExportSqlJobs());
};

const mockHistoryPush = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const mockRoute: match<{ specificationId: string }> = {
  isExact: true,
  path: "",
  url: "",
  params: { specificationId: "spec-123" },
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <QueryClientProviderTestWrapper>
        <RunExportToSql match={mockRoute} history={history} location={location} />
      </QueryClientProviderTestWrapper>
    </MemoryRouter>
  );
