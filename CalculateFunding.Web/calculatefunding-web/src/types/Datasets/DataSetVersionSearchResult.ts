import { DatasetVersionSummary } from "./DatasetVersionSummary";
import { PagerState } from "../PagerState";

export interface DataSetVersionSearchResult {
  totalCount: number;
  startItemNumber: number;
  endItemNumber: number;
  items: DatasetVersionSummary[];
  facets?: any;
  pagerState: PagerState;
  name: string;
  id: string;
  description: string;
}
