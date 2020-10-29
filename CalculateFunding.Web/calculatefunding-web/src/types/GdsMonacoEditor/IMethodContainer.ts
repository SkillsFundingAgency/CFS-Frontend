import {IFunctionParameter} from "./IFunctionParameter";

export interface IMethodContainer {
    [key: string]: ILocalMethod
}

export interface ILocalMethod{
    label: string;

    friendlyName: string;

    description: string;

    parameters: Array<IFunctionParameter>;

    returnType: string;

    isCustom: boolean;

    getFunctionAndParameterDescription(): string;
}