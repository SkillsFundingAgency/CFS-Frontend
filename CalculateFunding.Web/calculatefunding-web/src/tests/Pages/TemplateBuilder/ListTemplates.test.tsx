import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import * as redux from "react-redux";
import { MemoryRouter } from "react-router";

import { FundingStreamPermissions } from "../../../types/FundingStreamPermissions";
import { TemplateSearchResponse, TemplateStatus } from "../../../types/TemplateBuilderDefinitions";
import { buildPermissions } from "../../fakes/testFactories";

const useSelectorSpy = jest.spyOn(redux, "useSelector");

export const mockTemplateResults: TemplateSearchResponse = {
  endItemNumber: 0,
  pagerState: undefined,
  startItemNumber: 0,
  totalCount: 2,
  totalErrorCount: 0,
  facets: [],
  results: [
    {
      id: "1111111",
      name: "template name",
      fundingStreamId: "DSG",
      fundingPeriodId: "1920",
      currentMajorVersion: 0,
      currentMinorVersion: 1,
      status: TemplateStatus.Draft,
      version: 1,
      lastUpdatedAuthorName: "testUser",
      lastUpdatedDate: new Date(),
      fundingStreamName: "Magical Arts Grant",
      fundingPeriodName: "2019-2020",
      hasReleasedVersion: false,
      publishedMajorVersion: 0,
      publishedMinorVersion: 0,
    },
    {
      id: "2222222",
      name: "template name",
      fundingStreamId: "PSG",
      fundingPeriodId: "2021",
      currentMajorVersion: 0,
      currentMinorVersion: 1,
      status: TemplateStatus.Published,
      version: 1,
      lastUpdatedAuthorName: "testUser",
      lastUpdatedDate: new Date(),
      fundingStreamName: "Potions and Spells Grant",
      fundingPeriodName: "2019-2020",
      hasReleasedVersion: false,
      publishedMajorVersion: 0,
      publishedMinorVersion: 0,
    },
  ],
};
export const mockNoTemplateResults: TemplateSearchResponse = {
  totalCount: 0,
  totalErrorCount: 0,
  facets: [],
  results: [],
  endItemNumber: 0,
  startItemNumber: 0,
  pagerState: {
    lastPage: 0,
    nextPage: 0,
    pages: [],
    displayNumberOfPages: 0,
    previousPage: 0,
    currentPage: 0,
  },
};

function mockSearchForTemplates(response: TemplateSearchResponse) {
  const originalService = jest.requireActual("../../../services/templateBuilderDatasourceService");
  return {
    ...originalService,
    searchForTemplates: jest.fn(() =>
      Promise.resolve({
        data: response,
      })
    ),
  };
}

const noPermissionsState: FundingStreamPermissions[] = [buildPermissions({ fundingStreamId: "DSG" })];
const permissionsState: FundingStreamPermissions[] = [
  buildPermissions({
    fundingStreamId: "DSG",
    actions: [
      (p) => (p.canCreateTemplates = true),
      (p) => (p.canEditTemplates = true),
      (p) => (p.canApproveTemplates = true),
    ],
  }),
];

const renderListTemplatesPage = () => {
  const { ListTemplates } = require("../../../pages/Templates/ListTemplates");
  return render(
    <MemoryRouter>
      <ListTemplates />
    </MemoryRouter>
  );
};

beforeAll(() => {
  jest.mock("../../../services/templateBuilderDatasourceService", () =>
    mockSearchForTemplates(mockTemplateResults)
  );
});

describe("List Templates when I don't have permissions to create templates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(noPermissionsState);
  });

  it("does not render a create template link", async () => {
    const { queryByTestId } = renderListTemplatesPage();
    await waitFor(() => {
      expect(queryByTestId("create-template-link")).not.toBeInTheDocument();
    });
  });

  it("does not render a permission status warning", async () => {
    const { queryByTestId } = renderListTemplatesPage();
    await waitFor(() => expect(queryByTestId("permission-alert-message")).toBeInTheDocument());
  });
});

