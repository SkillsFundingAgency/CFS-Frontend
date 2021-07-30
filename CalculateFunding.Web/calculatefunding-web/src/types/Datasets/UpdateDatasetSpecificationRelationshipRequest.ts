export interface UpdateDatasetSpecificationRelationshipRequest {
    specificationId: string;
    relationshipId: string;
    description: string;
    fundingLineIds: number[];
    calculationIds: number[];
}