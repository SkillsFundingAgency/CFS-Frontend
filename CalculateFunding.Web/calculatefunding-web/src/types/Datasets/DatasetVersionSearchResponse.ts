export interface DatasetVersionSearchResponse {
  results: DatasetVersionDetails[];
  pageSize: number;
  totalResults: number;
  totalErrorResults: number;
  currentPage: number;
  startItemNumber: number;
  endItemNumber: number;
  pagerState: PagerState;
  facets: any;
}

export interface DatasetVersionDetails {
  id: string;
  datasetId: string;
  name: string;
  description: string;
  changeNote: string;
  changeType: DatasetChangeType;
  version: number;
  definitionName: string;
  lastUpdatedDate: Date;
  lastUpdatedByName: string;
  blobName: string;
  fundingStreamId: string;
  fundingStreamName: string;
}

export interface PagerState {
  displayNumberOfPages: number;
  previousPage: number;
  nextPage: number;
  lastPage: number;
  pages: number[];
  currentPage: number;
}

export enum DatasetChangeType {
  Unknown = "Unknown",
  NewVersion = "NewVersion",
  Merge = "Merge",
  ConverterWizard = "ConverterWizard",
}
