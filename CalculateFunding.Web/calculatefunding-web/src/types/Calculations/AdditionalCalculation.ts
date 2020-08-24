import {PagerState} from "../PagerState";

export interface AdditionalCalculation {
    id: string;
    name: string;
    status: string;
    valueType: string;
    lastUpdatedDate: Date;
    value: object;
}

export interface AdditionalCalculationSearchResultViewModel {
    totalCount: number;
    results: AdditionalCalculation[];
    totalResults: number;
    totalErrorResults: number;
    currentPage: number;
    lastPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: any[];
}