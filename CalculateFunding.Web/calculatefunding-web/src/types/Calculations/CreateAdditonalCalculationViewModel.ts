import {PublishStatus} from "../PublishStatusModel";

export interface CreateAdditionalCalculationViewModel {
    sourceCode:string;
    calculationName:string;
    calculationType:CalculationTypes;
}

export interface EditAdditionalCalculationViewModel {
    sourceCode:string;
    specificationId: string;
    valueType: CalculationTypes;
    name: string;
    publishStatus: PublishStatus;
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
