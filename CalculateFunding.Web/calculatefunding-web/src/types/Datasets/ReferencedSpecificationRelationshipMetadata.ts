import {DatasetTemplateMetadata} from "./DatasetMetadata";

export interface ReferencedSpecificationRelationshipMetadata {
    relationshipId: string;
    relationshipName: string;
    relationshipDescription: string;
    fundingStreamId: string;
    fundingStreamName: string;
    fundingPeriodId: string;
    fundingPeriodName: string;
    referenceSpecificationId: string;
    referenceSpecificationName: string;
    currentSpecificationId: string;
    currentSpecificationName: string;
    fundingLines: DatasetTemplateMetadata[];
    calculations: DatasetTemplateMetadata[];
}