declare module calculateFunding.common {
    export interface ISearchRequest {
        pageNumber: number;
        searchTerm: string;
        includeFacets: boolean;
        filters: ISearchFilterRequest
    }

    export interface ISearchFilterRequest {
        [fieldName: string]: Array<string>
    }

    export interface ISearchResultResponse {
        currentPage: number;
        endItemNumber: 50;
        facets: Array<ISearchFacetResponse>;
        pagerState: IPagerStateResponse;
        startItemNumber: number;
        totalResults: number;
    }

    export interface IPagerStateResponse {
        currentPage: number;
        displayNumberOfPages: number;
        nextPage: number;
        pages: Array<number>;
        previousPage: number;
    }

    export interface ISearchFacetResponse {
        facetValues: Array<ISearchFacetValueResponse>;
        name: string;
    }

    export interface ISearchFacetValueResponse {
        name: string;
        count: number;
    }
}