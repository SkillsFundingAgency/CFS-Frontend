import { Facet } from "./Facet";
import { PagerState } from "./PagerState";

export interface CalculationProviderSearchResponse {
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
  isIndicativeProvider: boolean;
}
