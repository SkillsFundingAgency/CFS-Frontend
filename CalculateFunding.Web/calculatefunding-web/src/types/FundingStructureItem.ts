export interface IFundingStructureItem{
    level : number,
    name : string,
    calculationId : string,
    type : FundingStructureType
}

export enum FundingStructureType{
    fundingLine,
    calculation,
    'Funding Line' = fundingLine,
    'Calculation' = calculation
}