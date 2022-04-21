import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";

import { SpecificationListResults } from "../../../types/Specifications/SpecificationListResults";

// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, "error").mockImplementation(() => jest.fn());
jest.mock("../../../components/Header");

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

async function renderPage() {
    const { SpecificationsList } = require("../../../pages/Specifications/SpecificationsList");
    return render(
        <MemoryRouter>
            <SpecificationsList/>
        </MemoryRouter>
    );
}

describe("<SpecificationsList />", () => {
    beforeEach(async () => {
        mockSpecService();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        cleanup();
    })

    it("renders the breadcrumbs", async () => {
        await renderPage();
        const list = screen.getByRole("list", { name: /breadcrumb-list/i });

        const { getAllByRole } = within(list);
        const items = getAllByRole("listitem");
        expect(items).toHaveLength(1);
    });

    it("renders the correct items in the breadcrumb list", async () => {
        await renderPage();
        const list = screen.getByRole("list", { name: /breadcrumb-list/i });

        const { getAllByRole } = within(list);
        const items = getAllByRole("listitem");

        expect(items.length).toBe(1);
        expect(items[0]).toHaveTextContent(/Home/i);
    });

    it("renders the correct heading", async () => {
        await renderPage();
        expect(screen.getByRole("heading", { name: "Specifications" })).toBeInTheDocument();
    });

    it("renders the correct link to Create Specifications", async () => {
        await renderPage();
        const link = screen.getByRole("link", { name: /Create a new specification/ });
        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe("/Specifications/CreateSpecification");
    });

    it("does not render error summary", async () => {
        await renderPage();
        expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();
    });
});
