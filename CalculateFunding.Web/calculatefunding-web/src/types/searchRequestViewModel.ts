import {SearchMode} from "./SearchMode";

export interface SearchRequestViewModel {
    pageNumber: number,
    searchTerm: string,
    errorToggle: string,
    includeFacets: boolean,
    fundingStreamId: string,
    fundingPeriodId: string,
    localAuthority: string[],
    status: string[],
    providerType: string[],
    providerSubType: string[],
    pageSize: number
    facetCount: number,
    searchMode: SearchMode,
    searchFields: string[],
}

export interface CalculationProviderSearchRequestViewModel {
    pageNumber: number;
    searchTerm: string;
    errorToggle: string;
    includeFacets: boolean;
    providerType: string[];
    providerSubType: string[];
    resultsStatus: string[];
    localAuthority: string[];
    pageSize: number;
    facetCount: number;
    searchMode: SearchMode;
    calculationValueType:string;
    calculationId:string;
}

export interface TemplateSearchRequest {
    pageNumber: number,
    top: number,
    searchTerm: string,
    errorToggle: string,
    orderBy: [],
    filters: [],
    includeFacets: boolean,
    facetCount: number,
    countOnly: boolean,
    searchMode: SearchMode,
    searchFields: [],
    overrideFacetFields: []
}