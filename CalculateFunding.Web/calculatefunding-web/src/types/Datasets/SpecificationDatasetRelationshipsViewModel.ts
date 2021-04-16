import {Specification} from "../viewFundingTypes";
import {SpecificationTrimmedViewModel} from "./SpecificationTrimmedViewModel";

export interface SpecificationDatasetRelationshipsViewModel {
    items: SpecificationDatasetRelationshipsViewModelItem[];
    specification: Specification;
    specificationTrimmedViewModel: SpecificationTrimmedViewModel;
}

export interface SpecificationDatasetRelationshipsViewModelItem {
    definitionId: string;
    definitionName: string;
    definitionDescription: string;
    datasetName: string;
    relationshipDescription: string;
    datasetVersion: number;
    datasetId: string;
    relationshipId: string;
    relationName: string;
    isProviderData: boolean;
    datasetPhrase: string;
    linkPhrase: string;
    isLatestVersion: boolean,
    lastUpdatedDate: Date,
    lastUpdatedAuthorName: string,
    hasDataSourceFileToMap: boolean
}

