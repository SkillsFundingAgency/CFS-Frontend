import {PublishStatus} from "./PublishStatusModel";
import {ValueType} from "./ValueType";

export interface CalculationSearchResponse {
    totalCount: number;
    results: CalculationSearchResult[];
    totalResults: number;
    totalErrorResults: number;
    currentPage: number;
    lastPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: any[];
}

export interface CalculationSearchResultResponse {
    totalCount: number;
    calculations: CalculationSearchResult[];
    totalResults: number;
    totalErrorResults: number;
    currentPage: number;
    lastPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: any[];
}

export interface CalculationSearchResult {
    id: string;
    name: string;
    fundingStreamId: string;
    specificationId: string;
    specificationName: string;
    valueType: ValueType;
    calculationType: CalculationType;
    namespace: string;
    wasTemplateCalculation: boolean;
    description?: string | undefined;
    status: PublishStatus;
    lastUpdatedDate: Date;
}

export interface PagerState {
    displayNumberOfPages: number;
    previousPage: number;
    nextPage: number;
    lastPage: number;
    pages: number[];
    currentPage: number;
}

export enum CalculationType {
    Additional = "Additional",
    Template = "Template"
}
