export interface PublishedSpecificationTemplateMetadata {
    name: string;
    templateId: number;
    type: TemplateItemType
}

export enum TemplateItemType {
    Calculation = 'Calculation',
    FundingLine = 'FundingLine',
}

export enum DatasetRelationshipType {
    Uploaded = 'Uploaded',
    ReleasedData = 'ReleasedData',
}

export interface ValidateDefinitionSpecificationRelationshipModel
{
    specificationId: string;
    name: string;
    targetSpecificationId: string;
}

export interface CreateDatasetSpecificationRelationshipRequest
{
    specificationId: string; // the current specification the user is adding the relationship to
    targetSpecificationId: string; // reference specification chosen by user
    name: string; // dataset name
    description: string; // dataset description
    relationshipType: DatasetRelationshipType;
    fundingLineIds: number[];
    calculationIds: number[];
}