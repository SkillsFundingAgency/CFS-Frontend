import {Facet} from "../Facet";
import {PagerState} from "./PagerState";

export interface Provider {
        id: string;
        providerType: string;
        localAuthority: string;
        fundingStatus: string;
        providerName: string;
        ukprn: string;
        fundingValue: number;
        specificationId: string;
        fundingStreamId: string;
        fundingPeriodId: string;
    }

    export interface PublishProviderSearchResultViewModel {
        providers: Provider[];
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