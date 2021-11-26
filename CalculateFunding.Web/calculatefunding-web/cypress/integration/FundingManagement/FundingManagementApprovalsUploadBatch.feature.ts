import { Server } from "miragejs";

import { makeServer } from "../../../src/mirage";

context("Funding management approval selection page", () => {
    let server: Server;

    function setup() {
        server = makeServer({ environment: "test" });
        server.options("https://sr-t1dv-cfs-v2.service.signalr.net/*", () =>{
            return { status: 201 }
        })

        cy.visit("/FundingManagementApprovalsUploadBatch/GAG/AC-2122/84f7cc6c-648e-4947-82e6-22ee1776fa1b");
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
                name: /Funding approvals/
            }).should("exist");
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

        it("should disable the Approve funding button when there is no file chosen", () => {
            cy.findByRole("button", {
                name: /Approve funding/
            }).should("exist");

            cy.findByRole("button", {
                name: /Approve funding/
            }).should("be.disabled");
        });
    });

});
