import { FundingLineUpdateModel } from "../TemplateBuilderDefinitions";
import {Author} from "../Calculations/Author";

export interface NewDatasetVersionResponseViewModel {
    blobUrl: string;
    datasetId: string;
    fundingStreamId: string;
    author: Author;
    version: number;
    filename: string;
}

export interface NewDatasetVersionResponseErrorModel {
    Filename: string[];
    FundingStreamId: string[];
}