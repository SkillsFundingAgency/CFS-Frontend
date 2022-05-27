import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";

import { ViewResults } from "../../../pages/ViewResults";

const renderPage = () =>{
    render(<BrowserRouter><ViewResults /></BrowserRouter>);
}

describe("<ViewResults /> ", () => {
    beforeEach(() =>{
        renderPage();
    })
    it("should show the provider results link", () => {
        expect(screen.getByRole("link", {
            name: "Provider results"
        })).toBeInTheDocument();
    });

    it("should show the specification results link", () => {
        expect(screen.getByRole("link", {
            name: "Specification results"
        })).toBeInTheDocument();
    });
    it("should show the provider results caption", () => {
        expect(screen.getByText(/Select a provider to view its calculation results./)).toBeInTheDocument();
    });
    it("should show the specification results caption", () => {
        expect(screen.getByText(/Select a specification to view the calculation and download CSV reports./)).toBeInTheDocument();
    });
});
