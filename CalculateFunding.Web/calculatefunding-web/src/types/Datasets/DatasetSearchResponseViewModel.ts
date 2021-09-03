import { PagerState } from "./DatasetDefinitionResponseViewModel";

export interface Dataset {
  description: string;
  status: string;
  lastUpdated: Date;
  lastUpdatedDisplay: string;
  version: number;
  changeNote: string;
  changeType: string;
  lastUpdatedByName: string;
  definitionName: string;
  fundingStreamId: string;
  id: string;
  name: string;
}

export interface DatasetSearchResponseViewModel {
  datasets: Dataset[];
  totalResults: number;
  totalErrorResults: number;
  currentPage: number;
  startItemNumber: number;
  endItemNumber: number;
  pagerState: PagerState;
  facets: any[];
}
