import {Facet} from "../Facet";
import {PagerState} from "../PagerState";

export interface PublishedProvider {
    publishedProviderVersionId: string;
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
export interface PublishedProviderSearchResult {
    providers: PublishedProvider[];
    filteredFundingAmount: number;
    canPublish: boolean;
    canApprove: boolean;
    totalFundingAmount: number;
    totalProvidersToApprove: number;
    totalProvidersToPublish: number;
    totalResults: number;
    totalErrorResults: number;
    currentPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: Facet[];
}