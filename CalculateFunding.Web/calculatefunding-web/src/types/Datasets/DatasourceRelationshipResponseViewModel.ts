import {Version} from "./Version";

export interface Dataset {
    selectedVersion: number;
    versions: Version[];
    id: string;
    name: string;
}

export interface DatasourceRelationshipResponseViewModel {
    specificationId: string;
    specificationName: string;
    definitionId: string;
    definitionName: string;
    relationshipId: string;
    relationshipName: string;
    datasets: Dataset[];
}