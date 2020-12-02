import React from "react";
import {PublishStatus} from "./PublishStatusModel";

export enum FundingStructureType{
    FundingLine = "FundingLine",
    Calculation = "Calculation",
}

export interface PublishedProviderFundingStructure {
    items : FundingStructureItem[];
    PublishedProviderVersion: number;
}

export interface FundingStructureItem {
    level : number,
    name : string,
    fundingLineCode : string,
    calculationId : string,
    type : FundingStructureType,
    value: string,
    calculationType: string,
    calculationPublishStatus?: PublishStatus | undefined,
    parentName?: string,
    expanded?: boolean,
    customRef?: React.MutableRefObject<null>,
    lastUpdatedDate?: Date,
    fundingStructureItems: FundingStructureItem[]
}