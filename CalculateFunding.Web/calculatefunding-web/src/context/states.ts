import {EligibleSpecificationReferenceModel} from "../types/Datasets/EligibleSpecificationReferenceModel";
import {PublishedSpecificationTemplateMetadata} from "../types/Datasets/PublishedSpecificationTemplateMetadata";
import {DatasetTemplateMetadataWithType} from "../types/Datasets/DatasetMetadata";
import {ReferencedSpecificationRelationshipMetadata} from "../types/Datasets/ReferencedSpecificationRelationshipMetadata";

export interface AppContextState {
    createDatasetWorkflowState?: CreateDatasetWorkflowState,
    editDatasetWorkflowState?: EditDatasetWorkflowState,
}

export interface CreateDatasetWorkflowState {
    forSpecId?: string,
    datasetName?: string,
    datasetDescription?: string,
    referencingSpec?: EligibleSpecificationReferenceModel,
    selectedItems?: PublishedSpecificationTemplateMetadata[]
}

export interface EditDatasetWorkflowState {
    relationshipId: string,
    relationshipMetadata?: ReferencedSpecificationRelationshipMetadata,
    relationshipDescription?: string,
    selectedItems?: DatasetTemplateMetadataWithType[]
}