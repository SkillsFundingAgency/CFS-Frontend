import * as monaco from "monaco-editor";
import { languages } from "monaco-editor";

import { IMethodInformationResponse, ITypeInformationResponse } from "../types/Calculations/CodeContext";
import { IDefaultMemberTypeContainer } from "../types/GdsMonacoEditor/IDefaultMemberTypeContainer";
import { IDefaultType } from "../types/GdsMonacoEditor/IDefaultType";
import { IDefaultTypeContainer } from "../types/GdsMonacoEditor/IDefaultTypeContainer";
import { IKeyword } from "../types/GdsMonacoEditor/IKeyword";
import { IKeywordsContainer } from "../types/GdsMonacoEditor/IKeywordsContainer";
import { ILocalFunction } from "../types/GdsMonacoEditor/ILocalFunction";
import { ILocalFunctionContainer } from "../types/GdsMonacoEditor/ILocalFunctionContainer";
import { ILocalMethod } from "../types/GdsMonacoEditor/IMethodContainer";
import { IVariable } from "../types/GdsMonacoEditor/IVariable";
import { IVariableContainer } from "../types/GdsMonacoEditor/IVariableContainer";

export function convertMethodInformationResponseToVariable(
  method: IMethodInformationResponse,
  types: Array<ITypeInformationResponse>,
  level?: number
) {
  const methodItem: ILocalMethod = {
    description: "",
    friendlyName: "",
    isCustom: false,
    label: "",
    parameters: [],
    returnType: "",
    getFunctionAndParameterDescription(): string {
      return "";
    },
  };

  return methodItem;
}

export function createCompletionItem(variable: IVariable, range: any) {
  const variableItem = {
    label: variable.name,
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: variable.name,
    range: range,
  };
  let description = "";
  let friendlyName = "";

  if (typeof variable.description !== "undefined") {
    description = variable.description;
  }

  if (typeof variable.friendlyName !== "undefined") {
    friendlyName = variable.friendlyName;
  }

  if (description || friendlyName) {
    let documentationValue = "";

    if (friendlyName) {
      documentationValue = "**" + friendlyName + "**";
    }

    if (description) {
      if (documentationValue) {
        documentationValue = documentationValue + "\r\n\r\n";
      }
      documentationValue = documentationValue + description;
    }

    if (documentationValue.indexOf("function aggregate") > -1) {
      variableItem.kind = 2;
    }
  }

  return variableItem;
}

export function getDefaultDataTypesCompletionItems(
  path: string,
  defaultDataTypes: IDefaultTypeContainer,
  range: any
) {
  const asWithWhitespaceRegex = new RegExp(/(\s)as(\s)/i);

  const items = [];

  if (asWithWhitespaceRegex.test(path)) {
    for (const i in defaultDataTypes) {
      const defaultType: IDefaultType = defaultDataTypes[i];

      const defaultTypeItem: monaco.languages.CompletionItem = {
        label: defaultType.label,
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: defaultType.description,
        insertText: defaultType.label,
        range: range,
      };

      let description = "";
      const friendlyName = defaultType.label;

      if (typeof defaultType.description !== "undefined") {
        description = defaultType.description;
      }

      if (description || friendlyName) {
        let documentationValue = "";

        if (friendlyName) {
          documentationValue = "**" + friendlyName + "**";
        }

        if (description) {
          if (documentationValue) {
            documentationValue = documentationValue + "\r\n\r\n";
          }
          documentationValue = documentationValue + description;
        }

        defaultTypeItem.documentation = {
          value: documentationValue,
          isTrusted: true,
        };
      }

      items.push(defaultTypeItem);
    }
  }

  return items;
}

export function getKeywordsCompletionItems(path: string, keywords: IKeywordsContainer, range: any) {
  const items = [];

  if (path.trim() === "" || path.trim().toLowerCase() === "i") {
    for (const k in keywords) {
      const keyword: IKeyword = keywords[k];

      const keywordItem = {
        label: keyword.label,
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: keyword.label,
        insertText: keyword.label,
        range: range,
      };

      if (keyword.label === "If-Then-ElseIf-Then") {
        keywordItem.insertText =
          "If <condition> Then\n\r\n\rElseIf <condition> Then\n\r\n\rElse\n\r\n\rEnd If";
      } else if (keyword.label === "If-Then-Else") {
        keywordItem.insertText = "If <condition> Then\n\r\n\rElse\n\r\n\rEnd If";
      } else if (keyword.label === "If-Then") {
        keywordItem.insertText = "If <condition> Then\n\r\n\rEnd If";
      }

      items.push(keywordItem);
    }
  }

  return items;
}

