import * as providerSearchHook from "../../hooks/FundingApproval/usePublishedProviderSearch";
import { PublishedProviderSearchQueryResult } from "../../hooks/FundingApproval/usePublishedProviderSearch";
import {
  PublishedProviderResult,
  PublishedProviderSearchResults,
} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import { PublishedProviderSearchFacet } from "../../types/publishedProviderSearchRequest";

const defaultFacets = [
  {
    name: PublishedProviderSearchFacet.HasErrors,
    facetValues: [
      { name: "True", count: 1 },
      { name: "False", count: 0 },
    ],
  },
  { name: PublishedProviderSearchFacet.ProviderType, facetValues: [] },
  { name: PublishedProviderSearchFacet.ProviderSubType, facetValues: [] },
  { name: PublishedProviderSearchFacet.LocalAuthority, facetValues: [{ name: "East London", count: 1 }] },
  { name: PublishedProviderSearchFacet.ProviderType, facetValues: [] },
  {
    name: PublishedProviderSearchFacet.MonthYearOpened,
    facetValues: [
      { name: "January 2000", count: 1 },
      { name: "September 2016", count: 2 },
      { name: "June 2015", count: 1 },
    ],
  },
];

const createPublishedProviderSearchQueryResult = (
  results: PublishedProviderSearchResults,
  ids: string[]
): PublishedProviderSearchQueryResult => {
  return {
    publishedProviderSearchResults: results,
    isLoadingSearchResults: false,
    publishedProviderIds: ids,
    refetchSearchResults: jest.fn(),
  };
};

export const createPublishedProviderResult = (
  providers: PublishedProviderResult[],
  overrides: Partial<PublishedProviderResult> = {}
) => {
  return {
    providers: providers,
    canApprove: true,
    canPublish: true,
    facets: defaultFacets,
    filteredFundingAmount: 10000,
    pagerState: {
      displayNumberOfPages: 1,
      previousPage: 0,
      nextPage: 1,
      lastPage: 1,
      pages: [1],
      currentPage: 1,
    },
    currentPage: 1,
    endItemNumber: 1,
    startItemNumber: 1,
    totalFundingAmount: 10000,
    totalProvidersToApprove: 1,
    totalProvidersToPublish: 0,
    totalResults: providers.length,
    ...overrides,
  };
};

const spy: jest.SpyInstance = jest.spyOn(providerSearchHook, "usePublishedProviderSearch");

const hasSearchResults = (providers: PublishedProviderResult[] = []) =>
  spy.mockImplementation(() =>
    createPublishedProviderSearchQueryResult(createPublishedProviderResult(providers), [])
  );

export const usePublishedProviderSearchUtils = {
  spy,
  hasSearchResults,
};
