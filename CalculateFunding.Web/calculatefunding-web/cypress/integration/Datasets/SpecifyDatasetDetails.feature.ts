import { Server } from "miragejs";

import { makeServer, mockApiData } from "../../../src/mirage";
import { EligibleSpecificationReferenceModel } from "../../../src/types/Datasets/EligibleSpecificationReferenceModel";
import { ProviderDataTrackingMode } from "../../../src/types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../src/types/SpecificationSummary";
import { commonActions } from "../commonActions";

context("Specify dataset details for a new dataset", () => {
  const data = mockApiData();
  const { specifyDatasetTypeToCreate_Released, selectReferenceSpecification } = commonActions();

  let server: Server;

  before(() => {
    server = makeServer({ environment: "test" });
    server.get("/specs/*", () => {
      return {
        id: "111",
        name: "PSG 19-20",
        fundingPeriod: data.fundingPeriod1,
        fundingStreams: [data.fundingStream1],
        lastUpdatedDate: undefined,
        approvalStatus: "Draft",
        description: "lorem ipsum lalala",
        isSelectedForFunding: false,
        templateIds: {},
        coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest,
        providerSnapshotId: undefined,
        dataDefinitionRelationshipIds: [],
        providerVersionId: "",
      } as SpecificationSummary;
    });
    server.get("/dataset-specifications/*", () => {
      return [
        {
          specificationId: data.spec2.id,
          specificationName: data.spec2.name,
          fundingStreamId: data.fundingStream2.id,
          fundingStreamName: data.fundingStream2.name,
          fundingPeriodId: data.fundingPeriod2.id,
          fundingPeriodName: data.fundingPeriod2.name,
        } as EligibleSpecificationReferenceModel,
      ];
    });
    cy.visit("/Datasets/Create/SelectDatasetTypeToCreate/" + data.spec1.id);
    specifyDatasetTypeToCreate_Released(server, data);
    selectReferenceSpecification(server, data);
  });
  after(() => {
    server.shutdown();
  });

  describe("when page has loaded", () => {
    it("has correct title", () => {
      cy.findByRole("heading", { name: /Create data set/ }).should("exist");
    });
    it("has link to spec", () => {
      cy.findByRole("link", { name: data.spec1.name }).should("exist");
    });
    it("has dataset name prompt", () => {
      cy.findByRole("textbox", { name: /Data set name/ }).should("exist");
    });
    it("has description prompt", () => {
      cy.findByRole("textbox", { name: /Description/ }).should("exist");
    });
    it("has Continue button", () => {
      cy.findByRole("button", { name: /Continue/ }).should("exist");
    });
  });

  describe("when user clicks Continue without valid options", () => {
    it("shows error message", () => {
      cy.findByRole("link", { name: data.spec1.name }).should("exist");
      cy.findByRole("button", { name: /Continue/ }).click();

      cy.findAllByText(/Provide a data set name/).should("exist");
      cy.findAllByText(/Provide a data set description/).should("exist");
    });
  });

  describe("when user enters valid inputs and clicks Continue", () => {
    it("goes to correct page", () => {
      cy.findByRole("link", { name: data.spec1.name }).should("exist");
      cy.findByRole("textbox", { name: /Data set name/ }).type("imaginative data set name");
      cy.findByRole("textbox", { name: /Description/ }).type("lorem ipsum description");
      cy.findByRole("button", { name: /Continue/ }).click();
      cy.url().should("include", `/Datasets/Create/SelectDatasetTemplateItems/${data.spec1.id}`);
    });
  });
});
