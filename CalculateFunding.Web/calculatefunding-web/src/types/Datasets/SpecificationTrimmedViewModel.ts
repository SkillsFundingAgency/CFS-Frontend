import {FundingPeriod, FundingStream} from "../viewFundingTypes";

export interface SpecificationTrimmedViewModel {
    fundingPeriod: FundingPeriod;
    fundingStreams: FundingStream[];
    description: string;
    publishStatus: number;
    id: string;
    name: string;
}