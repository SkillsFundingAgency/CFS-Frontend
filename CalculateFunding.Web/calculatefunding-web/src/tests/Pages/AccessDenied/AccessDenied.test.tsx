import { render, screen } from "@testing-library/react";
import React from "react";

import { AccessDenied } from "../../../pages/AccessDenied/AccessDenied";



describe("Access Denied ", () => {
    beforeEach(() => {
        render(<AccessDenied/>);
    });

    it("should render page correctly", async () => {
        expect(await screen.findByRole("heading", {
            level: 1,
            name: /Access denied/
        })).toBeInTheDocument();

        expect(await screen.findByRole("heading", {
            level: 2,
            name: /You don't have access to the Calculate Funding Service/
        })).toBeInTheDocument();

        expect(await screen.findByRole("heading", {
            level: 2,
            name: /Please raise a request in the Service Portal to gain access./
        })).toBeInTheDocument();
    });
});
