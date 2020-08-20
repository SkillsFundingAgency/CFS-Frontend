import React from "react";

export interface IFundingStructureItem {
    level : number;
    name : string;
    calculationId : string;
    calculationPublishStatus : string;
    type : FundingStructureType;
    value?: string;
    calculationType?: string;
    fundingStructureItems: IFundingStructureItem[];
    parentName: string;
    expanded: boolean;
    customRef: React.MutableRefObject<null>;
}

export enum FundingStructureType{
    fundingLine,
    calculation,
    'Funding Line' = fundingLine,
    'Calculation' = calculation
}
