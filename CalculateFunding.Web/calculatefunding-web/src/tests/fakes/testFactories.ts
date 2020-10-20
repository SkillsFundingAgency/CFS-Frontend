import {PublishedProviderResult, PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {PublishedProviderSearchQueryResult} from "../../hooks/FundingApproval/usePublishedProviderSearch";
import {PublishedProviderErrorSearchQueryResult} from "../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import {PublishedProviderIdsQueryResult} from "../../hooks/FundingApproval/usePublishedProviderIds";

export const defaultFacets = [
    {name: "hasErrors", facetValues: [{"name": "True", "count": 1}, {"name": "False", "count": 0}]},
    {name: "providerType", facetValues: []},
    {name: "providerSubType", facetValues: []},
    {name: "localAuthority", facetValues: [{"name": "East London", "count": 1}]},
    {name: "providerType", facetValues: []}
];

export const createPublishedProviderResult = (providers: PublishedProviderResult[],
                                              canApprove: boolean = true,
                                              canPublish: boolean = true,
                                              facets = defaultFacets)
    : PublishedProviderSearchResults => {
    return {
        providers: providers,
        canApprove: canApprove,
        canPublish: canPublish,
        facets: facets,
        filteredFundingAmount: 10000,
        pagerState: {displayNumberOfPages: 1, previousPage: 0, nextPage: 1, lastPage: 1, pages: [1], currentPage: 1},
        currentPage: 1,
        endItemNumber: 1,
        startItemNumber: 1,
        totalFundingAmount: 10000,
        totalProvidersToApprove: 1,
        totalProvidersToPublish: 0,
        totalResults: providers.length
    };
};

export const createPublishedProviderSearchQueryResult = (results: PublishedProviderSearchResults)
    : PublishedProviderSearchQueryResult => {
    return {
        publishedProviderSearchResults: results,
        isLoadingSearchResults: false,
        isErrorLoadingSearchResults: false,
        errorLoadingSearchResults: ""
    };
};

export const createPublishedProviderErrorSearchQueryResult = (results: PublishedProviderSearchResults)
    : PublishedProviderErrorSearchQueryResult => {
    return {
        publishedProvidersWithErrors: results,
        isLoadingPublishedProviderErrors: false,
        isErrorLoadingPublishedProviderErrors: false,
        errorLoadingPublishedProviderErrors: ""
    };
};
export const createPublishedProviderIdsQueryResult = (ids: string[])
    : PublishedProviderIdsQueryResult => {
    return {
        publishedProviderIds: ids,
        isLoadingPublishedProviderIds: false,
        isErrorLoadingPublishedProviderIds: false,
        errorLoadingPublishedProviderIds: ""
    };
};