context("Funding management landing page", () => {
    before(() => {
        cy.visit("/FundingManagement");
    });

    describe("when page has loaded", () => {
        it("has correct title", () => {
            cy.findByRole("heading", { name: /Funding management/, level: 1 }).should(
                "exist"
            );
        });
        it("has correct subtitle", () => {
            cy.findByRole("heading", {
                name: /Approve allocations and release allocations for statement and funding./,
                level: 3
            }).should(
                "exist"
            );
        });
        it("has link to Funding approvals", () => {
            cy.findAllByRole("link", { name: "Funding approvals" }).should("exist");
        });

        it("has correct text below link to Funding approvals", () => {
            cy.findByText(/Approve allocations for funding./).should("exist");
        });

        it("has link to Release management", () => {
            cy.findAllByRole("link", { name: "Release management" }).should("exist");
        });

        it("has correct text below link to Release management", () => {
            cy.findByText(/Release allocations for statement of funding./).should("exist");
        });
    });

});
