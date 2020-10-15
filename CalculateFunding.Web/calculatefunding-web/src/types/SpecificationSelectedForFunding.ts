export interface SpecificationSelectedForFunding {
    name: string;
    id: string;
}
export interface FundingPeriodWithSpecificationSelectedForFunding {
    name: string;
    id: string;
    specifications: SpecificationSelectedForFunding[];
}
export interface FundingStreamWithSpecificationSelectedForFunding {
    name: string;
    id: string;
    periods: FundingPeriodWithSpecificationSelectedForFunding[];
}