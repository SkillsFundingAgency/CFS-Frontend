import {SearchMode} from "../searchRequestViewModel";

export interface DatasetDefinitionRequestViewModel {
    pageNumber?: number;
    searchTerm: string;
    errorToggle: string;
    includeFacets: boolean;
    filters: []
    pageSize: number;
    facetCount: number;
    searchMode: SearchMode
}