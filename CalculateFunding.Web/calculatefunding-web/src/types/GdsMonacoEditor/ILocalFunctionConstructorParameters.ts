import {IFunctionParameter} from "./IFunctionParameter";

export interface ILocalFunctionConstructorParameters {
    label: string;

    description: string;

    friendlyName: string;

    parameters: Array<IFunctionParameter>;

    returnType: string;

    isCustom: boolean;
}