import { SearchMode } from "./SearchMode";

export interface CalculationProviderSearchRequestViewModel {
  pageNumber: number;
  searchTerm: string;
  errorToggle: string;
  includeFacets: boolean;
  providerType: string[];
  providerSubType: string[];
  resultsStatus: string[];
  localAuthority: string[];
  pageSize: number;
  facetCount: number;
  searchMode: SearchMode;
  calculationValueType: string;
  calculationId: string;
  searchFields: string[];
}
