import { Facet } from "../Facet";
import { PagerState } from "../PagerState";

export interface SpecificationListResultsItem {
  id: string;
  name: string;
  status: string;
  description: string;
  isSelectedForFunding: boolean;
  fundingPeriodName: string;
  fundingPeriodId: string;
  fundingStreamIds?: string[];
  fundingStreamNames: string[];
  lastUpdatedDate?: Date;
}

export interface SpecificationListResults {
  items: SpecificationListResultsItem[];
  facets: Facet[];
  endItemNumber: number;
  startItemNumber: number;
  totalCount: number;
  pagerState: PagerState;
}
