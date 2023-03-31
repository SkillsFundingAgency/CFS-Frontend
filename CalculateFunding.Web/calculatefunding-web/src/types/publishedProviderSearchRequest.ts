import { OptionalExceptFor } from "../helpers/genericTypes";
import { FundingActionType } from "./PublishedProvider/PublishedProviderFundingCount";
import { SearchMode } from "./SearchMode";

export enum PublishedProviderSearchFacet {
  HasErrors = "hasErrors",
  ProviderType = "providerType",
  ProviderSubType = "providerSubType",
  LocalAuthority = "localAuthority",
  FundingStatus = "fundingStatus",
  MonthYearOpened = "monthYearOpened",
  Indicative = "indicative",
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
  fundingAction: Exclude<FundingActionType, FundingActionType.Refresh>;
}

export const buildInitialPublishedProviderSearchRequest = (
  options: OptionalExceptFor<
    Omit<PublishedProviderSearchRequest, "hasErrors" | "pageNumber">,
    "fundingStreamId" | "fundingPeriodId" | "specificationId" | "fundingAction"
  >
): PublishedProviderSearchRequest => {
  return {
    searchTerm: "",
    status: [],
    providerType: [],
    providerSubType: [],
    localAuthority: [],
    hasErrors: undefined,
    searchMode: SearchMode.All,
    pageSize: 50,
    pageNumber: 1,
    includeFacets: true,
    facetCount: 0,
    errorToggle: "",
    searchFields: [],
    indicative: [],
    monthYearOpened: [],
    ...options,
  };
};
