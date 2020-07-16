import {Author} from "../Calculations/Author";

export interface UpdateNewDatasetVersionResponseViewModel {
    blobUrl: string;
    definitionId: string;
    datasetId: string;
    author: Author;
    name: string;
    description: string;
    fundingStreamId: string;
    filename: string;
    version: number;
}

export interface DatasetValidateStatusResponse
{
    operationId: string;
    currentOperation: string;
    errorMessage: string;
    lastUpdated: Date;
    lastUpdatedFormatted: string;
    datasetId: string;
    validationFailures: { [key: string]: string[] };
}

export let ValidationStates: { [state: string]: string } = {
    "Queued": "Queued for processing",
    "Processing": "Processing and prevalidation checks",
    "ValidatingExcelWorkbook": "Validating Excel Workbook",
    "ValidatingTableResults": "Validating data and providers",
    "SavingResults": "Saving results",
    "FailedValidation": "Validation failed",
    "ExceptionThrown": "Internal server error",
    "Validated": "Validated",
};