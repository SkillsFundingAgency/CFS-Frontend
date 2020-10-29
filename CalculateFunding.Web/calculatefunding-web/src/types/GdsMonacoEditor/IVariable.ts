import {IVariableContainer} from "./IVariableContainer";
import {languages} from "monaco-editor";

export interface IVariable {
    name: string;
    friendlyName: string;
    type: string;
    variableType: languages.CompletionItemKind
    description?: string;
    items?: IVariableContainer;
    isAggregable: boolean;
}
