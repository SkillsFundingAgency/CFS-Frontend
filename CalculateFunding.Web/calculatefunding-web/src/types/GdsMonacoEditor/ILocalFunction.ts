import {IFunctionParameter} from "./IFunctionParameter";

export interface ILocalFunction {
    label: string;

    friendlyName: string;

    description: string;

    parameters: Array<IFunctionParameter>;

    returnType: string;

    isCustom: boolean;

    getFunctionAndParameterDescription(): string;
}