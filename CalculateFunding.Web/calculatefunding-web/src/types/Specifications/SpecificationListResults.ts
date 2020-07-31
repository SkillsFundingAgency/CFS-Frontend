import {Facet} from "../Facet";
import {PagerState} from "../PagerState";

export interface SpecificationListResultsItem {
    fundingPeriodName: string;
    fundingPeriodId?: any;
    fundingStreamNames: string[];
    fundingStreamIds?: any;
    lastUpdatedDate: Date;
    status: string;
    description: string;
    id: string;
    name: string;
}

export interface SpecificationListResults {
    items: SpecificationListResultsItem[];
    facets: Facet[];
    endItemNumber:number;
    startItemNumber:number;
    totalCount:number;
    pagerState: PagerState;
}

