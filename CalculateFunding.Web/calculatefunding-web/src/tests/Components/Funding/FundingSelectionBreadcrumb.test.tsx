import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";

import { FundingSelectionBreadcrumb } from "../../../components/Funding/FundingSelectionBreadcrumb";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";

describe("FundingSelectionBreadcrumb ", () => {

    const setupComponent = (actionType: FundingActionType | undefined) =>{
        render(<BrowserRouter><FundingSelectionBreadcrumb actionType={actionType}  /></BrowserRouter>);
    }

    it("should say Funding approvals", () => {
        setupComponent(FundingActionType.Approve);
        expect(screen.getByText(/Funding approvals/)).toBeInTheDocument();
    });

    it("should say Release management", () => {
        setupComponent(FundingActionType.Release);
        expect(screen.getByText(/Release management/)).toBeInTheDocument();
    });
});
