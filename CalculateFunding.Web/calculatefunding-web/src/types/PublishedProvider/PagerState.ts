export interface PagerState {
    displayNumberOfPages: number;
    previousPage?: any;
    nextPage?: any;
    lastPage: number;
    pages: number[];
    currentPage: number;
}