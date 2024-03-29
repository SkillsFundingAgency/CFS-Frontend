﻿import "@testing-library/jest-dom/extend-expect";

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import * as redux from "react-redux";
import { MemoryRouter } from "react-router";

import { FundingStreamPermissions } from "../../../types/FundingStreamPermissions";
import { buildPermissions } from "../../fakes/testFactories";

const useSelectorSpy = jest.spyOn(redux, "useSelector");

const noPermissionsState: FundingStreamPermissions[] = [
  buildPermissions({ fundingStreamId: "DSG", setAllPermsEnabled: false }),
];
const permissionsState: FundingStreamPermissions[] = [
  buildPermissions({
    fundingStreamId: "DSG",
    actions: [(p) => (p.canApproveTemplates = true)],
  }),
];

export const setupGetTemplate = function () {
  jest.mock("../../../services/templateBuilderDatasourceService", () => ({
    getTemplateById: jest.fn(() =>
      Promise.resolve({
        data: {
          templateId: "12352346",
          name: "template name",
          description: "lorem ipsum",
          fundingStreamId: "DSG",
          fundingPeriodId: "2021",
          majorVersion: 0,
          minorVersion: 1,
          version: 2,
          status: "Draft",
          schemaVersion: "1.1",
          templateJson: undefined,
          authorId: "",
          authorName: "",
          lastModificationDate: new Date(),
          publishStatus: "",
          comments: "",
        },
      })
    ),
    getAllCalculations: jest.fn(),
  }));
};

const renderPage = () => {
  const { PublishTemplate } = require("../../../pages/Templates/PublishTemplate");
  return render(
    <MemoryRouter>
      <PublishTemplate />
    </MemoryRouter>
  );
};

describe("Publish Template page", () => {
  describe("when I don't have approve permissions ", () => {
    beforeEach(() => {
      useSelectorSpy.mockClear();
      useSelectorSpy.mockReturnValue(noPermissionsState);
      setupGetTemplate();
    });
    it("does not render a permission status warning at first", async () => {
      renderPage();
      await waitFor(() => expect(screen.queryByTestId("permission-alert-message")).toBeFalsy());
    });
    it("fetches template data", async () => {
      const { getTemplateById } = require("../../../services/templateBuilderDatasourceService");
      renderPage();
      await waitFor(() => expect(getTemplateById).toBeCalled());
    });
    it("renders a permission status warning after loading data", async () => {
      const { getTemplateById } = require("../../../services/templateBuilderDatasourceService");
      renderPage();
      await waitFor(() => expect(getTemplateById).toBeCalled());
      await waitFor(() => expect(screen.getByTestId("permission-alert-message")).toBeInTheDocument());
    });
  });
  describe("when I have approve permissions ", () => {
    beforeEach(() => {
      useSelectorSpy.mockClear();
      useSelectorSpy.mockReturnValue(permissionsState);
      setupGetTemplate();
    });
    it("fetches template data", async () => {
      const { getTemplateById } = require("../../../services/templateBuilderDatasourceService");
      renderPage();
      await waitFor(() => expect(getTemplateById).toBeCalled());
    });
    it("does not render a permission status warning after loading data", async () => {
      const { getTemplateById } = require("../../../services/templateBuilderDatasourceService");
      renderPage();
      await waitFor(() => expect(getTemplateById).toBeCalled());
      await waitFor(() => expect(screen.queryByTestId("permission-alert-message")).not.toBeInTheDocument());
    });
  });
});
