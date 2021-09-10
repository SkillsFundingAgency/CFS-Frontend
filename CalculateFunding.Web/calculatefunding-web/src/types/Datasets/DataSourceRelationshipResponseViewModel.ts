import { DatasetRelationshipType } from "./DatasetRelationshipType";
import { DatasetVersionSummary } from "./DatasetVersionSummary";

export interface DatasetWithVersions {
  description: string;
  selectedVersion?: number;
  totalCount: number;
  versions: DatasetVersionSummary[];
  id: string;
  name: string;
}

export interface DataSourceRelationshipResponseViewModel {
  specificationId: string;
  specificationName: string;
  definitionId: string;
  definitionName: string;
  relationshipId: string;
  relationshipName: string;
  sourceSpecificationId: string;
  sourceSpecificationName: string;
  relationshipType: DatasetRelationshipType;
  datasets: DatasetWithVersions[];
}