export function getVariablesForPath(path: string, variables: IVariableContainer) {
  if (!path) {
    return [];
  }

  path = path.replace("=", "").toLowerCase();

  const pathArray: Array<string> = path.split(".");
  let currentVariableContainer: IVariableContainer = variables;

  for (const variableKey in pathArray) {
    if (currentVariableContainer === null) {
      break;
    }

    const variableContainerKey = pathArray[variableKey];
    const currentVariable: IVariable = currentVariableContainer[variableContainerKey];
    if (!currentVariable) {
      currentVariableContainer = {};
      break;
    }

    if (typeof currentVariable.items !== "undefined") {
      currentVariableContainer = currentVariable.items;
    } else {
      currentVariableContainer = {};
    }
  }

  if (currentVariableContainer) {
    const result: Array<IVariable> = [];
    for (const i in currentVariableContainer) {
      result.push(currentVariableContainer[i]);
    }

    return result;
  }

  return [];
}

export function getOptionsForPath(path: string, variables: IVariableContainer) {
  if (!path) {
    return [];
  }
  const result: Array<IVariable> = [];

  path = path.toLowerCase();

  const pathArray: Array<string> = path.split(".");
  const currentVariableContainer: IVariableContainer = variables;

  for (const variableKey in pathArray) {
    if (currentVariableContainer === null) {
      break;
    }

    const variableContainerKey = pathArray[variableKey];
    const currentVariable: IVariable = currentVariableContainer[variableContainerKey];

    if (currentVariable !== undefined && typeof currentVariable.items !== "undefined") {
      result.push(currentVariable);
    }
  }

  return result;
}

export function getVariableByPath(path: string, variables: IVariableContainer) {
  path = path.toLowerCase();

  const pathArray: Array<string> = path.split(".");
  let currentVariableContainer: IVariableContainer = variables;

  if (pathArray.length > 1) {
    for (const variableKey in pathArray.slice(0, pathArray.length - 1)) {
      if (currentVariableContainer == null) {
        break;
      }

      const variableContainerKey = pathArray[variableKey];
      const currentVariable: IVariable = currentVariableContainer[variableContainerKey];
      if (!currentVariable) {
        currentVariableContainer = {};
        break;
      }

      if (typeof currentVariable.items !== "undefined") {
        currentVariableContainer = currentVariable.items;
      } else {
        currentVariableContainer = {};
      }
    }
  } else {
    currentVariableContainer = variables;
  }

  if (currentVariableContainer) {
    return currentVariableContainer[pathArray[pathArray.length - 1]];
  }

  return currentVariableContainer;
}

export function getVariableForAggregatePath(path: string, variables: IVariableContainer): Array<IVariable> {
  const clonedVariableContainer = Object.assign({}, variables) as IVariableContainer;
  const clonedVariable = clonedVariableContainer["datasets"];
  const variablesArray: Array<IVariable> = [];

  const datasets = getVariablesForPath("Datasets", clonedVariableContainer);

  if (datasets && datasets.length > 0) {
    for (const i in datasets) {
      const datasetVariable: IVariable = datasets[i];
      const fields = getVariablesForPath("Datasets." + datasetVariable.name, clonedVariableContainer);

      const filteredVariables: IVariableContainer = {};

      let hasAggregateFields = false;

      for (const f in fields) {
        const fieldVariable: IVariable = fields[f];
        if (fieldVariable.isAggregable) {
          hasAggregateFields = true;
          filteredVariables[fieldVariable.name.toLowerCase()] = fieldVariable;
        }
      }

      if (!hasAggregateFields) {
        if (
          clonedVariableContainer["datasets"] != null &&
          clonedVariableContainer["datasets"].items !== undefined
        ) {
          delete clonedVariableContainer["datasets"].items[datasetVariable.name.toLowerCase()];
        }
      } else {
        datasetVariable.items = filteredVariables;
      }
    }
  }

  variablesArray.push(clonedVariable);

  for (const c in clonedVariableContainer) {
    const calcVariable: IVariable = clonedVariableContainer[c];

    if (calcVariable.isAggregable !== null && calcVariable.isAggregable) {
      variablesArray.push(calcVariable);

      if (clonedVariable.items !== undefined) {
        clonedVariable.items[calcVariable.name] = calcVariable;
      }
    }
  }

  return variablesArray;
}

