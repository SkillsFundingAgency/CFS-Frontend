import {SearchMode} from "./SearchMode";

export interface TemplateSearchRequest {
    pageNumber: number;
    top: number;
    searchTerm: string;
    errorToggle: string;
    orderBy: [];
    filters: [];
    includeFacets: boolean;
    facetCount: number;
    countOnly: boolean;
    searchMode: SearchMode;
    searchFields: [];
    overrideFacetFields: [];
    currentPage: number;
}
