import {ValueType} from "../ValueType";
import { CalculationDataType } from "./CalculationCompilePreviewResponse";

export interface CreateAdditionalCalculationViewModel {
    sourceCode:string;
    calculationName:string;
    calculationType: ValueType;
}

export interface UpdateCalculationViewModel {
    sourceCode: string;
    calculationName: string;
    valueType: ValueType;
    dataType: CalculationDataType;
}