export function processSourceToRemoveComments(contents: string) {
  if (!contents) {
    return "";
  }

  const lines = contents.split("\r\n");
  let result = "";

  const newLine = "\r\n";

  for (const i in lines) {
    const line = lines[i];
    if (line) {
      let previousCharacter = "";
      let withinString = false;
      let firstMatch = -1;
      for (let i = 0; i < line.length; i++) {
        const character: string = line[i];
        if (character === "'" && !withinString) {
          firstMatch = i;
          break;
        }

        if (character === '"' && previousCharacter !== "\\") {
          if (withinString) {
            withinString = false;
          } else {
            withinString = true;
          }
        }

        previousCharacter = character;
      }
      if (firstMatch === 0) {
        continue;
      } else if (firstMatch > 0) {
        result = result + line.substr(0, firstMatch) + newLine;
      } else {
        result = result + line + newLine;
      }
    }
  }

  return result;
}

export function findDeclaredVariables(contents: string) {
  const variableRegex = /\b(\s)?Dim\s+([a-zA-Z][(\w}|\d){0-254}]*([,]([ ])?)*)+/g;
  const regex = new RegExp(variableRegex);
  let match = null;

  const result: Array<string> = [];

  while ((match = regex.exec(contents))) {
    if (!match) {
      break;
    }

    const variableNames = match[0].substr(3).trim();

    // Support multiple variables declared at once eg Dim var1, var2, var3
    const variableNamesSplit: Array<string> = variableNames.split(",");
    for (const k in variableNamesSplit) {
      const variableName = variableNamesSplit[k].trim();

      // Make sure there are no duplicates (if the user has defined a variable twice)
      if (result.indexOf(variableName) < 0) {
        result.push(variableName);
      }
    }
  }

  return result;
}

export function checkAggregableFunctionDeclared(path: string) {
  if (!path) {
    return false;
  }

  const pathRegex = "( Min|Avg|Max|Sum\\()";

  const regex = new RegExp(pathRegex);

  const match = regex.exec(path);

  return match ? true : false;
}

export function getHoverDescriptionForDefaultType(
  model: monaco.editor.IReadOnlyModel,
  position: monaco.Position,
  dataTypes: IDefaultTypeContainer,
  range: any
) {
  // @ts-ignore
  const word = model.getWordAtPosition(position)?.word;

  if (word && dataTypes[word.toLowerCase()]) {
    const foundDefaultType = dataTypes[word.toLowerCase()];

    let documentationValue = "Type: " + foundDefaultType.label;

    let description = "";

    if (typeof foundDefaultType.description !== "undefined") {
      description = foundDefaultType.description;
    }

    if (description) {
      if (documentationValue) {
        documentationValue = documentationValue + "\r\n\r\n";
      }

      documentationValue = documentationValue + description;
    }

    const hover: monaco.languages.Hover = {
      contents: [
        {
          value: documentationValue,
          isTrusted: true,
        },
      ],
      range: range,
    };

    return hover;
  }

  // @ts-ignore
  return null;
}

export function getHoverDescriptionForLocalFunction(
  model: monaco.editor.IReadOnlyModel,
  position: monaco.Position,
  forwardText: string,
  functions: ILocalFunctionContainer,
  range: any
) {
  let backwardsFunctionNameText = "";
  if (position.column > 1) {
    const backwardsText = model.getValueInRange(
      new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column)
    );

    const localFunctionNameRegexBack = new RegExp(/\b(([a-zA-Z_])([a-zA-Z0-9_]{0,254}))+/g);
    let reversedTextRegexResult;

    let result;
    while ((result = localFunctionNameRegexBack.exec(backwardsText))) {
      if (!result) {
        break;
      }

      reversedTextRegexResult = result;
    }
    if (reversedTextRegexResult) {
      if (reversedTextRegexResult.length > 0) {
        backwardsFunctionNameText = reversedTextRegexResult[0];
      }
    }
  }

  let forwardsLocalFunctionText = "";
  if (forwardText) {
    const variableDetectionRegex = new RegExp(/\b(([a-zA-Z_])([a-zA-Z0-9_]{0,254}))+/g);

    const forwardsVariableResult = variableDetectionRegex.exec(forwardText);
    if (forwardsVariableResult) {
      forwardsLocalFunctionText = forwardsVariableResult[0];
    }
  }

  const localFunctionText = (backwardsFunctionNameText + forwardsLocalFunctionText).trim();
  if (localFunctionText) {
    const localFunctionKey = localFunctionText.toLowerCase();

    const foundLocalFunction: ILocalFunction = functions[localFunctionKey];
    if (foundLocalFunction) {
      let description = "";
      let documentationValue = "Return type: " + foundLocalFunction.returnType;

      if (typeof foundLocalFunction.description !== "undefined") {
        description = foundLocalFunction.description;
      }

      if (description) {
        if (documentationValue) {
          documentationValue = documentationValue + "\r\n\r\n";
        }

        documentationValue = documentationValue + description;
      }

      const hover: monaco.languages.Hover = {
        contents: [
          {
            value: documentationValue,
            isTrusted: true,
          },
        ],
        range: range,
      };

      return hover;
    }
  }

  return null;
}

