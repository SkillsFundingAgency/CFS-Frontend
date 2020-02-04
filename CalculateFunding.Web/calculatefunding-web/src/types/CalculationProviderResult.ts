import {PagerState} from "./publishedProvider";

export interface CalculationProviderResultList {
    calculationProviderResults: CalculationProviderResult[];
    totalResults: number;
    totalErrorResults: number;
    currentPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: Facet[];
}

export interface CalculationProviderResult {
    id: string;
    providerId: string;
    providerName: string;
    specificationId: string;
    specificationName: string;
    lastUpdatedDate: Date;
    localAuthority: string;
    providerType: string;
    providerSubType: string;
    ukprn: string;
    urn: string;
    upin: string;
    openDate?: any;
    establishmentNumber: string;
    calculationId: string;
    calculationName: string;
    calculationResult?: number;
    calculationExceptionType: string;
    calculationExceptionMessage: string;
    lastUpdatedDateDisplay: string;
    dateOpenedDisplay: string;
    calculationResultDisplay: string;
}

export interface FacetValue {
    name: string;
    count: number;
}

export interface Facet {
    name: string;
    facetValues: FacetValue[];
}