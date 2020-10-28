import {ValueType} from "../ValueType";

export interface CreateAdditionalCalculationViewModel {
    sourceCode:string;
    calculationName:string;
    calculationType:CalculationTypes;
}

export interface UpdateAdditionalCalculationViewModel {
    sourceCode: string;
    calculationName: string;
    valueType: ValueType
}

export enum CalculationTypes{
    Percentage = "Percentage",
    Number = "Number",
    Currency = "Currency"
}
