import {ValueType} from "../ValueType";

export interface CreateAdditionalCalculationViewModel {
    sourceCode:string;
    calculationName:string;
    calculationType: ValueType;
}

export interface UpdateCalculationViewModel {
    sourceCode: string;
    calculationName: string;
    valueType: ValueType
}
