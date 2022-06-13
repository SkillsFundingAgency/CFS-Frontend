import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";

import { ListVersions } from "../../../pages/Templates/ListVersions";
import { fakery } from "../../fakes/fakery";
import { QueryClientProviderTestWrapper } from "../../Hooks/QueryClientProviderTestWrapper";
import { showDebugMain } from "../../testing-utils";
import { useTemplateUtils } from "../../testing-utils/useTemplateUtils";
import { useTemplateVersionsUtils } from "../../testing-utils/useTemplateVersionsUtils";


describe("Template Versions page when there are two versions and I have no permissions ", () => {

  beforeEach(() => {
    useTemplateVersionsUtils
      .withTemplateVersionsResponse(
        [
          fakery.makeTemplateVersion({ version: 1, fundingStreamName: "Stream 1" }),
          fakery.makeTemplateVersion({ version: 2, fundingStreamName: "Stream 2" })
        ]);
    useTemplateUtils.withTemplateResponse(fakery.makeTemplate({}));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("does render versions list correctly", async () => {
    const { getByTestId } = renderPage();
    showDebugMain()
    await waitFor(() => {
      expect(getByTestId("version-1")).toBeInTheDocument();
      expect(getByTestId("version-2")).toBeInTheDocument();
    });
  });

  describe("Template Versions page displays no results when filtered search returns no versions", () => {

    beforeEach(() => {
      useTemplateVersionsUtils
        .withTemplateVersionsResponse(
          []);
      useTemplateUtils.withTemplateResponse(fakery.makeTemplate({}));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("does render no results correctly", async () => {
      const { getByTestId } = renderPage();
      await waitFor(() => {
        expect(getByTestId("no-results")).toBeVisible();
        expect(screen.queryByText("There are no records to match your search")).toBeInTheDocument();
      });
    });
  });
});

const renderPage = () => render(
  <MemoryRouter>
    <QueryClientProviderTestWrapper>
      <ListVersions/>
    </QueryClientProviderTestWrapper>
  </MemoryRouter>
);
