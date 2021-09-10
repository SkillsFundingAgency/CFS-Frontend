import { languages } from "monaco-editor";

import { IVariableContainer } from "./IVariableContainer";

export interface IVariable {
  name: string;
  friendlyName: string;
  type: string;
  variableType: languages.CompletionItemKind;
  description?: string;
  items?: IVariableContainer;
  isAggregable: boolean;
  isObsolete: boolean;
}
