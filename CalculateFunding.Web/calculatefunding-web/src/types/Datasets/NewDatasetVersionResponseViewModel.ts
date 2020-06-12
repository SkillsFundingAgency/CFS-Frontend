import {Author} from "../Calculations/CalculationVersionHistorySummary";
import { FundingLineUpdateModel } from "../TemplateBuilderDefinitions";

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