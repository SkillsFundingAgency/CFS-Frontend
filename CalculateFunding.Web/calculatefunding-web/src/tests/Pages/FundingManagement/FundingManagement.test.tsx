import { render, screen } from "@testing-library/react"
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { createStore, Store } from "redux";

import FundingManagement from "../../../pages/FundingManagement/FundingManagement";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
const store: Store<IStoreState> = createStore(rootReducer);

describe("Funding Management page ", () => {
    beforeEach(() =>{
        render(<MemoryRouter> <QueryClientProvider client={new QueryClient()}>
            <Provider store={store}><FundingManagement/></Provider></QueryClientProvider></MemoryRouter>);
    })

    it("should have title of Funding Management", () => {
        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Funding management");
    });

    it("should have the correct subtitle", () => {
        expect(screen.getByRole("heading", { level:3 }).textContent).toBe("Approve allocations and release allocations for statement and funding.");

    });

    it("should have a description below Funding approvals", () => {
        expect(screen.getByText("Approve allocations for funding.")).toBeInTheDocument();
    });

    it("should have a description below Release management", () => {
        expect(screen.getByText("Release allocations for statement of funding.")).toBeInTheDocument();
    });
});
