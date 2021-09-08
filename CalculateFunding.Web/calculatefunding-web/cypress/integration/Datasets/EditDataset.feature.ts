import { makeServer, mockApiData } from "../../../src/mirage";
import { Server } from "miragejs";
import { ReferencedSpecificationRelationshipMetadata } from "../../../src/types/Datasets/ReferencedSpecificationRelationshipMetadata";

context("Select template items for a new dataset", () => {
  const data = mockApiData();

  let server: Server;

  before(() => {
    server = makeServer({ environment: "test" });
    server.get(
      "/specifications/*",
      (schema, request): ReferencedSpecificationRelationshipMetadata | Record<string, unknown> => {
        if (request.url.includes("/dataset-relationship/")) {
          return data.relationshipMetadata1;
        } else {
          return {};
        }
      }
    );

    cy.visit(`/Datasets/${data.relationshipMetadata1.relationshipId}/Edit/${data.spec1.id}`);
  });
  after(() => {
    server.shutdown();
  });

  describe("when page has loaded", () => {
    it("has correct title", () => {
      cy.findByRole("heading", { name: /Check funding lines and calculations/ }).should("exist");
    });
    it("has link to spec", () => {
      cy.findByRole("link", { name: data.spec1.name }).should("exist");
    });
    it("has Funding stream", () => {
      cy.findByRole("definition", { name: /Funding stream/ }).should("exist");
    });
    it("has Funding period", () => {
      cy.findByRole("definition", { name: /Funding period/ }).should("exist");
    });
    it("has Reference specification", () => {
      cy.findByRole("definition", { name: /Reference specification/ }).should("exist");
    });
    it("has table with correct column headings", () => {
      cy.findByRole("table", { name: /Template items to select/ }).should("exist");
    });
    it("has table with correct column values", () => {
      cy.findByRole("cell", { name: data.calc1.name }).should("exist");
      cy.findByRole("cell", { name: data.calc1.templateId.toString() }).should("exist");
      cy.findAllByRole("cell", { name: /Calculation/ }).should("exist");
      cy.findByRole("cell", { name: /calc b OBSOLETE/i }).should("exist");
      cy.findByRole("cell", { name: data.calc2.templateId.toString() }).should("exist");
      cy.findByRole("cell", { name: data.fundingLine1.name }).should("exist");
      cy.findByRole("cell", { name: data.fundingLine1.templateId.toString() }).should("exist");
      cy.findByRole("cell", { name: /Funding Line/ }).should("exist");
    });
    it("has Continue button", () => {
      cy.findByRole("button", { name: /Continue to summary/ }).should("exist");
    });
  });

  describe("when user clicks Continue without any selections", () => {
    it("shows error message", () => {
      cy.findByRole("checkbox", { name: data.calc1.name }).uncheck();
      cy.findByRole("checkbox", { name: /calc b OBSOLETE/i }).uncheck();
      cy.findByRole("checkbox", { name: data.fundingLine1.name }).uncheck();
      cy.findByRole("button", { name: /Continue to summary/ }).click();

      cy.findByText(/Please make a selection/).should("exist");
    });
  });

  describe("when user selects extra item and clicks Continue", () => {
    it("goes to correct page", () => {
      cy.findByRole("checkbox", { name: /calc b OBSOLETE/i }).check();
      cy.findByRole("button", { name: /Continue to summary/ }).click();
      cy.url().should(
        "include",
        `/Datasets/${data.relationshipMetadata1.relationshipId}/ConfirmEdit/${data.spec1.id}`
      );
    });
  });
});
