    import {FundingStream} from "../viewFundingTypes";
    import {Author} from "../Calculations/Author";
    import {Definition} from "../DatasetSummary";

    export interface MergeDatasetViewModel {
        blobName: string;
        version: number;
        lastUpdatedDate: Date;
        publishStatus: string;
        definition: Definition;
        description: string;
        author: Author;
        comment: string;
        currentDataSourceRows: number;
        previousDataSourceRows: number;
        newRowCount: number;
        amendedRowCount: number;
        fundingStream: FundingStream;
        id: string;
        name: string;
    }
