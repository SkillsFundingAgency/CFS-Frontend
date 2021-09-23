import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";
import * as redux from "react-redux";
import { MemoryRouter, Route, Switch } from "react-router";

import * as hooks from "../../../hooks/TemplateBuilder/useTemplateUndo";
import { FundingStreamPermissions } from "../../../types/FundingStreamPermissions";

const useSelectorSpy = jest.spyOn(redux, "useSelector");

jest.spyOn(hooks, "useTemplateUndo").mockImplementation(() => ({
  initialiseState: jest.fn(),
  updatePresentState: jest.fn(),
  undo: jest.fn(),
  redo: jest.fn(),
  clearPresentState: jest.fn(),
  clearUndoState: jest.fn(),
  clearRedoState: jest.fn(),
  undoCount: jest.fn(),
  redoCount: jest.fn(),
}));

export const noPermissionsState: FundingStreamPermissions[] = [
  {
    fundingStreamId: "DSG",
    userId: "",
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateSpecification: false,
    canEditCalculations: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canApproveTemplates: false,
    canApproveAllCalculations: false,
    canApproveAnyCalculations: false,
    canApproveCalculations: false,
    canUploadDataSourceFiles: false,
    canRefreshPublishedQa: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false,
  },
];

export const permissionsState: FundingStreamPermissions[] = [
  {
    fundingStreamId: "DSG",
    userId: "",
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateSpecification: false,
    canEditCalculations: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: true,
    canEditTemplates: true,
    canApproveTemplates: true,
    canRefreshPublishedQa: false,
    canUploadDataSourceFiles: false,
    canApproveCalculations: false,
    canApproveAnyCalculations: false,
    canApproveAllCalculations: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false,
  },
];

beforeAll(() => {
  function mockFunctions() {
    const originalService = jest.requireActual("../../../services/templateBuilderDatasourceService");
    return {
      ...originalService,
      getTemplateVersion: jest.fn(() =>
        Promise.resolve({
          data: {
            templateId: "12352346",
            name: "template name",
            description: "lorem ipsum",
            fundingStreamId: "DSG",
            fundingPeriodId: "2021",
            majorVersion: 0,
            minorVersion: 1,
            version: 1,
            isCurrentVersion: false,
            status: "Draft",
            schemaVersion: "1.1",
            templateJson: "",
            authorId: "",
            authorName: "",
            lastModificationDate: new Date(),
            publishStatus: "",
            publishNote: "",
          },
        })
      ),
    };
  }

  jest.mock("../../../services/templateBuilderDatasourceService", () => mockFunctions());
});

afterEach(cleanup);

const renderTemplateVersionPage = () => {
  const { EditTemplate } = require("../../../pages/Templates/EditTemplate");
  return render(
    <MemoryRouter initialEntries={["/Templates/12352346/Versions/1"]}>
      <Switch>
        <Route path="/Templates/:templateId/Versions/:version" component={EditTemplate} />
      </Switch>
    </MemoryRouter>
  );
};

describe("Template Builder when I request previous version", () => {
  beforeEach(() => {
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(permissionsState);
  });

  it("does not render a permission status warning", async () => {
    const { queryByTestId } = renderTemplateVersionPage();
    await waitFor(() => expect(queryByTestId("permission-alert-message")).not.toBeInTheDocument());
  });

  it("fetches template data getTemplateVersion", async () => {
    const { getTemplateVersion } = require("../../../services/templateBuilderDatasourceService");
    renderTemplateVersionPage();
    await waitFor(() => expect(getTemplateVersion).toBeCalled());
  });

  it("does not render a publish button", async () => {
    const { queryByTestId } = renderTemplateVersionPage();
    await waitFor(() => expect(queryByTestId("publish-button")).not.toBeInTheDocument());
  });

  it("does not render the add or edit description link", async () => {
    const { container } = renderTemplateVersionPage();
    await waitFor(() => {
      expect(container.querySelector("#add-description-link")).not.toBeInTheDocument();
      expect(container.querySelector("#edit-description-link")).not.toBeInTheDocument();
    });
  });

  it("does not render a save button", async () => {
    const { queryByTestId } = renderTemplateVersionPage();

    await waitFor(() => expect(queryByTestId("save-button")).not.toBeInTheDocument());
  });

  it("does render a restore button", async () => {
    const { getByTestId } = renderTemplateVersionPage();
    await waitFor(() => expect(getByTestId("restore-button")).toBeEnabled());
  });
});

describe("Template Builder when I request previous version and have no permissions", () => {
  beforeEach(() => {
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(noPermissionsState);
  });

  it("renders a permission status warning", async () => {
    const { getByTestId } = renderTemplateVersionPage();
    await waitFor(() => expect(getByTestId("permission-alert-message")).toBeInTheDocument());
  });

  it("fetches template data getTemplateVersion", async () => {
    const { getTemplateVersion } = require("../../../services/templateBuilderDatasourceService");
    renderTemplateVersionPage();
    await waitFor(() => expect(getTemplateVersion).toBeCalled());
  });

  it("does not render a restore button", async () => {
    const { queryByTestId } = renderTemplateVersionPage();
    await waitFor(() => expect(queryByTestId("restore-button")).not.toBeInTheDocument());
  });

  it("does not render a publish button", async () => {
    const { queryByTestId } = renderTemplateVersionPage();
    await waitFor(() => expect(queryByTestId("publish-button")).not.toBeInTheDocument());
  });

  it("does not render the add or edit description link", async () => {
    const { container } = renderTemplateVersionPage();
    await waitFor(() => {
      expect(container.querySelector("#add-description-link")).not.toBeInTheDocument();
      expect(container.querySelector("#edit-description-link")).not.toBeInTheDocument();
    });
  });

  it("does not render a save button", async () => {
    const { queryByTestId } = renderTemplateVersionPage();
    await waitFor(() => expect(queryByTestId("save-button")).not.toBeInTheDocument());
  });
});
