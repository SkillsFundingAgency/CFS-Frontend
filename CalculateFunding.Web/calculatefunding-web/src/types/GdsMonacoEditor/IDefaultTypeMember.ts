import * as monaco from "monaco-editor";

export interface IDefaultTypeMember {
  label: string;

  description?: string;

  type: monaco.languages.CompletionItemKind;
}
