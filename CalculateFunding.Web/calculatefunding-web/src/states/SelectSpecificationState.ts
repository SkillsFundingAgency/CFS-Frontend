import {FundingPeriod, Specification} from "../types/viewFundingTypes";

export interface SelectSpecificationState {
    fundingStreams: string[],
    fundingPeriods: FundingPeriod[]
    specifications: Specification[]
}