import { Server } from "miragejs";

import { makeServer } from "../../../src/mirage";

context("Funding management approval selection page", () => {
    let server: Server;

    before(() => {
        // @ts-ignore
        server = makeServer("test");

        cy.visit("/FundingManagement/Approve/Selection");
    });

    after(() => {
        server.shutdown();
    })

    describe("when page has loaded", () => {
        it("has correct title", () => {
            cy.findByRole("heading", { name: /Funding approvals/, level: 1 }).should(
                "exist"
            );
        });

        it("has correct subtitle", () => {
            cy.findByRole("heading", {
                name: /Select a funding stream and funding period./,
                level: 3
            }).should(
                "exist"
            );
        });
    });
});
