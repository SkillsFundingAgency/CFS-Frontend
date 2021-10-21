import { Server } from "miragejs";

import { makeServer } from "../../../src/mirage";

context("View my own permissions", () => {
  let server: Server;

  before(() => {
    setup();
  });
  after(() => {
    server.shutdown();
  });

  describe("when page has loaded", () => {
    it("has correct title", () => {
      cy.findByRole("heading", { name: /Would you like to view user permissions for/i }).should("exist");
    });

    it("has Individual option", () => {
      cy.findByRole("radio", { name: /An individual user/i }).should("exist");
    });
  });

  describe("when user selects 'individual user' and 'continue'", () => {
    before(() => {
      cy.findByRole("radio", { name: /An individual user/i }).click();
      cy.findByRole("button", { name: /Continue/i }).click();
    });

    it("loads the next page", () => {
      cy.url().should("include", "/Permissions/Individual");
    });

    it("has correct title", () => {
      cy.findByRole("heading", { name: /Set and view user permissions/i }).should("exist");
    });

    it("shows dropdown for selecting individual user", () => {
      cy.findByTestId("input-auto-complete").should("exist");
    });

    describe("when user selects 'individual user' and 'continue'", () => {
      before(() => {
        cy.findByTestId("input-auto-complete").should("exist").type("Lulu");
      });

      it("loads the next page", () => {
        cy.url().should("include", "/Permissions/Individual");
      });
    });
  });

  function setup() {
    server?.shutdown();
    server = makeServer({ environment: "test" });

    cy.visit("/Permissions/Admin");
  }
});
