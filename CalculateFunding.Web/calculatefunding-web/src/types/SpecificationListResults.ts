import {Facet} from "./Facet";

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
    pageSize: number;
    pageNumber: number;
    totalPages: number;
    totalItems: number;
    totalErrorItems: number;
    items: SpecificationListResultsItem[];
    facets: Facet[];
}

