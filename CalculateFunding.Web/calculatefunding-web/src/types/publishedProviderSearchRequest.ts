import {SearchMode} from "./SearchMode";

export interface PublishedProviderSearchRequest {
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

