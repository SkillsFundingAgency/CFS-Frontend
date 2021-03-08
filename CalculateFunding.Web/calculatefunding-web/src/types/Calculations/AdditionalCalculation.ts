import {CalculationType} from "../CalculationSearchResponse";
import {PagerState} from "../PagerState";
import {PublishStatus} from "../PublishStatusModel";
import {ValueType} from "../ValueType";

export interface AdditionalCalculation {
    id: string;
    name: string;
    valueType: ValueType;
    lastUpdatedDate: Date;
    value?: number | null;
    fundingStreamId: string;
    specificationId: string;
    specificationName: string;
    calculationType: CalculationType;
    namespace: string;
    wasTemplateCalculation: boolean;
    description?: string | undefined;
    status: PublishStatus;
    exceptionMessage:string | undefined;
}

export interface AdditionalCalculationSearchResultViewModel {
    totalCount: number;
    calculations: AdditionalCalculation[];
    totalResults: number;
    totalErrorResults: number;
    currentPage: number;
    lastPage: number;
    startItemNumber: number;
    endItemNumber: number;
    pagerState: PagerState;
    facets: any[];
}