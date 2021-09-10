import { SearchMode } from "./SearchMode";

export enum PublishedProviderSearchFacet {
  HasErrors = "hasErrors",
  ProviderType = "providerType",
  ProviderSubType = "providerSubType",
  LocalAuthority = "localAuthority",
  FundingStatus = "fundingStatus",
  MonthYearOpened = "monthYearOpened",
}

export interface PublishedProviderSearchRequest {
  pageNumber: number;
  searchTerm: string;
  errorToggle: string;
  includeFacets: boolean;
  hasErrors: boolean | undefined;
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  localAuthority: string[];
  monthYearOpened: string[];
  status: string[];
  providerType: string[];
  providerSubType: string[];
  pageSize: number;
  facetCount: number;
  searchMode: SearchMode;
  searchFields: string[];
  indicative: string[];
}

export const buildInitialPublishedProviderSearchRequest = (
  fundingStreamId: string,
  fundingPeriodId: string,
  specificationId: string
): PublishedProviderSearchRequest => {
  return {
    searchTerm: "",
    status: [],
    providerType: [],
    providerSubType: [],
    localAuthority: [],
    fundingStreamId: fundingStreamId,
    specificationId: specificationId,
    hasErrors: undefined,
    searchMode: SearchMode.All,
    pageSize: 50,
    pageNumber: 1,
    includeFacets: true,
    facetCount: 0,
    fundingPeriodId: fundingPeriodId,
    errorToggle: "",
    searchFields: [],
    indicative: [],
    monthYearOpened: [],
  };
};
