import { DatasetRelationshipType } from "./DatasetRelationshipType";

export interface CreateDatasetSpecificationRelationshipRequest {
  specificationId: string; // the current specification the user is adding the relationship to
  targetSpecificationId: string; // reference specification chosen by user
  name: string; // dataset name
  description: string; // dataset description
  relationshipType: DatasetRelationshipType;
  fundingLineIds: number[];
  calculationIds: number[];
}
