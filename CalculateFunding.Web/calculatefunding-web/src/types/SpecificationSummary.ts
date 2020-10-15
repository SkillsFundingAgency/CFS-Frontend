import {FundingPeriod, FundingStream} from "./viewFundingTypes";

export interface SpecificationSummary {
    name: string;
    id:string;
    approvalStatus: string;
    isSelectedForFunding:boolean;
    description:string;
    providerVersionId: string;
    fundingStreams: FundingStream[];
    fundingPeriod: FundingPeriod
}
