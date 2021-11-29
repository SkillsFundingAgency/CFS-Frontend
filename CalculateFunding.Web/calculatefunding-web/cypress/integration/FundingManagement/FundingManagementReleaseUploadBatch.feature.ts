import { Server } from "miragejs";

import { makeServer } from "../../../src/mirage";

context("Funding management release selection page", () => {
    let server: Server;

    function setup() {
        server = makeServer({ environment: "test" });
        server.options("https://sr-t1dv-cfs-v2.service.signalr.net/*", () =>{
            return { status: 201 }
        })

        cy.visit("/FundingManagementReleaseUploadBatch/GAG/AC-2122/84f7cc6c-648e-4947-82e6-22ee1776fa1b");
    }

    before(() => setup());

    after(() => {
        server.shutdown();
    })

    describe("when page has loaded it ", () => {

        it("has the correct breadcrumbs", () => {
            cy.get("#breadcrumbs").findByRole("link", {
                name: /Calculate funding/
            }).should("exist");

            cy.get("#breadcrumbs").findByRole("link", {
                name: /Funding management/
            }).should("exist");

            cy.get("#breadcrumbs").findByRole("link", {
                name: /Release management/
            }).should("exist");

            cy.get("#breadcrumbs").findByText(/Upload batch file/).should("exist");
        });

        it("has correct title", () => {
            cy.findByRole("heading", { name: /Upload batch file/, level: 1 }).should(
                "exist"
            );
        });
        it("has correct information text", () => {
            cy.findByText(/The file is in xlsx format/).should(
                "exist"
            );
            cy.findByText(/The file contains one UKPRN column/).should(
                "exist"
            );
            cy.findByText(/The upload data must be in the first sheet of the xlsx file/).should(
                "exist"
            );
            cy.findByText(/Providers already approved or released will not be shown in the provider count summaries/).should(
                "exist"
            );
        });

        it("should disable the Continue button when there is no file chosen", () => {
            cy.findByRole("button", {
                name: /Continue/
            }).should("exist");

            cy.findByRole("button", {
                name: /Continue/
            }).should("be.disabled");
        });
    });

    describe("when page has loaded it ", () => {
        it("should return to selection page when Cancel button is pressed", () => {
            cy.findByRole("link", {
                name: /Cancel/
            }).should("exist");

            cy.findByRole("link", {
                name: /Cancel/,
            }).click();

           cy.findByRole("heading", {
               name: /Release management/,
               level: 1
           }).should("exist")

        });
    });

});
