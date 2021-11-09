import { waitFor } from "@testing-library/dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router";
import { Route, Switch } from "react-router-dom";

import * as errorHook from "../../../hooks/useErrors";
import { ErrorHookResult } from "../../../hooks/useErrors";
import {
  ReportGrouping,
  ReportGroupingLevel,
  ReportType,
} from "../../../types/Specifications/ReportMetadataViewModel";
import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";

const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestHelper({});
const mockErrorHook = jest.spyOn(errorHook, "useErrors");
const err: ErrorHookResult = {
  errors: [],
  clearErrorMessages: () => null,
  addErrorMessage: () => null,
  addError: () => null,
  validate: () => true,
  addValidationErrorsAsIndividualErrors: () => null,
  addValidationErrors: () => null,
};
mockErrorHook.mockImplementation(() => {
  return err;
});
describe("<DownloadableReports /> ", () => {
  beforeEach(async () => {
    haveNoJobNotification();
    setupJobSpy();
    mockSpecificationService();
    mockCalculationService();
    await renderDownloadableReports();
  });

  afterEach(jest.clearAllMocks);

  it("calls the getDownloadableReportsService once", async () => {
    const { getDownloadableReportsService } = require("../../../services/specificationService");
    await waitFor(() => expect(getDownloadableReportsService).toHaveBeenCalledTimes(1));
  });

  it("should call the refresh function successfully", async () => {
    const { runGenerateCalculationCsvResultsJob } = require("../../../services/calculationService");

    const refreshButton = await screen.findByTestId("refresh-button");
    userEvent.click(refreshButton);

    await waitFor(() => expect(runGenerateCalculationCsvResultsJob).toHaveBeenCalledTimes(1));
  });

  it("renders live reports ", async () => {
    await waitFor(() => {
      expect(screen.getByTestId("live-report") as HTMLDivElement).toBeVisible();
    });
  });

  it("renders grouping titles of published reports ", async () => {
    expect(await screen.getByText("Group level reports")).toBeInTheDocument();
    expect(await screen.getByText("Provider level reports")).toBeInTheDocument();
    expect(await screen.getByText("Profiling level reports")).toBeInTheDocument();
  });

  it("renders group level titles of published reports ", async () => {
    expect(await screen.getByText("Current state group level funding line reports")).toBeInTheDocument();
    expect(await screen.getByText("Released only provider level funding line reports")).toBeInTheDocument();
    expect(await screen.getByText("All versions profiling level funding line reports")).toBeInTheDocument();
  });

  it("renders open-close status of accordians correctly", async () => {
    const accordions = (await screen.getAllByTestId("accordion-panel")) as HTMLDivElement[];
    accordions.map((accordion) => {
      expect(accordion.className).not.toBe("govuk-accordion__section govuk-accordion__section--expanded");
    });

    const openClosebutton = await screen.findByTestId("open-close");
    userEvent.click(openClosebutton);

    await waitFor(() => {
      const accordions = screen.getAllByTestId("accordion-panel") as HTMLDivElement[];
      accordions.map((accordion) => {
        expect(accordion.className).toBe("govuk-accordion__section govuk-accordion__section--expanded");
      });
    });
  });
});

const renderDownloadableReports = async () => {
  const { DownloadableReports } = require("../../../components/Reports/DownloadableReports");
  const component = render(
    <MemoryRouter initialEntries={["/DownloadableReports/ABC123"]}>
      <Switch>
        <Route path="/DownloadableReports/:specificationId" component={DownloadableReports} />
      </Switch>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.queryByText(/Downloadable reports/)).toBeInTheDocument();
  });
  return component;
};

const mockValidateDownloadableReports = jest.fn(() =>
  Promise.resolve({
    status: 200,
    data: [
      {
        specificationReportIdentifier: "123",
        name: "Report 1",
        category: "Category1",
        lastModified: "2020-12-31",
        format: "Draft",
        size: "123",
        grouping: ReportGrouping.Live,
        groupingLevel: ReportGroupingLevel.Undefined,
        reportType: ReportType.Undefined,
      },
      {
        specificationReportIdentifier: "2",
        name: "Report 2",
        category: "Category2",
        lastModified: "2020-12-31",
        format: "Draft",
        size: "123",
        grouping: ReportGrouping.Group,
        groupingLevel: ReportGroupingLevel.Current,
        reportType: ReportType.Undefined,
      },
      {
        specificationReportIdentifier: "3",
        name: "Report 3",
        category: "Category2",
        lastModified: "2020-12-31",
        format: "Draft",
        size: "123",
        grouping: ReportGrouping.Profiling,
        groupingLevel: ReportGroupingLevel.All,
        reportType: ReportType.Undefined,
      },
      {
        specificationReportIdentifier: "4",
        name: "Report 4",
        category: "Category2",
        lastModified: "2020-12-31",
        format: "Draft",
        size: "123",
        grouping: ReportGrouping.Provider,
        groupingLevel: ReportGroupingLevel.Released,
        reportType: ReportType.Undefined,
      },
    ],
  })
);

const mockSpecificationService = () => {
  jest.mock("../../../services/specificationService", () => {
    const service = jest.requireActual("../../../services/specificationService");
    return {
      ...service,
      getDownloadableReportsService: mockValidateDownloadableReports,
    };
  });
};

const mockCalculationService = () => {
  jest.mock("../../../services/calculationService", () => {
    const service = jest.requireActual("../../../services/calculationService");
    return {
      ...service,
      runGenerateCalculationCsvResultsJob: jest.fn(() =>
        Promise.resolve({
          data: true,
        })
      ),
    };
  });
};
