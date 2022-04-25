import { SearchMode } from "./SearchMode";
import { ValueType } from "./ValueType";

export interface CalculationProviderSearchRequest {
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
  calculationValueType: ValueType | undefined;
  calculationId: string;
  searchFields: string[];
}
