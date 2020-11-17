import {Facet} from "../Facet";
import {PagerState} from "../PagerState";
import {PublishStatus} from "../PublishStatusModel";

export interface PublishedProviderResult {
    publishedProviderVersionId: string;
    providerType: string;
    providerSubType: string;
    localAuthority: string;
    fundingStatus: PublishStatus;
    providerName: string;
    ukprn: string;
    upin: string;
    urn: string;
    fundingValue: number;
    specificationId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
    hasErrors: boolean;
    errors: string[];
}

export interface PublishedProviderSearchResults {
    providers: PublishedProviderResult[];
    filteredFundingAmount: number;
    canPublish: boolean;
    canApprove: boolean;
    totalFundingAmount: number;
    totalProvidersToApprove: number;
    totalProvidersToPublish: number;
    totalResults: number;
    currentPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: Facet[];
}