import {PublishStatus} from "../PublishStatusModel";

export interface CreateAdditionalCalculationViewModel {
    sourceCode:string;
    calculationName:string;
    calculationType:CalculationTypes;
}

export interface EditAdditionalCalculationViewModel {
    fundingStreamId: string;
    sourceCode:string;
    specificationId: string;
    valueType: CalculationTypes;
    name: string;
    publishStatus: PublishStatus;
    lastUpdated: Date
}

export interface UpdateAdditionalCalculationViewModel {
    sourceCode:string;
    calculationName: string;
    calculationType: CalculationTypes
}

export enum CalculationTypes{
    Percentage = "Percentage",
    Number = "Number",
    Currency = "Currency"
}
