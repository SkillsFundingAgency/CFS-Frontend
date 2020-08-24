import {IVariableContainer} from "./IVariableContainer";

export interface IVariable {
    name: string;
    friendlyName: string;
    type: string;
    description?: string;
    items?: IVariableContainer;
    isAggregable: string;
}