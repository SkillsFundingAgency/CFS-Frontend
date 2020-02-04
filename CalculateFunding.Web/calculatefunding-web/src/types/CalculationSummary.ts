export interface CalculationSummary{
    calculations:      Calculation[];
    totalResults:      number;
    totalErrorResults: number;
    currentPage:       number;
    startItemNumber:   number;
    endItemNumber:     number;
    pagerState:        PagerState;
    facets:            any[];
}

export interface Calculation{
    id:                     string;
    name:                   string;
    fundingStreamId:        string;
    specificationId:        string;
    specificationName:      string;
    valueType:              string;
    calculationType:        string;
    namespace:              string;
    wasTemplateCalculation: boolean;
    description:            null;
    status:                 string;
    lastUpdatedDate:        Date;
    lastUpdatedDateDisplay: string;
}

interface PagerState {
    displayNumberOfPages: number;
    previousPage:         number;
    nextPage:             number;
    lastPage:             number;
    pages:                number[];
    currentPage:          number;
}