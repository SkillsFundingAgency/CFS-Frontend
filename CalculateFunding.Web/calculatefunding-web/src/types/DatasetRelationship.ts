import { DatasetRelationshipType } from "./Datasets/DatasetRelationshipType";

export interface DatasetDefinition {
  description: string;
  id: string;
  name: string;
}

export interface DatasetRelationship {
  definition: DatasetDefinition;
  relationshipDescription: string;
  relationshipType: DatasetRelationshipType;
  converterEligible: boolean;
  converterEnabled: boolean;
  isProviderData: boolean;
  id: string;
  name: string;
}
