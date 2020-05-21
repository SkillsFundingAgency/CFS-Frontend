export interface DatasetVersionHistoryViewModel {
    results: Result[];
    pageSize: number;
    totalResults: number;
    totalErrorResults: number;
    currentPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: any;
}


export interface Result {
    id: string;
    datasetId: string;
    name: string;
    description: string;
    changeNote: string;
    version: number;
    definitionName: string;
    lastUpdatedDate: Date;
    lastUpdatedByName: string;
    blobName: string;
}

export interface PagerState {
    displayNumberOfPages: number;
    previousPage: number;
    nextPage: number;
    lastPage: number;
    pages: number[];
    currentPage: number;
}