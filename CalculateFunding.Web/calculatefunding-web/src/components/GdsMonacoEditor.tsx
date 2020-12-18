import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {IPosition} from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/language/css/monaco.contribution'
import 'monaco-editor/esm/vs/language/html/monaco.contribution'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution'
import {createElement as create, useEffect, useRef} from 'react'
import {useEffectOnce} from "../hooks/useEffectOnce";
import {getCodeContextService} from "../services/calculationService";
import {ITypeInformationResponse} from "../types/Calculations/CodeContext";
import {IVariableContainer} from "../types/GdsMonacoEditor/IVariableContainer";
import {ILocalFunctionContainer} from "../types/GdsMonacoEditor/ILocalFunctionContainer";
import {IDefaultTypeContainer} from "../types/GdsMonacoEditor/IDefaultTypeContainer";
import {IKeywordsContainer} from "../types/GdsMonacoEditor/IKeywordsContainer";
import {IVariable} from "../types/GdsMonacoEditor/IVariable";
import {ILocalFunction} from "../types/GdsMonacoEditor/ILocalFunction";
import {IDefaultType} from "../types/GdsMonacoEditor/IDefaultType";
import {IKeyword} from "../types/GdsMonacoEditor/IKeyword";
import {
    checkAggregableFunctionDeclared,
    convertClassToVariables,
    createCompletionItem,
    findDeclaredVariables,
    findEnum, findEnumItems,
    getDefaultDataTypesCompletionItems,
    getHoverDescriptionForDefaultType,
    getHoverDescriptionForLocalFunction,
    getHoverDescriptionForVariable,
    getKeywordsCompletionItems, getOptionsForPath,
    getVariableForAggregatePath,
    getVariablesForPath,
    processSourceToRemoveComments
} from "../services/IntellisenseProvider";
import {FundingStream} from "../types/viewFundingTypes";

