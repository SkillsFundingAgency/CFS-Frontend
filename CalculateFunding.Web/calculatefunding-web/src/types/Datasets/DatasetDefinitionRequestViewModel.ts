import { SearchMode } from "../SearchMode";

export interface DatasetDefinitionRequestViewModel {
  pageNumber?: number;
  searchTerm: string;
  errorToggle: string;
  includeFacets: boolean;
  filters: { [key: string]: string[] };
  pageSize?: number;
  facetCount: number;
  searchMode: SearchMode;
}
