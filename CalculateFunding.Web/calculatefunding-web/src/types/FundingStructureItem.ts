import React from "react";
import {PublishStatus} from "./PublishStatusModel";

export enum FundingStructureType {
    FundingLine = "FundingLine",
    Calculation = "Calculation",
}

export interface FundingStructureItemViewModel {
    level: number,
    name: string,
    fundingLineCode: string | null,
    calculationId: string | null,
    templateId: number,
    type: FundingStructureType,
    value: string,
    calculationType: string | null,
    calculationPublishStatus?: PublishStatus | undefined,
    expanded?: boolean,
    customRef?: React.MutableRefObject<null>,
    lastUpdatedDate?: Date,
    errorMessage?: string,
    fundingStructureItems: FundingStructureItemViewModel[]
}