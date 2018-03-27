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
        endItemNumber: number;
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

    export interface ITypeInformationResponse {
        name: string;
        description: string;
        type: string;
        methods: Array<IMethodInformationResponse>;
        properties: Array<IPropertyInformationResponse>;
    }

    export interface IMethodInformationResponse {
        name: string;
        friendlyName: string;
        description: string;
        returnType: string;
        entityId: string;
        parameters: Array<IParameterInformationResponse>;
    }

    export interface IParameterInformationResponse {
        name: string;
        description: string;
        type: string;
    }

    export interface IPropertyInformationResponse {
        name: string;
        friendlyName: string;
        description: string;
        type: string;
        children: Array<IPropertyInformationResponse>;
    }
}