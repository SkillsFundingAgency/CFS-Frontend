import { DatasetWithVersions } from "./DataSourceRelationshipResponseViewModel";

export interface DataSourceSelection {
  dataset: DatasetWithVersions | undefined;
  version: number | undefined;
}
