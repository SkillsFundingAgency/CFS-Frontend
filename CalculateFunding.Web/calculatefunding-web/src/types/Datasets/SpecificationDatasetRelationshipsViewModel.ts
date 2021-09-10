import { Specification } from "../viewFundingTypes";
import { DatasetRelationshipType } from "./DatasetRelationshipType";
import { SpecificationTrimmedViewModel } from "./SpecificationTrimmedViewModel";

export interface SpecificationDatasetRelationshipsViewModel {
  items: SpecificationDatasetRelationshipsViewModelItem[];
  specification: Specification;
  specificationTrimmedViewModel?: SpecificationTrimmedViewModel;
}

export interface SpecificationDatasetRelationshipsViewModelItem {
  definitionId: string;
  definitionName: string;
  definitionDescription: string;
  datasetName: string | null;
  relationshipType: DatasetRelationshipType;
  relationshipDescription: string;
  referencedSpecificationName: string;
  datasetVersion: number;
  datasetId: string;
  converterEnabled: boolean;
  converterEligible: boolean;
  relationshipId: string;
  relationName: string;
  isProviderData: boolean;
  isLatestVersion: boolean;
  lastUpdatedDate: Date;
  lastUpdatedAuthorName: string;
  hasDataSourceFileToMap: boolean;
}
