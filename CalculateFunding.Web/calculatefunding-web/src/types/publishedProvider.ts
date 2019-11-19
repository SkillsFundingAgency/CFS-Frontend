export interface PublishedProviderItems {
    currentPage: number;
    endItemNumber: number;
    facets: FacetsEntity[];
    pagerState: PagerState;
    providers: ProvidersEntity[];
    startItemNumber: number;
    totalErrorResults: number;
    totalResults: number;
    filteredFundingAmount: number;
}
export interface ProvidersEntity {
    fundingPeriodId: string;
    fundingStatus: string;
    fundingStreamId: string;
    fundingValue: number;
    id: string;
    localAuthority: string;
    providerName: string;
    providerType: string;
    specificationId: string;
    ukprn: string;
}
export interface PagerState {
    currentPage: number;
    displayNumberOfPages: number;
    lastPage: number;
    nextPage: number;
    pages: number[];
    previousPage: number;
}
export interface FacetsEntity {
    name: string;
    facetValues: FacetValuesEntity[];
}
export interface FacetValuesEntity {
    name: string;
    count: number;
}
