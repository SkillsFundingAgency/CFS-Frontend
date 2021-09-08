import { makeServer } from "../../../src/mirage";
import { Server } from "miragejs";
import { FundingPeriod, FundingStream } from "../../../src/types/viewFundingTypes";
import {
  SpecificationDatasetRelationshipsViewModel,
  SpecificationDatasetRelationshipsViewModelItem,
} from "../../../src/types/Datasets/SpecificationDatasetRelationshipsViewModel";
import { DatasetRelationshipType } from "../../../src/types/Datasets/DatasetRelationshipType";

context("Given a specification with data relationships", () => {
  let server: Server;

  before(() => {
    server = makeServer({ environment: "test" });
    server.get(
      "/datasetRelationships/get-sources",
      (schema, request): SpecificationDatasetRelationshipsViewModel => dataRelationshipResponse
    );

    cy.visit(`/Datasets/DataRelationships/${specification.id}`);
  });
  after(() => {
    server.shutdown();
  });

  describe("when page has loaded", () => {
    it("displays the specification name", () => {
      cy.findByRole("heading", { name: dataRelationshipResponse.specification.name }).should("exist");
    });
    it("displays the funding period name", () => {
      cy.findByText(dataRelationshipResponse.specification.fundingPeriod.name).should("exist");
    });
    it("displays all the expected relationship names", () => {
      cy.contains(dataRelationship1.relationName);
      cy.contains(dataRelationship2.relationName);
    });
    it("displays correct number of relationships", () => {
      cy.findAllByRole("rowheader").should("have.length", 2);
    });
    it("displays the link to Manage specification", () => {
      cy.findByRole("link", { name: /Manage specification/i })
        .should("have.attr", "href")
        .and("include", "/ViewSpecification/" + specification.id);
    });
    it("displays link to add a new data set", () => {
      cy.findByRole("link", { name: /Add new data set/i })
        .should("have.attr", "href")
        .and("include", "/Datasets/CreateDataset/" + specification.id);
    });
  });

  const fundingStream: FundingStream = {
    name: "FS123",
    id: "Wizard Training Scheme",
  };
  const fundingPeriod: FundingPeriod = {
    id: "FP123",
    name: "2019-20",
  };
  const specification = {
    name: "Test Spec Name",
    id: "dx93crtft5y8sh5tsl",
    approvalStatus: "Draft",
    isSelectedForFunding: true,
    description: "Spec description lorem ipsum",
    providerVersionId: "provider-version-432",
    fundingStreams: [fundingStream],
    fundingPeriod: fundingPeriod,
    lastEditedDate: new Date(),
    dataDefinitionRelationshipIds: [],
    templateIds: {},
  };

  function makeDataRelationship(props: {
    relationshipId: string;
    relationName: string;
    datasetName: string;
    hasDataSourceFileToMap: boolean;
    type: DatasetRelationshipType;
  }): SpecificationDatasetRelationshipsViewModelItem {
    return {
      converterEligible: false,
      converterEnabled: false,
      datasetId: "asdfasdf",
      datasetName: props.datasetName,
      datasetVersion: 0,
      definitionDescription: "",
      definitionId: "",
      definitionName: "",
      hasDataSourceFileToMap: props.hasDataSourceFileToMap,
      isLatestVersion: false,
      isProviderData: false,
      lastUpdatedAuthorName: "",
      lastUpdatedDate: new Date(),
      relationName: props.relationName,
      relationshipDescription: "",
      relationshipId: props.relationshipId,
      relationshipType: props.type,
      referencedSpecificationName: "",
    };
  }

  const dataRelationship1 = makeDataRelationship({
    relationshipId: "rel111",
    relationName: "Relation 111",
    datasetName: "Dataset AAA",
    hasDataSourceFileToMap: true,
    type: DatasetRelationshipType.Uploaded,
  });
  const dataRelationship2 = makeDataRelationship({
    relationshipId: "rel222",
    relationName: "Relation 222",
    datasetName: "Dataset BBB",
    hasDataSourceFileToMap: true,
    type: DatasetRelationshipType.ReleasedData,
  });
  const noDataRelationshipResponse: SpecificationDatasetRelationshipsViewModel = {
    items: [],
    specification: specification,
    specificationTrimmedViewModel: undefined,
  };
  const dataRelationshipResponse: SpecificationDatasetRelationshipsViewModel = {
    items: [dataRelationship1, dataRelationship2],
    specification: specification,
    specificationTrimmedViewModel: undefined,
  };
});