export function getHoverDescriptionForVariable(
  model: monaco.editor.IReadOnlyModel,
  position: monaco.Position,
  forwardText: string,
  variables: IVariableContainer,
  range: any
) {
  let backwardsVariableText = "";
  if (position.column > 1) {
    const backwardsText = model.getValueInRange(
      new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column)
    );

    const variableDetectionRegexBack = new RegExp(/\b(([a-zA-Z])([a-zA-Z0-9]{0,254})(\.)?)+/g);
    let reversedTextRegexResult;

    let result;
    while ((result = variableDetectionRegexBack.exec(backwardsText))) {
      if (!result) {
        break;
      }

      reversedTextRegexResult = result;
    }
    if (reversedTextRegexResult) {
      if (reversedTextRegexResult.length > 0) {
        backwardsVariableText = reversedTextRegexResult[0];
      }
    }
  }

  let forwardsVariableText = "";
  if (forwardText) {
    const variableDetectionRegex = new RegExp(/\b(([a-zA-Z])([a-zA-Z0-9]{0,254})+)/);

    const forwardsVariableResult = variableDetectionRegex.exec(forwardText);
    if (forwardsVariableResult) {
      forwardsVariableText = forwardsVariableResult[0];
    }
  }

  const variableText = (backwardsVariableText + forwardsVariableText).trim();
  if (variableText) {
    const foundVariable: IVariable = getVariableByPath(variableText, variables);
    if (foundVariable) {
      let description = "";
      let documentationValue = "Type: " + foundVariable.type;

      if (typeof foundVariable.description !== "undefined") {
        description = foundVariable.description;
      }

      if (description) {
        if (documentationValue) {
          documentationValue = documentationValue + "\r\n\r\n";
        }

        documentationValue = documentationValue + description;
      }

      const hover: monaco.languages.Hover = {
        contents: [
          {
            value: documentationValue,
            isTrusted: true,
          },
        ],
        range: range,
      };

      return hover;
    }
  }

  return null;
}

export function convertClassToVariables(
  root: ITypeInformationResponse | undefined,
  result: Array<ITypeInformationResponse>
) {
  const variables: IVariableContainer = {};

  if (!root || !root.properties) {
    return variables;
  }

  root.properties.forEach((property) => {
    const propLowerCaseName = property.name.toLowerCase();

    variables[propLowerCaseName] = {
      description: property.description,
      friendlyName: property.friendlyName,
      isAggregable: property.isAggregable,
      items: {},
      name: property.name,
      type: property.type,
      variableType: languages.CompletionItemKind.Field,
      isObsolete: property.isObsolete,
    };

    const subItem = result.find((p) => p.name === property.type);

    if (subItem) {
      variables[propLowerCaseName].items = convertClassToVariables(subItem, result);
    }
  });

  root.methods.forEach((method) => {
    variables[method.name.toLowerCase()] = {
      description: method.description,
      friendlyName: method.friendlyName,
      isAggregable: false,
      items: {},
      name: method.name,
      type: method.returnType,
      variableType: languages.CompletionItemKind.Method,
      isObsolete: method.isObsolete,
    };
  });

  return variables;
}

export function findEnum(root: ITypeInformationResponse[] | undefined, entityId: string) {
  let enumItem: IVariable = {
    friendlyName: "",
    isAggregable: false,
    name: "",
    type: "",
    variableType: languages.CompletionItemKind.Enum,
    isObsolete: false,
  };

  if (!root) {
    return enumItem;
  }

  root.forEach((information) => {
    const method = information.methods?.find((m) => m.entityId == entityId);
    if (method !== undefined)
      enumItem = {
        description: method.description,
        friendlyName: method.friendlyName,
        isAggregable: false,
        items: {},
        name: method.returnTypeClass,
        type: method.returnTypeClass,
        variableType: languages.CompletionItemKind.Enum,
        isObsolete: method.isObsolete,
      };
  });

  return enumItem;
}

export function findEnumItems(name: string, result: Array<ITypeInformationResponse>) {
  const response = result.find((x) => x.name === name);

  if (response !== null) {
    return response;
  }
}

