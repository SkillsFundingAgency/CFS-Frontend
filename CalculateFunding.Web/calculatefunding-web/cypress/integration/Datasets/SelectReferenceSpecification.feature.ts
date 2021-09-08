import { makeServer, mockApiData } from "../../../src/mirage";
import { Server } from "miragejs";
import { ProviderDataTrackingMode } from "../../../src/types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../src/types/SpecificationSummary";
import { EligibleSpecificationReferenceModel } from "../../../src/types/Datasets/EligibleSpecificationReferenceModel";
import { commonActions } from "../commonActions";

context("Select reference Specification for creating a new dataset", () => {
  const data = mockApiData();
  const { specifyDatasetTypeToCreate_Released } = commonActions();

  let server: Server;

  before(() => {
    server = makeServer({ environment: "test" });
    server.get("/specs/*", (schema, request) => {
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
    server.get("/dataset-specifications/*", (schema, request) => {
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
  });
  afterEach(() => {
    server.shutdown();
  });

  describe("when page has loaded", () => {
    it("has correct title", () => {
      cy.findByRole("heading", { name: /Create data set/ }).should("exist");
    });
    it("has link to spec", () => {
      cy.findByRole("link", { name: data.spec1.name }).should("exist");
    });
    it("has Funding Stream dropdown list", () => {
      cy.findByRole("combobox", { name: /Select funding stream/ }).should("exist");
    });
    it("has no Continue button", () => {
      cy.findByRole("button", { name: /Continue/ }).should("not.exist");
    });
  });

  describe("when user selects funding stream option", () => {
    it("displays funding periods", () => {
      cy.findByRole("link", { name: data.spec1.name }).should("exist");
      cy.findByRole("combobox", { name: /Select funding stream/ }).select(data.fundingStream2.name);
      cy.findByText(/Funding period/).should("exist");
      cy.findByRole("combobox", { name: /Select funding period/ }).should("exist");
    });
  });

  describe("when user selects both options", () => {
    it("displays specification name and Continue button", () => {
      cy.findByRole("link", { name: data.spec1.name }).should("exist");
      cy.findByRole("combobox", { name: /Select funding stream/ }).select(data.fundingStream2.name);
      cy.findByRole("combobox", { name: /Select funding period/ }).select(data.fundingPeriod2.name);
      cy.findByText(data.spec2.name).should("exist");
      cy.findByRole("button", { name: /Continue/ }).should("exist");
    });
  });

  describe("when user selects both options and clicks on Continue", () => {
    it("goes to correct page", () => {
      cy.findByRole("combobox", { name: /Select funding stream/ }).select(data.fundingStream2.name);
      cy.findByRole("combobox", { name: /Select funding period/ }).select(data.fundingPeriod2.name);
      cy.findByText(data.spec2.name).should("exist");
      cy.findByRole("button", { name: /Continue/ }).click();
      cy.url().should("include", "/Datasets/Create/SpecifyDatasetDetails");
    });
  });
});

context("Create new dataset when no available specifications to reference", () => {
  const data = mockApiData();
  const { specifyDatasetTypeToCreate_Released } = commonActions();

  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: "test" });
    server.get("/specs/*", (schema, request) => {
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
    server.get("/dataset-specifications/*", (schema, request) => {
      return [];
    });
    cy.visit("/Datasets/Create/SelectDatasetTypeToCreate/" + data.spec1.id);
    specifyDatasetTypeToCreate_Released(server, data);
  });
  afterEach(() => {
    server.shutdown();
  });

  describe("when page has loaded", () => {
    it("has correct title", () => {
      cy.findByRole("heading", { name: /Create data set/ }).should("exist");
    });
    it("has link to spec", () => {
      cy.findByRole("link", { name: data.spec1.name }).should("exist");
    });
    it("renders the no-options message", () => {
      cy.findByText(
        /There are no funding streams to select. There is either no data sharing enabled with the funding stream of the current specification or there are no enabled funding streams with released data./
      ).should("exist");
    });
    it("has no Continue button", () => {
      cy.findByRole("button", { name: /Continue/ }).should("not.exist");
    });
  });
});
