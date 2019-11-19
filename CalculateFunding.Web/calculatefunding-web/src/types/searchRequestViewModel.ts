export interface SearchRequestViewModel {
    pageNumber: number,
    searchTerm: string,
    errorToggle: string,
    includeFacets: boolean,
    fundingStreamId: string,
    fundingPeriodId: string,
    localAuthority: string,
    status: string,
    providerType: string,
    pageSize: number
    facetCount: number,
    searchMode: SearchMode
}



export enum SearchMode {
    Any,
    All
}
