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
      cy.findByRole("heading", { name: /My user permissions/ }).should("exist");
    });

    it("has Funding Stream dropdown list", () => {
      cy.findByRole("combobox", { name: /Select funding stream/i }).should("exist");
    });
  });

  describe("when user selects Funding Stream", () => {
    it("shows permission categories", () => {
      cy.findByRole("combobox", { name: /Select funding stream/i }).select("DSG");

      cy.findByRole("heading", { name: /Administration permissions/i }).should("exist");
    });
  });

  function setup() {
    server?.shutdown();
    server = makeServer({ environment: "test" });

    cy.visit("/Permissions/MyPermissions");
  }
});
