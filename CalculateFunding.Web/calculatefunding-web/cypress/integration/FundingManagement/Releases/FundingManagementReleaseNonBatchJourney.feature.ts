import { Server } from "miragejs";

import { makeServer } from "../../../../src/mirage";

context("Funding management for release non-batch full journey", () => {
    let server: Server;

    function setup() {
        server = makeServer({ environment: "test" });
        server.options("https://sr-t1dv-cfs-v2.service.signalr.net/*", () => {
            return { status: 201 }
        })
        server = makeServer({ environment: "test" });



        cy.visit("/");
    }

    before(() => setup());

    after(() => {
        server.shutdown();
    })

    it("navigates to Release Management using the link", () => {
        //todo: when the page is live then change to findByRole and use page link from root
        cy.visit("/FundingManagement")

        cy.findByRole("link", {
            name: /Release management/
        }).click();

        cy.findByRole("heading", {
            level: 1,
            name: /Release management/
        })

        cy.findByRole("heading", {
            level: 3,
            name: /Select a funding stream and funding period./
        })
    })
})
