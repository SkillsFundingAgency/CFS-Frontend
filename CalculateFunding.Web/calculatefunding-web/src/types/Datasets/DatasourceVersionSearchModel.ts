import {SearchMode} from "../SearchMode";

export interface DatasourceVersionSearchModel {
    pageNumber: number,
    top: number,
    searchTerm: string,
    errorToggle?: boolean,
    orderBy: [],
    filters: { [key: string]: string[] },
    includeFacets: boolean,
    facetCount: number,
    countOnly: boolean,
    searchMode: SearchMode,
    searchFields: [],
    overrideFacetFields: []
}