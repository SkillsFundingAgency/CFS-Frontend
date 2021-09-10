import { Author } from "../Calculations/Author";
import {DatasetDefinition} from "../DatasetDefinitions";
import { FundingStream } from "../viewFundingTypes";

export interface MergeDatasetViewModel {
  blobName: string;
  version: number;
  lastUpdatedDate: Date;
  publishStatus: string;
  definition: DatasetDefinition;
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
