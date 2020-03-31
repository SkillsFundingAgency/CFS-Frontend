export interface IFundingStructureItem{
    level : number;
    name : string;
    calculationId : string;
    calculationPublishStatus : string;
    type : FundingStructureType;
    fundingStructureItems: IFundingStructureItem[];
    parentName: string;
}

export enum FundingStructureType{
    fundingLine,
    calculation,
    'Funding Line' = fundingLine,
    'Calculation' = calculation
}
