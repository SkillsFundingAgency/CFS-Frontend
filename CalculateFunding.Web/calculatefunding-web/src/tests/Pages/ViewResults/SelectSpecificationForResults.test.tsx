import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";

import { SelectSpecificationForResults } from "../../../pages/Specifications/SelectSpecificationForResults";

describe("<SelectSpecificationForResults /> ", () => {
    it(" finds the correct heading", () => {
        render(<BrowserRouter><SelectSpecificationForResults/></BrowserRouter>);

        expect(screen.getByText("Specification results")).toBeInTheDocument();
    });

    it(" finds the correct caption", () => {
        render(<BrowserRouter><SelectSpecificationForResults/></BrowserRouter>);

        expect(screen.getByText("Select a specification to view the specification results.")).toBeInTheDocument();
    })

});
