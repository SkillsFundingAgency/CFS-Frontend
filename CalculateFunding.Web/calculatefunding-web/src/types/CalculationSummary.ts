import {PublishStatus} from "./PublishStatusModel";
import {Author} from "./Calculations/Author";
import {CalculationTypes} from "./Calculations/CreateAdditonalCalculationViewModel";
import {ValueType} from "./ValueType";

export interface CalculationSummary {
    totalCount: number;
    results: Calculation[];
    totalResults: number;
    totalErrorResults: number;
    currentPage: number;
    lastPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: any[];
}

export interface Calculation {
    id: string;
    name: string;
    specificationId: string;
    fundingStreamId: string;
    sourceCode: string;
    calculationType: CalculationTypes;
    sourceCodeName: string;
    namespace: string;
    wasTemplateCalculation: boolean;
    valueType: ValueType;
    lastUpdated: Date;
    author: Author | null;
    version?: number | undefined;
    publishStatus: PublishStatus;
    description?: string | undefined;
}

interface PagerState {
    displayNumberOfPages: number;
    previousPage: number;
    nextPage: number;
    lastPage: number;
    pages: number[];
    currentPage: number;
}
