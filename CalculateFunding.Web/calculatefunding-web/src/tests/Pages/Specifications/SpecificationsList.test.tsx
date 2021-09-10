import { render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";

import { SpecificationsList } from "../../../pages/Specifications/SpecificationsList";
import { SpecificationListResults } from "../../../types/Specifications/SpecificationListResults";

// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, "error").mockImplementation(() => jest.fn());
jest.mock("../../../components/AdminNav");

const mockSpecSearchResult: SpecificationListResults = {
  items: [
    {
      id: "",
      name: "TestSpecification1",
      fundingPeriodName: "",
      fundingPeriodId: "",
      fundingStreamNames: [],
      fundingStreamIds: [],
      lastUpdatedDate: new Date(),
      status: "",
      description: "",
      isSelectedForFunding: false,
    },
  ],
  facets: [],
  endItemNumber: 0,
  startItemNumber: 0,
  totalCount: 0,
  pagerState: {
    lastPage: 0,
    currentPage: 0,
    pages: [],
    displayNumberOfPages: 0,
    nextPage: 0,
    previousPage: 0,
  },
};
const mockSpecService = () => {
  jest.mock("../../../services/specificationService", () => {
    const service = jest.requireActual("../../../services/specificationService");

    return {
      ...service,
      getAllSpecificationsService: jest.fn(() =>
        Promise.resolve({
          data: mockSpecSearchResult,
          status: 200,
        })
      ),
    };
  });
};

const hasCalledApi = async () => {
  const { getAllSpecificationsService } = require("../../../services/specificationService");
  await waitFor(() => expect(getAllSpecificationsService).toBeCalledTimes(1));
};

async function renderPage() {
  const { SpecificationsList } = require("../../../pages/Specifications/SpecificationsList");
  return render(
    <MemoryRouter>
      <SpecificationsList />
    </MemoryRouter>
  );
}

describe("<SpecificationsList />", () => {
  beforeEach(async () => {
    mockSpecService();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it("renders the breadcrumbs", async () => {
    await renderPage();
    expect(screen.getAllByTestId("breadcrumb")).toHaveLength(2);
  });

  it("renders the correct heading", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { name: "Specifications" })).toBeInTheDocument();
  });

  it("renders the correct link to Create Specifications", async () => {
    await renderPage();
    const link = screen.getByRole("link", { name: /Create specification/ });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/Specifications/CreateSpecification");
  });

  it("does not render error summary", async () => {
    await renderPage();
    expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();
  });
});
