import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";

// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, "error").mockImplementation(() => jest.fn());

describe("<ManageDataSourceFiles />", () => {
  it("renders correct page title", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: /Manage data source files/ }));
  });

  it("renders link for Upload a new data source", () => {
    renderPage();

    const link = screen.getByRole("link", { name: /Upload a new data source/ });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", "/Datasets/LoadNewDataSource");
  });

  const renderPage = () => {
    const { ManageDataSourceFiles } = require("../../../pages/Datasets/ManageDataSourceFiles");
    return render(
      <MemoryRouter>
        <ManageDataSourceFiles />
      </MemoryRouter>
    );
  };
});
