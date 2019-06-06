declare module calculateFunding.common {
    export interface ISearchRequest {
        pageNumber: number;
        searchTerm: string;
        includeFacets: boolean;
        filters: ISearchFilterRequest;
        pageSize?: number;
        errorToggle: string;
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
        totalErrorResults: number;
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
        isCustom: boolean;
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
        isAggregable: string;
        children: Array<IPropertyInformationResponse>;
    }

    export interface IScenarioCompileErrorResponse {
        errorMessage: string;
        line: number;
        column: number;
    }

    export interface IProfileResult {
        name: string;
        profilePeriods: IProfilePeriods[];
        financialEnvelopes: IFinancialEnvelopes[];
    }

    export interface IProfilePeriods {
        period: string;
        occurrence: string;
        periodYear: number;
        periodType: string;
        profileValue: number;
        distributionPeriod: string;
    }

    export interface IFinancialEnvelopes {
        monthStart: string;
        yearStart: string;
        monthEnd: string;
        yearEnd: string;
        value: number;
    }
}

interface Object {
    assign: (target: Object, sources: Object) => Object
}