import {Author} from "../Calculations/CalculationVersionHistorySummary";

export interface NewDatasetVersionResponseViewModel {
    blobUrl:string;
    datasetId:string;
    author: Author;
    version:number;
}

export interface NewDatasetVersionResponseErrorModel {
    Filename: string[];
    FundingStreamId: string[];
}