import {DatasetVersion} from "./DatasetVersion";

export interface Dataset {
    description: string;
    selectedVersion: number;
    versions: DatasetVersion[];
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
