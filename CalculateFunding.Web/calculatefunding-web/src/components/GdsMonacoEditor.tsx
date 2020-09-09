import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/language/css/monaco.contribution'
import 'monaco-editor/esm/vs/language/html/monaco.contribution'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution'
import {createElement as create, useRef, useEffect, useState} from 'react'
import {useEffectOnce} from "../hooks/useEffectOnce";
import {getCodeContextService} from "../services/calculationService";
import {
    IMethodInformationResponse,
    IPropertyInformationResponse,
    ITypeInformationResponse
} from "../types/Calculations/CodeContext";
import {editor, IPosition} from "monaco-editor/esm/vs/editor/editor.api";
import {IVariableContainer} from "../types/GdsMonacoEditor/IVariableContainer";
import {ILocalFunctionContainer} from "../types/GdsMonacoEditor/ILocalFunctionContainer";
import {IDefaultTypeContainer} from "../types/GdsMonacoEditor/IDefaultTypeContainer";
import {IKeywordsContainer} from "../types/GdsMonacoEditor/IKeywordsContainer";
import {IVariable} from "../types/GdsMonacoEditor/IVariable";
import {ILocalFunction} from "../types/GdsMonacoEditor/ILocalFunction";
import {VisualBasicSub} from "../types/GdsMonacoEditor/VisualBasicSub";
import {IFunctionParameter} from "../types/GdsMonacoEditor/IFunctionParameter";
import {IDefaultType} from "../types/GdsMonacoEditor/IDefaultType";
import {IKeyword} from "../types/GdsMonacoEditor/IKeyword";

