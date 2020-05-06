    export interface DatasetDefinition {
        description: string;
        providerIdentifier: string;
        lastUpdatedDate: Date;
        lastUpdatedDateDisplay: string;
        lastUpdatedDateFormatted: string;
        id: string;
        name: string;
    }

    export interface PagerState {
        displayNumberOfPages: number;
        previousPage?: any;
        nextPage?: any;
        lastPage: number;
        pages: number[];
        currentPage: number;
    }

    export interface DatasetDefinitionResponseViewModel {
        datasetDefinitions: DatasetDefinition[];
        totalResults: number;
        totalErrorResults: number;
        currentPage: number;
        startItemNumber: number;
        endItemNumber: number;
        pagerState: PagerState;
        facets: any[];
    }