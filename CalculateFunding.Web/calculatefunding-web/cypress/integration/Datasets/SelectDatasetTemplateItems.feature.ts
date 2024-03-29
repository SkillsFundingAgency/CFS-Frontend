﻿import { Server } from "miragejs";

import { makeServer, mockApiData } from "../../../src/mirage";
import { EligibleSpecificationReferenceModel } from "../../../src/types/Datasets/EligibleSpecificationReferenceModel";
import { PublishedSpecificationTemplateMetadata } from "../../../src/types/Datasets/PublishedSpecificationTemplateMetadata";
import { TemplateItemType } from "../../../src/types/Datasets/TemplateItemType";
import { ProviderDataTrackingMode } from "../../../src/types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../src/types/SpecificationSummary";
import { commonActions } from "../commonActions";

context("Select template items for a new dataset", () => {
  const data = mockApiData();
  const { specifyDatasetTypeToCreate_Released, selectReferenceSpecification, specifyDatasetDetails } =
    commonActions();

  let server: Server;

  before(() => setup());
  after(() => {
    server.shutdown();
  });

  describe("when page has loaded", () => {
    it("has correct title", () => {
      cy.findByRole("heading", { name: /Select funding lines and calculations/ }).should("exist");
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
      cy.findByRole("cell", { name: /Calculate total pupil mass/ }).should("exist");
      cy.findByRole("cell", { name: /162/ }).should("exist");
      cy.findByRole("cell", { name: /Calculation/ }).should("exist");
      cy.findByRole("cell", { name: /Sport allowance/ }).should("exist");
      cy.findByRole("cell", { name: /342/ }).should("exist");
      cy.findByRole("cell", { name: /Funding Line/ }).should("exist");
    });
    it("has Continue button", () => {
      cy.findByRole("button", { name: /Continue to summary/ }).should("exist");
    });
  });

  describe("when user clicks Continue without valid options", () => {
    it("shows error message", () => {
      cy.findByRole("button", { name: /Continue to summary/ }).click();

      cy.findByText(/Please make a selection/).should("exist");
    });
  });

  describe("when user selects items and clicks away to another page", () => {
    it("renders confirm leave modal popup", () => {
      cy.findByRole("checkbox", { name: /Calculate total pupil mass/ }).check();
      cy.findByRole("checkbox", { name: /Sport allowance/ }).check();
      cy.findByRole("link", { name: /Data set details/ }).click();
      cy.findByTestId("modal-confirmation-placeholder").should("exist");
    });
  });

  describe("when user selects items and clicks Continue", () => {
    it("goes to correct page", () => {
      setup();
      cy.findByRole("checkbox", { name: /Calculate total pupil mass/ }).check();
      cy.findByRole("checkbox", { name: /Sport allowance/ }).check();
      cy.findByRole("button", { name: /Continue to summary/ }).click();
      cy.findByTestId("modal-confirmation-placeholder").should("not.exist");
      cy.url().should("include", `/Datasets/Create/ConfirmDatasetToCreate/${data.spec1.id}`);
    });
  });

  function setup() {
    server?.shutdown();
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
    server.get(
      "/dataset-specifications/*",
      (schema, request): EligibleSpecificationReferenceModel[] | PublishedSpecificationTemplateMetadata[] => {
        if (request.url.includes("eligible-specification-references")) {
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
        } else if (request.url.includes("published-specification-template-metadata")) {
          return [
            {
              name: "Calculate total pupil mass",
              templateId: 162,
              type: TemplateItemType.Calculation,
            } as PublishedSpecificationTemplateMetadata,
            {
              name: "Sport allowance",
              templateId: 342,
              type: TemplateItemType.FundingLine,
            } as PublishedSpecificationTemplateMetadata,
          ];
        } else {
          return [];
        }
      }
    );
    cy.visit("/Datasets/Create/SelectDatasetTypeToCreate/" + data.spec1.id);
    specifyDatasetTypeToCreate_Released(server, data);
    selectReferenceSpecification(server, data);
    specifyDatasetDetails(server, data);
  }
});