export function GdsMonacoEditor(props: {
    calculationId?: string;
    value: string,
    change: any,
    language: string,
    minimap: boolean,
    specificationId: string,
    calculationType: string,
    calculationName: string,
    fundingStreams: FundingStream[]
}) {
    const height = 291;
    const element = useRef<HTMLElement>();
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const specificationId = props.specificationId;

    let isLoading = false;

    const variableAllowedNowPrefixes: Array<string> = [
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

        loadIntellisenseContext();

        return () => editor.current && editor.current.dispose()
    });

    useEffect(() => {
        if (editor.current && editor.current.getValue() !== props.value) {
            editor.current.setValue(props.value)
        }
    }, [props.value]);


    function loadIntellisenseContext() {
        getCodeContextService(specificationId)
            .then((result: Array<ITypeInformationResponse>) => {
                let variables: IVariableContainer = {};
                const functions: ILocalFunctionContainer = {};

                const dataTypes = result.filter(item => {
                    return item.type === "DefaultType";
                });

                const keywordList = result.filter(item => {
                    return item.type === "Keyword";
                });

                const optionsList = result.filter(item => {
                    return item.type.endsWith("Options");
                })

                const root = result.find(item => item.name === "CalculationContext");

                variables = convertClassToVariables(root, result);

                if (props.calculationId) {
                    const enumVariable = findEnum(result, props.calculationId);


                    if (enumVariable !== undefined && enumVariable.name !== "") {
                        const enumItems = findEnumItems(enumVariable.name, result);

                        if (enumItems !== undefined) {
                            if (enumVariable.items === undefined) {
                                enumVariable.items = {};
                            }

                            if (enumItems.enumValues !== null) {
                                enumItems.enumValues.forEach(x => {
                                    // @ts-ignore
                                    enumVariable.items[x.toLowerCase()] = {
                                        description: x,
                                        friendlyName: x,
                                        isAggregable: false,
                                        items: {},
                                        name: x,
                                        type: x,
                                        variableType: monaco.languages.CompletionItemKind.EnumMember
                                    }
                                })
                            }
                        }
                        if (enumVariable.name !== undefined) {
                            variables[enumVariable.name.toLowerCase()] = enumVariable;
                        }
                    }
                }

                const defaultTypes: IDefaultTypeContainer = {};

                if (dataTypes) {
                    for (const dt in dataTypes) {
                        const defaultType: IDefaultType = {
                            label: dataTypes[dt].name,
                            description: dataTypes[dt].description,
                            items: {}
                        }

                        defaultTypes[dataTypes[dt].name.toLowerCase()] = defaultType;
                    }
                }

                const keywords: IKeywordsContainer = {};

                if (keywordList) {
                    for (const kw in keywordList) {
                        const keyword: IKeyword = {
                            label: keywordList[kw].name
                        }

                        keywords[keywordList[kw].name] = keyword;
                    }
                }

                const options: IVariableContainer = {}

                if (optionsList) {
                    for (const ol in optionsList) {
                        const optionItem = optionsList[ol];

                        const tempContainer: IVariableContainer = {};

                        optionItem.enumValues.forEach(x => tempContainer[x.toLowerCase()] = {
                            name: x,
                            description: x,
                            friendlyName: x,
                            isAggregable: false,
                            type: x,
                            variableType: monaco.languages.CompletionItemKind.EnumMember,
                        })

                        const option: IVariable = {
                            name: optionItem.name,
                            description: optionItem.description,
                            friendlyName: optionItem.name,
                            isAggregable: false,
                            type: optionItem.type,
                            variableType: monaco.languages.CompletionItemKind.Enum,
                            items: tempContainer
                        }

                        options[optionsList[ol].name.toLowerCase()] = option;
                    }
                }


                const contextVariables = variables;
                const contextFunctions = functions;
                const contextDefaultTypes = defaultTypes;
                const contextKeywords = keywords;
                const contextOptions = options;

                monaco.languages.registerCompletionItemProvider('vb', {
                    triggerCharacters: [".", " ", "(", "="],
                    provideCompletionItems: function (model: monaco.editor.ITextModel, position: IPosition,) {

                        const results = {
                            suggestions: []
                        };

                        let lastCharacterTyped = "";
                        if (position.column > 0) {
                            const range: monaco.Range = new monaco.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column);

                            lastCharacterTyped = model.getValueInRange(range);
                        }

                        const lineContentsSoFar = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));

                        // @ts-ignore
                        const previousPosition = new monaco.Position(position.lineNumber, position.column - 1);

                        const previousPositionWord = model.getWordAtPosition(previousPosition);

                        const word = model.getWordUntilPosition(position);
                        const editorRange = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn
                        };


                        if (lastCharacterTyped === ".") {
                            if (previousPositionWord) {

                                const previousSpace = lineContentsSoFar.lastIndexOf(" ");
                                const previousOpenBracket = lineContentsSoFar.lastIndexOf("(");

                                const previousCharacter: number = previousSpace > previousOpenBracket ? previousSpace : previousOpenBracket;

                                const path = lineContentsSoFar.substr(previousCharacter + 1, lineContentsSoFar.length - previousCharacter - 2);

                                if (path) {
                                    const pathItems = getVariablesForPath(path, contextVariables);
                                    const optionItems = getVariablesForPath(path, contextOptions);

                                    if (pathItems && pathItems.length > 0) {

                                        for (const variableResultKey in pathItems) {
                                            const variable: IVariable = pathItems[variableResultKey];
                                            const pathVariable = {
                                                label: variable.name,
                                                kind: variable.variableType,
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

                                    if (optionItems && optionItems.length > 0) {

                                        for (const variableResultKey in optionItems) {
                                            const variable: IVariable = optionItems[variableResultKey];
                                            const pathVariable = {
                                                label: variable.name,
                                                kind: variable.variableType,
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
                         } else if (lastCharacterTyped === " " && lineContentsSoFar.trimEnd().charAt(lineContentsSoFar.trimEnd().length - 1) === "=") {
                            let pathString = lineContentsSoFar.replace('=', '').replace('()', '').trimEnd();

                            const path = pathString.split(' ').splice(-1).toString().toLowerCase() + "options";

                            if (path) {
                                const pathItems = getOptionsForPath(path, contextOptions);
                                if (pathItems && pathItems.length > 0) {

                                    for (const variableResultKey in pathItems) {
                                        const variable: IVariable = pathItems[variableResultKey];
                                        const pathVariable = {
                                            label: variable.name,
                                            kind: variable.variableType,
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
                        } else {
                            let foundPrefix = false;
                            for (const i in variableAllowedNowPrefixes) {
                                const prefix = variableAllowedNowPrefixes[i];
                                const exists = new RegExp(prefix + "$").test(lineContentsSoFar);
                                if (exists) {
                                    foundPrefix = true;
                                    break;
                                }
                            }

                            const whitespaceRegex = new RegExp(/(\s)?/);

                            if (foundPrefix || position.column === 1 || whitespaceRegex.test(lineContentsSoFar)) {

                                let variables: Array<IVariable>;
                                const isAggregableFunctionDeclared = checkAggregableFunctionDeclared(lineContentsSoFar);

                                if (isAggregableFunctionDeclared === true) {

                                    variables = getVariableForAggregatePath(lineContentsSoFar, contextVariables);

                                    for (const i in variables) {
                                        // @ts-ignore
                                        results.suggestions.push(createCompletionItem(variables[i], editorRange));
                                    }
                                } else {
                                    for (const key in contextVariables) {

                                        const variable = contextVariables[key];

                                        // @ts-ignore
                                        results.suggestions.push(createCompletionItem(variable, editorRange));
                                    }
                                }

                                if (isAggregableFunctionDeclared === true) {
                                    const defaultTypeCompletionItems = getDefaultDataTypesCompletionItems(lineContentsSoFar, contextDefaultTypes, editorRange);

                                    if (defaultTypeCompletionItems) {
                                        defaultTypeCompletionItems.forEach(d => {
                                            // @ts-ignore
                                            results.suggestions.push(d);
                                        })
                                    }
                                }

                                const codeWithNoComments = processSourceToRemoveComments(model.getValueInRange(new monaco.Range(1, 1, position.lineNumber, position.column)));

                                const declaredVariables = findDeclaredVariables(codeWithNoComments);

                                declaredVariables.forEach(d => {
                                    const variableItem = {
                                        label: d,
                                        kind: monaco.languages.CompletionItemKind.Field,
                                        insertText: d,
                                        // @ts-ignore
                                        range: editorRange
                                    };

                                    // @ts-ignore
                                    results.suggestions.push(variableItem);
                                });


                                for (const i in contextFunctions) {
                                    const localFunction: ILocalFunction = contextFunctions[i];

                                    const localFunctionItem = {
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
                                    const indexOfDuplicateFunction = results.suggestions.findIndex(x => x.label === localFunction.label);

                                    if (indexOfDuplicateFunction > -1) {
                                        // @ts-ignore
                                        results.suggestions[indexOfDuplicateFunction] = localFunctionItem;
                                    } else {
                                        // @ts-ignore
                                        results.suggestions.push(localFunctionItem);
                                    }
                                }

                                const defaultTypeCompletionItems = getDefaultDataTypesCompletionItems(lineContentsSoFar, contextDefaultTypes, editorRange);

                                if (defaultTypeCompletionItems) {
                                    defaultTypeCompletionItems.forEach(dt => {
                                        // @ts-ignore
                                        results.suggestions.push(dt);
                                    })
                                }

                                const keywordCompletionItems = getKeywordsCompletionItems(lineContentsSoFar, contextKeywords, editorRange);

                                if (keywordCompletionItems) {
                                    keywordCompletionItems.forEach(kc => {
                                        // @ts-ignore
                                        results.suggestions.push(kc)
                                    })
                                    for (const kc in keywordCompletionItems) {
                                    }
                                }
                            }
                        }
                        return results;
                    }
                });

                monaco.languages.registerHoverProvider('vb', {
                    provideHover: function (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken) {
                        const lineContents = model.getLineContent(position.lineNumber);
                        const forwardTextForCurrentLine = model.getValueInRange(new monaco.Range(position.lineNumber, position.column, position.lineNumber, lineContents.length + 1));

                        // @ts-ignore
                        const word = model.getWordAtPosition(position);

                        const range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word ? word.startColumn : 0,
                            endColumn: word ? word.endColumn : 0
                        };

                        const variableHover = getHoverDescriptionForVariable(model, position, forwardTextForCurrentLine, contextVariables, range);
                        if (variableHover) {
                            return variableHover;
                        }

                        const variableLocalFunction = getHoverDescriptionForLocalFunction(model, position, forwardTextForCurrentLine, contextFunctions, range);
                        if (variableLocalFunction) {
                            return variableLocalFunction;
                        }

                        const defaultDataTypes = getHoverDescriptionForDefaultType(model, position, contextDefaultTypes, range);
                        if (defaultDataTypes) {
                            return defaultDataTypes;
                        }

                        // @ts-ignore
                        return null;
                    }
                });

                isLoading = true;
            });
    }

    if (isLoading) {
        return null;
    }

    return create('div', {
        className: "govuk-textarea--monaco-editor",
        children: create('div', {
            ref: element,
            style: {height: height},
        }),
    })
}