export function checkForObsoleteLocalFunction(
  model: monaco.editor.IReadOnlyModel,
  position: monaco.Position,
  forwardText: string,
  functions: ILocalFunctionContainer,
  range: any
) {
  let backwardsFunctionNameText = "";
  if (position.column > 1) {
    const backwardsText = model.getValueInRange(
      new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column)
    );

    const localFunctionNameRegexBack = new RegExp(/\b(([a-zA-Z_])([a-zA-Z0-9_]{0,254}))+/g);
    let reversedTextRegexResult;

    let result;

    while ((result = localFunctionNameRegexBack.exec(backwardsText))) {
      if (!result) {
        break;
      }

      reversedTextRegexResult = result;
    }
    if (reversedTextRegexResult) {
      if (reversedTextRegexResult.length > 0) {
        backwardsFunctionNameText = reversedTextRegexResult[0];
      }
    }
  }

  let forwardsLocalFunctionText = "";
  if (forwardText) {
    const variableDetectionRegex = new RegExp(/\b(([a-zA-Z_])([a-zA-Z0-9_]{0,254}))+/g);

    const forwardsVariableResult = variableDetectionRegex.exec(forwardText);
    if (forwardsVariableResult) {
      forwardsLocalFunctionText = forwardsVariableResult[0];
    }
  }

  const localFunctionText = (backwardsFunctionNameText + forwardsLocalFunctionText).trim();
  if (localFunctionText) {
    const localFunctionKey = localFunctionText.toLowerCase();

    const foundLocalFunction: ILocalFunction = functions[localFunctionKey];
    if (foundLocalFunction && foundLocalFunction.isObsolete) {
      return true;
    }
  }

  return false;
}

export function checkForObsoleteVariable(
  model: monaco.editor.IReadOnlyModel,
  position: monaco.Position,
  forwardText: string,
  variables: IVariableContainer,
  range: any
) {
  let backwardsVariableText = "";
  if (position.column > 1) {
    const backwardsText = model.getValueInRange(
      new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column)
    );

    const variableDetectionRegexBack = new RegExp(/\b(([a-zA-Z])([a-zA-Z0-9]{0,254})(\.)?)+/g);
    let reversedTextRegexResult;

    let result;
    while ((result = variableDetectionRegexBack.exec(backwardsText))) {
      if (!result) {
        break;
      }

      reversedTextRegexResult = result;
    }
    if (reversedTextRegexResult) {
      if (reversedTextRegexResult.length > 0) {
        backwardsVariableText = reversedTextRegexResult[0];
      }
    }
  }

  let forwardsVariableText = "";
  if (forwardText) {
    const variableDetectionRegex = new RegExp(/\b(([a-zA-Z])([a-zA-Z0-9]{0,254})+)/);

    const forwardsVariableResult = variableDetectionRegex.exec(forwardText);
    if (forwardsVariableResult) {
      forwardsVariableText = forwardsVariableResult[0];
    }
  }

  const variableText = (backwardsVariableText + forwardsVariableText).trim();
  if (variableText) {
    const foundVariable: IVariable = getVariableByPath(variableText, variables);
    if (foundVariable && foundVariable.isObsolete) {
      return true;
    }
  }

  return false;
}

export function checkForObsoleteDefaultType(
  model: monaco.editor.IReadOnlyModel,
  position: monaco.Position,
  dataTypes: IDefaultTypeContainer,
  range: any
) {
  // @ts-ignore
  const word = model.getWordAtPosition(position)?.word;

  if (word && dataTypes[word.toLowerCase()]) {
    const foundDefaultType = dataTypes[word.toLowerCase()];

    if (foundDefaultType && foundDefaultType.isObsolete) {
      return true;
    }
  }

  // @ts-ignore
  return false;
}

export function getObsoleteVariables(variables: IVariableContainer) {
  const obsoleteItems: string[] = [];
  for (const i in variables) {
    const item = variables[i];
    if (item.isObsolete) {
      obsoleteItems.push(item.name);
    }
    if (item.items) {
      const items = getObsoleteVariables(item.items);

      for (const i in items) {
        obsoleteItems.push(items[i]);
      }
    }
  }

  return obsoleteItems;
}

export function getObsoleteFunctions(functions: ILocalFunctionContainer) {
  const obsoleteItems: string[] = [];
  for (const i in functions) {
    const item = functions[i];
    if (item.isObsolete) {
      obsoleteItems.push(item.label);
    }
  }

  return obsoleteItems;
}

export function getObsoleteDefaultTypes(obsoleteDefaultTypes: IDefaultTypeContainer) {
  const obsoleteItems: string[] = [];
  for (const i in obsoleteDefaultTypes) {
    const item = obsoleteDefaultTypes[i];
    if (item.isObsolete) {
      obsoleteItems.push(item.label);
    }
  }

  return obsoleteItems;
}
