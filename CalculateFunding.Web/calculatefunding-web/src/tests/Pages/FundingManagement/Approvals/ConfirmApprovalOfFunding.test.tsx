import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Switch } from "react-router";

const renderConfirmApprovalOfFundingPage = () => {
    const { ConfirmApprovalOfFunding } = require("../../../../pages/FundingManagement/Approvals/ConfirmApprovalOfFunding");
    return render(
        <MemoryRouter initialEntries={["/FundingManagement/Approve/Confirm/PSG/AY-5/9e958b8d-793c-45da-b323-37bbe7424273"]}>
            <Switch>
                <Route path="/ViewCalculationResults/:calculationId" component={ConfirmApprovalOfFunding}/>
            </Switch>
        </MemoryRouter>
    );
};

describe("<ConfirmApprovalOfFunding /> ", () => {
    it("has label with correct text", () => {
        renderConfirmApprovalOfFundingPage();

        waitFor(() => expect(screen.getByText(/I acknowledge that the total provider amount shown may not be up to date/i)).toBeInTheDocument());
    });

    it("has checkbox for acknowledgement", () => {
        renderConfirmApprovalOfFundingPage();

        waitFor(() => expect(screen.getByRole("checkbox", {
            name: "acknowledgementCheckbox"
        })).toBeInTheDocument());
    });

    it("clicking the acknowledgement label checks the checkbox", () => {
        renderConfirmApprovalOfFundingPage();

        waitFor(() => screen.getByLabelText(/I acknowledge that the total provider amount shown may not be up to date/i).click());
        waitFor(() => expect(screen.getByLabelText(/I acknowledge that the total provider amount shown may not be up to date/i)).toBeChecked());
    });


})
