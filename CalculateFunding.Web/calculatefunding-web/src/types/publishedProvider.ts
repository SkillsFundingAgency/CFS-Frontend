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
    canPublish: boolean;
    canApprove: boolean;
    totalFundingAmount: number;
    totalProvidersToApprove: number;
    totalProvidersToPublish: number;
}
export interface ProvidersEntity {
    id: string;
    providerType: string;
    providerSubType: string;
    localAuthority: string;
    fundingStatus: string;
    providerName: string;
    ukprn: string;
    upin: string;
    urn: string;
    fundingValue: number;
    specificationId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
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