describe("List Templates when I have permissions to create templates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(permissionsState);
  });

  it("renders a create template link", async () => {
    const { queryByTestId } = renderListTemplatesPage();
    await waitFor(() => {
      expect(queryByTestId("create-template-link")).toBeInTheDocument();
      expect(queryByTestId("create-template-link")).toHaveAttribute(
        "href",
        expect.stringMatching("/Templates/Create")
      );
    });
  });

  it("does not render a permission status warning", async () => {
    const { queryByTestId } = renderListTemplatesPage();
    await waitFor(() => expect(queryByTestId("permission-alert-message")).not.toBeInTheDocument());
  });
});

describe("List Templates when there are NO templates to list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(permissionsState);
    jest.mock("../../../services/templateBuilderDatasourceService", () =>
      mockSearchForTemplates(mockNoTemplateResults)
    );
  });

  it("does not render the table of results", async () => {
    const { queryByTestId } = renderListTemplatesPage();
    await waitFor(() => {
      expect(queryByTestId("template-results")).not.toBeInTheDocument();
    });
  });

  it("renders the no results message", async () => {
    const { queryAllByText } = renderListTemplatesPage();
    await waitFor(() => {
      expect(queryAllByText("There are no records to match your search")).toHaveLength(1);
    });
  });

  it("does not render the pagination controls", async () => {
    renderListTemplatesPage();

    await waitFor(() => {
      const actual = screen.queryByText(/Next Page/);
      expect(actual).toBeNull();
    });
  });
});

describe("List Templates when there are templates to list", () => {
  beforeEach(() => {
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(permissionsState);
  });

  it("does not render a permission status warning", async () => {
    const { queryByTestId } = renderListTemplatesPage();
    await waitFor(() => expect(queryByTestId("permission-alert-message")).not.toBeInTheDocument());
  });

  it("fetches template data using searchForTemplates", async () => {
    const { searchForTemplates } = require("../../../services/templateBuilderDatasourceService");
    renderListTemplatesPage();
    await waitFor(() => expect(searchForTemplates).toBeCalled());
  });

  it("renders the two template results", async () => {
    const { getByTestId, container } = renderListTemplatesPage();
    await waitFor(() => {
      expect(container.querySelectorAll("[data-testid^='template-result-']")).toHaveLength(2);
      expect(getByTestId(`template-result-${mockTemplateResults.results[0].id}`)).toBeInTheDocument();
      expect(getByTestId(`template-result-${mockTemplateResults.results[1].id}`)).toBeInTheDocument();
    });
  });

  it("renders the template status as 'In Progress' when Draft and current", async () => {
    const { container } = renderListTemplatesPage();
    await waitFor(() => {
      expect(container.querySelectorAll("[data-testid^='template-result-']")[0]).toHaveTextContent(
        "In Progress"
      );
    });
  });

  it("renders link to edit template", async () => {
    const { getByTestId } = renderListTemplatesPage();
    await waitFor(() => {
      expect(getByTestId(`template-link-${mockTemplateResults.results[0].id}`)).toHaveAttribute(
        "href",
        `/Templates/${mockTemplateResults.results[0].id}/Edit`
      );
      expect(getByTestId(`template-link-${mockTemplateResults.results[1].id}`)).toHaveAttribute(
        "href",
        `/Templates/${mockTemplateResults.results[1].id}/Edit`
      );
    });
  });

  it("renders link to template versions", async () => {
    const { getByTestId } = renderListTemplatesPage();
    await waitFor(() => {
      expect(getByTestId(`versions-link-${mockTemplateResults.results[0].id}`)).toHaveAttribute(
        "href",
        `/Templates/${mockTemplateResults.results[0].id}/Versions`
      );
      expect(getByTestId(`versions-link-${mockTemplateResults.results[1].id}`)).toHaveAttribute(
        "href",
        `/Templates/${mockTemplateResults.results[1].id}/Versions`
      );
    });
  });
});
