import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import * as redux from "react-redux";
import { MemoryRouter } from "react-router";
import { QueryClientProviderTestWrapper } from "tests/Hooks/QueryClientProviderTestWrapper";

import { ListTemplates } from "../../../pages/Templates/ListTemplates";
import { FundingStreamPermissions } from "../../../types/FundingStreamPermissions";
import { fakery } from "../../fakes/fakery";
import { buildPermissions } from "../../fakes/testFactories";
import { waitForLoadingToFinish } from "../../testing-utils";
import { useTemplateSearchUtils } from "../../testing-utils/useTemplateSearchUtils";


describe("List Templates tests", () => {

  describe("List Templates when I don't have permissions to create templates", () => {
    beforeEach(() => {
      useSelectorSpy.mockReturnValue(noPermissionsState);
      withTemplateSearchResponse([], {})
    });
    afterEach(() => jest.resetAllMocks())

    it("does not render a create template link", async () => {
      await renderListTemplatesPage();
      expect(spy).toBeCalled();
      await waitFor(() => {
        expect(screen.queryByTestId("create-template-link")).not.toBeInTheDocument();
      });
    });

    it("does not render a permission status warning", async () => {
      await renderListTemplatesPage();
      await waitFor(() => expect(screen.queryByTestId("permission-alert-message")).toBeInTheDocument());
    });
  });

  describe("List Templates when I have permissions to create templates", () => {
    beforeEach(() => {
      useSelectorSpy.mockReturnValue(permissionsState);
      withTemplateSearchResponse([mockTemplate1, mockTemplate2], {})
    });
    afterEach(() => jest.resetAllMocks())

    it("renders a create template link", async () => {
      await renderListTemplatesPage();
      await waitFor(() => {
        expect(screen.queryByTestId("create-template-link")).toBeInTheDocument();
        expect(screen.queryByTestId("create-template-link")).toHaveAttribute(
          "href",
          expect.stringMatching("/Templates/Create")
        );
      });
    });

    it("does not render a permission status warning", async () => {
      await renderListTemplatesPage();
      await waitFor(() => expect(screen.queryByTestId("permission-alert-message")).not.toBeInTheDocument());
    });
  });

  describe("List Templates when there are NO templates to list", () => {
    beforeEach(() => {
      useSelectorSpy.mockReturnValue(permissionsState);
      withTemplateSearchResponse([], {})
    });
    afterEach(() => jest.clearAllMocks());

    it("does not render the table of results", async () => {
      await renderListTemplatesPage();
      await waitFor(() => expect(spy).toBeCalled());
      expect(screen.queryByTestId("template-results")).not.toBeInTheDocument();
    });

    it("renders the no results message", async () => {
      await renderListTemplatesPage();
      await waitFor(() => expect(spy).toBeCalled());
      expect(screen.queryAllByText("There are no records to match your search")).toHaveLength(1);
    });

    it("does not render the pagination controls", async () => {
      await renderListTemplatesPage();

      await waitFor(() => expect(spy).toBeCalled());
      expect(screen.queryByText(/Next/)).toBeNull();
    });
  });

  describe("List Templates when there are templates to list", () => {
    beforeEach(() => {
      useSelectorSpy.mockReturnValue(permissionsState);
      withTemplateSearchResponse([mockTemplate1, mockTemplate2], {})
    });
    afterEach(() => jest.clearAllMocks());

    it("fetches template data using searchForTemplates", async () => {
      await renderListTemplatesPage();
      await waitFor(() => expect(spy).toBeCalled());
    });

    it("does not render a permission status warning", async () => {
      await renderListTemplatesPage();
      await waitFor(() => expect(spy).toBeCalled());
      await waitForLoadingToFinish();

      expect(screen.queryByTestId("permission-alert-message")).not.toBeInTheDocument();
    });

    it("renders the two template results", async () => {
      const { getByTestId, container } = await renderListTemplatesPage();
      await waitFor(() => expect(spy).toBeCalled());
      await waitForLoadingToFinish();

      expect(await screen.findByTestId("template-results")).toBeInTheDocument();
      expect(screen.queryByText(/Template #1/)).toBeInTheDocument();
      expect(screen.queryByText(/Template #2/)).toBeInTheDocument();
      expect(container.querySelectorAll("[data-testid^='template-result-']")).toHaveLength(2);
      expect(getByTestId(`template-result-${mockTemplate1.id}`)).toBeInTheDocument();
      expect(getByTestId(`template-result-${mockTemplate2.id}`)).toBeInTheDocument();
    });

    it("renders the template status as 'In Progress' when Draft and current", async () => {
      const { container } = await renderListTemplatesPage();
      await waitFor(() => expect(spy).toBeCalled());
      await waitForLoadingToFinish();

      expect(await screen.findByTestId("template-results")).toBeInTheDocument();
      expect(container.querySelectorAll("[data-testid^='template-result-']")[0]).toHaveTextContent(
        "In Progress"
      );
    });

    it("renders link to edit template", async () => {
      const { getByTestId } = await renderListTemplatesPage();
      await waitFor(() => expect(spy).toBeCalled());
      await waitForLoadingToFinish();

      expect(await screen.findByTestId("template-results")).toBeInTheDocument();
      expect(getByTestId(`template-link-${mockTemplate1.id}`)).toHaveAttribute(
        "href",
        `/Templates/${mockTemplate1.id}/Edit`
      );
      expect(getByTestId(`template-link-${mockTemplate2.id}`)).toHaveAttribute(
        "href",
        `/Templates/${mockTemplate2.id}/Edit`
      );
    });

    it("renders link to template versions", async () => {
      const { getByTestId } = await renderListTemplatesPage();
      await waitFor(() => expect(spy).toBeCalled());
      await waitForLoadingToFinish();

      expect(await screen.findByTestId("template-results")).toBeInTheDocument();
      expect(getByTestId(`versions-link-${mockTemplate1.id}`)).toHaveAttribute(
        "href",
        `/Templates/${mockTemplate1.id}/Versions`
      );
      expect(getByTestId(`versions-link-${mockTemplate2.id}`)).toHaveAttribute(
        "href",
        `/Templates/${mockTemplate2.id}/Versions`
      );
    });
  });

  const useSelectorSpy = jest.spyOn(redux, "useSelector");

  const mockTemplate1 = fakery.makeTemplateSearchResult({
    id: "1111111",
    name: "Template #1",
    fundingStreamId: "DSG",
    fundingPeriodId: "1920",
  });
  const mockTemplate2 = fakery.makeTemplateSearchResult({
    id: "2222222",
    name: "Template #2",
    fundingStreamName: "Potions and Spells Grant",
    fundingPeriodName: "2019-2020",
  });

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

  const { spy, withTemplateSearchResponse } = useTemplateSearchUtils;

  const renderListTemplatesPage = async () => {
    return render(
      <MemoryRouter>
        <QueryClientProviderTestWrapper>
          <ListTemplates/>
        </QueryClientProviderTestWrapper>
      </MemoryRouter>
    );
  };

});
