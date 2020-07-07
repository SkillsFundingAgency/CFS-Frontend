import {SearchMode} from "../SearchMode";
import {Facet} from "../Facet";
import {PagerState} from "../Datasets/DatasetDefinitionResponseViewModel";
import {Dataset} from "../Datasets/DatasetSearchResponseViewModel";

export interface PagedProviderVersionSearchResults {
    facets: Facet[];
    items: ProviderVersionSearchResult[];
    totalCount: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
}

export interface ProviderVersionSearchResult {
    status : string;
    phaseOfEducation : string;
    reasonEstablishmentOpened : string;
    reasonEstablishmentClosed : string;
    successor : string;
    trustStatus : string;
    legalName : string;
    trustName : string;
    town : string;
    postcode : string;
    rscRegionName : string;
    rscRegionCode : string;
    localGovernmentGroupTypeName : string;
    localGovernmentGroupTypeCode : string;
    trustCode : string;
    crmAccountId : string;
    navVendorNo : string;
    laCode : string;
    id : string;
    providerVersionId : string;
    providerId : string;
    name : string;
    urn : string;
    ukprn : string;
    upin : string;
    establishmentNumber : string;
    dfeEstablishmentNumber : string;
    authority : string;
    providerType : string;
    providerSubType : string;
    dateOpened? : any;
    dateClosed? : any;
    providerProfileIdType : string;
    countryName : string;
    countryCode : string;
}

export interface ProviderVersionSearchModel {
    pageNumber: number,
    top: number,
    searchTerm: string,
    errorToggle?: boolean,
    orderBy: [],
    filters: { [key: string]: string[] } ,
    includeFacets: boolean,
    facetCount: number,
    countOnly: boolean,
    searchMode: SearchMode,
    searchFields: [],
    overrideFacetFields: []
}