export function GdsMonacoEditor(props: {
    value: string,
    change: any,
    language: string,
    minimap: boolean,
    specificationId: string,
    calculationType: string,
    calculationName: string,
    fundingStreamId?: string
}) {
    const height: number = 291;
    const element = useRef<HTMLElement>();
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const specificationId = props.specificationId;
    const fundingStreamId = props.fundingStreamId ? props.fundingStreamId : "";

    let variableAllowedNowPrefixes: Array<string> = [
        // If and If with brackets and spaces, but not matching End If - regex not supported in IE11
        //"(?<!End )If(\s)*(\\()?( )*",
        "If(\s)*(\\()?( )*",
        "Return ",
        "ElseIf\\(",
        "ElseIf \\(",
        "\\= ",
        " \\+ ",
        " \\* ",
        " \\- ",
        " \\/ ",
        " \\<",
        " \\>",
        "And ",
        "AndAlso ",
        "Or ",
        "OrElse ",
        "Xor ",
        "Mod ",
        "Like ",
        "For ",
        "In ",
        "To ",
        "Case ",
        "CBool\\(",
        "CByte\\(",
        "CChar\\(",
        "CDate\\(",
        "CDbl\\(",
        "CDec\\(",
        "CInt\\(",
        "CULng\\(",
        "CUShort\\(",
        "CObj\\(",
        "CSByte\\(",
        "CShort\\(",
        "CSng\\(",
        "CStr\\(",
        "CType\\(",
        "CUInt\\(",
        "CULng\\(",
        "CUShort\\(",
        "Sum\\(",
        "Avg\\(",
        "Min\\(",
        "Max\\(",
    ];

    useEffect(() => {
        const resize = () => {
            if (editor.current) {
                editor.current.layout({height: 0, width: 0});
                editor.current.layout()

            }
        };

        window.addEventListener('resize', resize);
        setTimeout(() => resize);
        return () => window.removeEventListener('resize', resize)
    });

    useEffectOnce(() => {
        if (element.current) {
            editor.current = monaco.editor.create(element.current, {
                value: props.value,
                language: "vb",
                theme: 'vs-light',
                minimap: {
                    enabled: props.minimap,
                }
            });


            editor.current.onDidChangeModelContent(() => {
                if (editor.current && props.change) props.change(editor.current.getValue())
            })
        }

        return () => editor.current && editor.current.dispose()
    });

    useEffect(() => {
        if (editor.current && editor.current.getValue() !== props.value) {
            editor.current.setValue(props.value)
        }
    }, [props.value]);

    useEffect(() => {
        if (specificationId !== "") {
            loadIntellisenseContext();
        }
    }, [props.specificationId]);

    function convertPropertyInformationResponseToVariable(property: IPropertyInformationResponse, types: Array<ITypeInformationResponse>, level?: number) {
        let variable: IVariable = {
            name: property.name,
            friendlyName: property.friendlyName,
            description: property.description,
            type: property.type,
            items: {},
            isAggregable: property.isAggregable
        };

        if (level === undefined) {
            level = 0;
        }

        let typeInformation = types.find(item => {
            return item.name === variable.type;
        });

        if (typeInformation) {
            level++;
            for (let i in typeInformation.properties) {
                if (level <= 2 && variable.items !== undefined) {
                    let childVariable: IVariable = convertPropertyInformationResponseToVariable(typeInformation.properties[i], types, level);
                    variable.items[childVariable.name.toLowerCase()] = childVariable;
                }
            }
        }

        return variable;
    }

    function loadIntellisenseContext() {
        getCodeContextService(specificationId)
            .then((result: Array<ITypeInformationResponse>) => {
                let variables: IVariableContainer = {};
                let functions: ILocalFunctionContainer = {};
                let calculationTypes = result.filter(item => {
                    return item.name === "AdditionalCalculations" || item.name.toLowerCase() === fundingStreamId.toLowerCase() + 'calculations';
                });
                let dataTypes = result.filter(item => {
                    return item.type === "DefaultType";
                });

                let keywordList = result.filter(item => {
                    return item.type === "Keyword";
                });

                calculationTypes.forEach(calculationType => {
                    let functionvariables: IVariableContainer = {};

                    if (calculationType) {

                        // Local Functions
                        for (let m in calculationType.methods) {
                            let currentMethod: IMethodInformationResponse = calculationType.methods[m];

                            if (currentMethod.friendlyName !== props.calculationName) {
                                let functionInformation: ILocalFunction = new VisualBasicSub({
                                    label: currentMethod.name,
                                    description: currentMethod.description,
                                    returnType: currentMethod.returnType,
                                    parameters: [],
                                    friendlyName: currentMethod.friendlyName,
                                    isCustom: currentMethod.isCustom,
                                });

                                for (let p in currentMethod.parameters) {
                                    let parameter = currentMethod.parameters[p];
                                    let parameterInformation: IFunctionParameter = {
                                        name: parameter.name,
                                        description: parameter.description,
                                        type: parameter.type,
                                    };

                                    functionInformation.parameters.push(parameterInformation);
                                }

                                if (functionInformation.isCustom) {

                                    let variable: IVariable = {
                                        name: currentMethod.name,
                                        friendlyName: currentMethod.friendlyName,
                                        description: currentMethod.description,
                                        type: currentMethod.returnType,
                                        items: {},
                                        isAggregable: "true"
                                    };

                                    functionvariables[variable.name.toLowerCase()] = variable;
                                } else {
                                    functions[functionInformation.label.toLowerCase()] = functionInformation;
                                }
                            } else {
                                let variable: IVariable = {
                                    name: props.calculationName,
                                    friendlyName: props.calculationName,
                                    description: props.calculationName,
                                    type: "string",
                                    items: {},
                                    isAggregable: "true"
                                };

                                functionvariables[variable.name.toLowerCase()] = variable;
                            }
                        }
                    }

                    // Variables
                    for (let v in calculationType.properties) {
                        let propertyInfo: IPropertyInformationResponse = calculationType.properties[v];
                        let variable: IVariable = convertPropertyInformationResponseToVariable(propertyInfo, result);
                        let variableSet: boolean = false;

                        if (calculationType.name === variable.type) {
                            for (let i in functionvariables) {
                                if (functionvariables[i].name == "calcname" || functionvariables[i].type === calculationType.name) {
                                    if (variable.items !== undefined) {
                                        variable.items[i] = functionvariables[i];
                                    }
                                }
                            }

                            variables[variable.name.toLowerCase()] = variable;

                            variableSet = true;
                        }

                        if (variables[variable.name.toLowerCase()] === undefined || variableSet) {
                            variables[variable.name.toLowerCase()] = variable;
                        }
                    }
                });

                let defaultTypes: IDefaultTypeContainer = {};

                if (dataTypes) {
                    for (let dt in dataTypes) {
                        let defaultType: IDefaultType = {
                            label: dataTypes[dt].name,
                            description: dataTypes[dt].description,
                            items: {}
                        }

                        defaultTypes[dataTypes[dt].name.toLowerCase()] = defaultType;
                    }
                }

                let keywords: IKeywordsContainer = {};

                if (keywordList) {
                    for (let kw in keywordList) {
                        let keyword: IKeyword = {
                            label: keywordList[kw].name
                        }

                        keywords[keywordList[kw].name] = keyword;
                    }
                }

                let contextVariables = variables;
                let contextFunctions = functions;
                let contextDefaultTypes = defaultTypes;
                let contextKeywords = keywords;

                monaco.languages.registerCompletionItemProvider('vb', {
                    triggerCharacters: [".", " ", "("],
                    provideCompletionItems: function (model: monaco.editor.ITextModel, position: IPosition,) {

                        let results = {
                            suggestions: []
                        };

                        let lastCharacterTyped: string = "";
                        if (position.column > 0) {
                            let range: monaco.Range = new monaco.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column);

                            lastCharacterTyped = model.getValueInRange(range);
                        }

                        let lineContentsSoFar = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));

                        // @ts-ignore
                        let previousPosition = new monaco.Position(position.lineNumber, position.column - 1);

                        let previousPositionWord = model.getWordAtPosition(previousPosition);

                        let word = model.getWordUntilPosition(position);
                        let editorRange = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn
                        };


                        if (lastCharacterTyped === ".") {
                            if (previousPositionWord) {

                                let previousSpace = lineContentsSoFar.lastIndexOf(" ");
                                let previousOpenBracket = lineContentsSoFar.lastIndexOf("(");

                                let previousCharacter: number = previousSpace > previousOpenBracket ? previousSpace : previousOpenBracket;

                                let path = lineContentsSoFar.substr(previousCharacter + 1, lineContentsSoFar.length - previousCharacter - 2);

                                if (path) {
                                    let pathItems = getVariablesForPath(path, contextVariables);
                                    if (pathItems && pathItems.length > 0) {

                                        for (let variableResultKey in pathItems) {
                                            let variable: IVariable = pathItems[variableResultKey];
                                            let pathVariable = {
                                                label: variable.name,
                                                kind: monaco.languages.CompletionItemKind.Field,
                                                detail: variable.type,
                                                insertText: variable.name,
                                                range: editorRange
                                            };

                                            if (contextVariables[pathVariable.label.toString().toLowerCase()] === undefined) {
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
                                                }

                                                // @ts-ignore
                                                results.suggestions.push(pathVariable);
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            let foundPrefix: boolean = false;
                            for (let i in variableAllowedNowPrefixes) {
                                let prefix = variableAllowedNowPrefixes[i];
                                let exists = new RegExp(prefix + "$").test(lineContentsSoFar);
                                if (exists) {
                                    foundPrefix = true;
                                    break;
                                }
                            }

                            let whitespaceRegex = new RegExp(/(\s)?/);

                            if (foundPrefix || position.column === 1 || whitespaceRegex.test(lineContentsSoFar)) {

                                let variables: Array<IVariable>;
                                let isAggregableFunctionDeclared = checkAggregableFunctionDeclared(lineContentsSoFar);

                                if (isAggregableFunctionDeclared === true) {

                                    variables = getVariableForAggregatePath(lineContentsSoFar, contextVariables);

                                    for (let i in variables) {
                                        // @ts-ignore
                                        results.suggestions.push(createCompletionItem(variables[i], editorRange));
                                    }
                                } else {
                                    for (let key in contextVariables) {

                                        let variable = contextVariables[key];

                                        // @ts-ignore
                                        results.suggestions.push(createCompletionItem(variable, editorRange));
                                    }
                                }

                                if (isAggregableFunctionDeclared === true) {
                                    let defaultTypeCompletionItems = getDefaultDataTypesCompletionItems(lineContentsSoFar, contextDefaultTypes, editorRange);

                                    if (defaultTypeCompletionItems) {
                                        defaultTypeCompletionItems.forEach(d => {
                                            // @ts-ignore
                                            results.suggestions.push(d);
                                        })
                                    }
                                }

                                let codeWithNoComments = processSourceToRemoveComments(model.getValueInRange(new monaco.Range(1, 1, position.lineNumber, position.column)));

                                let declaredVariables = findDeclaredVariables(codeWithNoComments);

                                    declaredVariables.forEach(d => {
                                        let variableItem = {
                                            label: d,
                                            kind: monaco.languages.CompletionItemKind.Field,
                                            insertText: d,
                                            // @ts-ignore
                                            range: editorRange
                                        };

                                        // @ts-ignore
                                        results.suggestions.push(variableItem);
                                    });


                                for (let i in contextFunctions) {
                                    let localFunction: ILocalFunction = contextFunctions[i];

                                    let localFunctionItem = {
                                        label: localFunction.label,
                                        kind: monaco.languages.CompletionItemKind.Function,
                                        detail: localFunction.getFunctionAndParameterDescription(),
                                        insertText: localFunction.label,
                                        range: editorRange
                                    };

                                    let description = "";
                                    let friendlyName = "";

                                    if (typeof localFunction.description !== "undefined") {
                                        description = localFunction.description;
                                    }

                                    if (typeof localFunction.friendlyName !== "undefined") {
                                        friendlyName = localFunction.friendlyName;
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
                                    }

                                    // @ts-ignore
                                    let indexOfDuplicateFunction = results.suggestions.findIndex(x => x.label === localFunction.label);

                                    if (indexOfDuplicateFunction > -1) {
                                        // @ts-ignore
                                        results.suggestions[indexOfDuplicateFunction] = localFunctionItem;
                                    } else {
                                        // @ts-ignore
                                        results.suggestions.push(localFunctionItem);
                                    }
                                }

                                let defaultTypeCompletionItems = getDefaultDataTypesCompletionItems(lineContentsSoFar, contextDefaultTypes, editorRange);

                                if (defaultTypeCompletionItems) {
                                    defaultTypeCompletionItems.forEach(dt => {
                                        // @ts-ignore
                                        results.suggestions.push(dt);
                                    })
                                }

                                let keywordCompletionItems = getKeywordsCompletionItems(lineContentsSoFar, contextKeywords, editorRange);

                                if (keywordCompletionItems) {
                                    keywordCompletionItems.forEach(kc => {
                                        // @ts-ignore
                                        results.suggestions.push(kc)
                                    })
                                    for (let kc in keywordCompletionItems) {
                                    }
                                }
                            }
                        }
                        return results;
                    }
                });

                monaco.languages.registerHoverProvider('vb', {
                    provideHover: function (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken) {
                        let lineContents = model.getLineContent(position.lineNumber);
                        let forwardTextForCurrentLine = model.getValueInRange(new monaco.Range(position.lineNumber, position.column, position.lineNumber, lineContents.length + 1));

                        // @ts-ignore
                        let word = model.getWordAtPosition(position);

                        let range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word ? word.startColumn : 0,
                            endColumn: word ? word.endColumn : 0
                        };

                        let variableHover = getHoverDescriptionForVariable(model, position, forwardTextForCurrentLine, contextVariables, range);
                        if (variableHover) {
                            return variableHover;
                        }

                        let variableLocalFunction = getHoverDescriptionForLocalFunction(model, position, forwardTextForCurrentLine, contextFunctions, range);
                        if (variableLocalFunction) {
                            return variableLocalFunction;
                        }

                        let defaultDataTypes = getHoverDescriptionForDefaultType(model, position, contextDefaultTypes, range);
                        if (defaultDataTypes) {
                            return defaultDataTypes;
                        }

                        // @ts-ignore
                        return null;
                    }
                });
            });
    }

    function createCompletionItem(variable: IVariable, range: any) {

        let variableItem = {
                label: variable.name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: variable.name,
                range: range
            }
        ;

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
                variableItem.kind = 2
            }
        }

        return variableItem;
    }

    function getDefaultDataTypesCompletionItems(path: string, defaultDataTypes: IDefaultTypeContainer, range: any) {

        let asWithWhitespaceRegex = new RegExp(/(\s)as(\s)/i);

        let items = [];

        if (asWithWhitespaceRegex.test(path)) {
            for (let i in defaultDataTypes) {
                let defaultType: IDefaultType = defaultDataTypes[i];

                let defaultTypeItem: monaco.languages.CompletionItem = {
                    label: defaultType.label,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: defaultType.description,
                    insertText: defaultType.label,
                    range: range
                };

                let description = "";
                let friendlyName = defaultType.label;

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

    function getKeywordsCompletionItems(path: string, keywords: IKeywordsContainer, range: any) {

        let items = [];

        if (path.trim() === "" || path.trim().toLowerCase() === "i") {
            for (let k in keywords) {
                let keyword: IKeyword = keywords[k];

                let keywordItem = {
                    label: keyword.label,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: keyword.label,
                    insertText: keyword.label,
                    range: range,
                };

                if (keyword.label === "If-Then-ElseIf-Then") {
                    keywordItem.insertText = "If <condition> Then\n\r\n\rElseIf <condition> Then\n\r\n\rElse\n\r\n\rEnd If";
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

    function getVariablesForPath(path: string, variables: IVariableContainer) {
        if (!path) {
            return [];
        }

        path = path.toLowerCase();

        let pathArray: Array<string> = path.split(".");
        let currentVariableContainer: IVariableContainer = variables;

        for (let variableKey in pathArray) {
            if (currentVariableContainer === null) {
                break;
            }

            let variableContainerKey = pathArray[variableKey];
            let currentVariable: IVariable = currentVariableContainer[variableContainerKey];
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
            let result: Array<IVariable> = [];
            for (let i in currentVariableContainer) {
                result.push(currentVariableContainer[i]);
            }

            return result;
        }

        return [];
    }

    function processSourceToRemoveComments(contents: string) {
        if (!contents) {
            return "";
        }

        let lines = contents.split("\r\n");
        let result = "";

        let newLine = "\r\n";

        for (let i in lines) {
            let line = lines[i];
            if (line) {
                let previousCharacter: string = "";
                let withinString: boolean = false;
                let firstMatch: number = -1;
                for (let i = 0; i < line.length; i++) {
                    let character: string = line[i];
                    if (character === "'" && !withinString) {
                        firstMatch = i;
                        break;
                    }

                    if (character === "\"" && previousCharacter !== "\\") {
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

    function findDeclaredVariables(contents: string) {
        let variableRegex = /\b(\s)?Dim\s+([a-zA-Z][(\w}|\d){0-254}]*([,]([ ])?)*)+/g;
        let regex = new RegExp(variableRegex);
        let match = null;

        let result: Array<string> = [];

        while (match = regex.exec(contents)) {
            if (!match) {
                break;
            }

            let variableNames = match[0].substr(3).trim();

            // Support multiple variables declared at once eg Dim var1, var2, var3
            let variableNamesSplit: Array<string> = variableNames.split(",");
            for (let k in variableNamesSplit) {
                let variableName = variableNamesSplit[k].trim();

                // Make sure there are no duplicates (if the user has defined a variable twice)
                if (result.indexOf(variableName) < 0) {
                    result.push(variableName);
                }
            }
        }


        return result;
    }

    function checkAggregableFunctionDeclared(path: string) {

        if (!path) {
            return false;
        }

        let pathRegex = "( Min|Avg|Max|Sum\\()";

        let regex = new RegExp(pathRegex);

        let match = regex.exec(path);

        return match ? true : false;
    }

    function getVariableForAggregatePath(path: string, variables: IVariableContainer): Array<IVariable> {
        let clonedVariableContainer = Object.assign({}, variables) as IVariableContainer;
        let clonedVariable = clonedVariableContainer["datasets"];
        let variablesArray: Array<IVariable> = [];

        let datasets = getVariablesForPath("Datasets", clonedVariableContainer);

        if (datasets && datasets.length > 0) {
            for (let i in datasets) {
                let datasetVariable: IVariable = datasets[i];
                let fields = getVariablesForPath("Datasets." + datasetVariable.name, clonedVariableContainer);

                let filteredVariables: IVariableContainer = {};

                let hasAggregateFields = false;

                for (let f in fields) {
                    let fieldVariable: IVariable = fields[f];
                    if (fieldVariable.isAggregable.toLowerCase() === "true") {
                        hasAggregateFields = true;
                        filteredVariables[fieldVariable.name.toLowerCase()] = fieldVariable;
                    }
                }

                if (!hasAggregateFields) {
                    if (clonedVariableContainer["datasets"] != null && clonedVariableContainer["datasets"].items !== undefined) {
                        delete clonedVariableContainer["datasets"].items[datasetVariable.name.toLowerCase()];
                    }
                } else {
                    datasetVariable.items = filteredVariables;
                }
            }
        }

        variablesArray.push(clonedVariable);

        for (let c in clonedVariableContainer) {
            let calcVariable: IVariable = clonedVariableContainer[c];

            if (calcVariable.isAggregable !== null && calcVariable.isAggregable.toLowerCase() === "true") {

                variablesArray.push(calcVariable);

                if(clonedVariable.items !== undefined)
                {
                    clonedVariable.items[calcVariable.name] = calcVariable
                }
            }
        }

        return variablesArray;
    }

    function getHoverDescriptionForDefaultType(model: monaco.editor.IReadOnlyModel, position: monaco.Position, dataTypes: IDefaultTypeContainer, range: any) {

        // @ts-ignore
        let word = model.getWordAtPosition(position).word;

        if (dataTypes[word.toLowerCase()]) {

            let foundDefaultType = dataTypes[word.toLowerCase()];

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

            let hover: monaco.languages.Hover = {
                contents: [
                    {
                        value: documentationValue,
                        isTrusted: true,
                    }
                ],
                range: range,
            }

            return hover;
        }

        // @ts-ignore
        return null;
    }

    function getHoverDescriptionForLocalFunction(model: monaco.editor.IReadOnlyModel, position: monaco.Position, forwardText: string, functions: ILocalFunctionContainer, range: any) {
        let backwardsFunctionNameText: string = "";
        if (position.column > 1) {
            let backwardsText = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));

            let localFunctionNameRegexBack = new RegExp(/\b(([a-zA-Z_])([a-zA-Z0-9_]{0,254}))+/g);
            let reversedTextRegexResult;

            let result;
            while (result = localFunctionNameRegexBack.exec(backwardsText)) {
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

        let forwardsLocalFunctionText: string = "";
        if (forwardText) {
            let variableDetectionRegex = new RegExp(/\b(([a-zA-Z_])([a-zA-Z0-9_]{0,254}))+/g);

            let forwardsVariableResult = variableDetectionRegex.exec(forwardText);
            if (forwardsVariableResult) {
                forwardsLocalFunctionText = forwardsVariableResult[0];
            }
        }


        let localFunctionText = (backwardsFunctionNameText + forwardsLocalFunctionText).trim();
        if (localFunctionText) {

            let localFunctionKey = localFunctionText.toLowerCase();

            let foundLocalFunction: ILocalFunction = functions[localFunctionKey];
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

                let hover: monaco.languages.Hover = {
                    contents: [
                        {
                            value: documentationValue,
                            isTrusted: true,
                        }
                    ],
                    range: range,
                }

                return hover;
            }
        }

        return null;
    }

    function getHoverDescriptionForVariable(model: monaco.editor.IReadOnlyModel, position: monaco.Position, forwardText: string, variables: IVariableContainer, range: any) {
        let backwardsVariableText: string = "";
        if (position.column > 1) {
            let backwardsText = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));

            let variableDetectionRegexBack = new RegExp(/\b(([a-zA-Z])([a-zA-Z0-9]{0,254})(\.)?)+/g);
            let reversedTextRegexResult;

            let result;
            while (result = variableDetectionRegexBack.exec(backwardsText)) {
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

        let forwardsVariableText: string = "";
        if (forwardText) {
            let variableDetectionRegex = new RegExp(/\b(([a-zA-Z])([a-zA-Z0-9]{0,254})+)/);

            let forwardsVariableResult = variableDetectionRegex.exec(forwardText);
            if (forwardsVariableResult) {
                forwardsVariableText = forwardsVariableResult[0];
            }
        }

        let variableText = (backwardsVariableText + forwardsVariableText).trim();
        if (variableText) {

            let foundVariable: IVariable = getVariableByPath(variableText, variables);
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

                let hover: monaco.languages.Hover = {
                    contents: [
                        {
                            value: documentationValue,
                            isTrusted: true,
                        }
                    ],
                    range: range
                }

                return hover;
            }
        }

        return null;
    }

    function getVariableByPath(path: string, variables: IVariableContainer) {
        path = path.toLowerCase();

        let pathArray: Array<string> = path.split(".");
        let currentVariableContainer: IVariableContainer = variables;

        if (pathArray.length > 1) {
            for (let variableKey in pathArray.slice(0, pathArray.length - 1)) {
                if (currentVariableContainer == null) {
                    break;
                }

                let variableContainerKey = pathArray[variableKey];
                let currentVariable: IVariable = currentVariableContainer[variableContainerKey];
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

    return create('div', {
        className: "govuk-textarea--monaco-editor",
        children: create('div', {
            ref: element,
            style: {height: height},
        }),
    })
}
