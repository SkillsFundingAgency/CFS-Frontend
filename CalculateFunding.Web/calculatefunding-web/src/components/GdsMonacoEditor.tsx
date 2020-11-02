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
import {checkAggregableFunctionDeclared, convertClassToVariables, createCompletionItem, findDeclaredVariables, getDefaultDataTypesCompletionItems, getHoverDescriptionForDefaultType, getHoverDescriptionForLocalFunction, getHoverDescriptionForVariable, getKeywordsCompletionItems, getVariableForAggregatePath, getVariablesForPath, processSourceToRemoveComments} from "../services/IntellisenseProvider";
import {FundingStream} from "../types/viewFundingTypes";

export function GdsMonacoEditor(props: {
    value: string,
    change: any,
    language: string,
    minimap: boolean,
    specificationId: string,
    calculationType: string,
    calculationName: string,
    fundingStreams: FundingStream[]
}) {
    const height: number = 291;
    const element = useRef<HTMLElement>();
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const specificationId = props.specificationId;

    let isLoading = false;

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
                let functions: ILocalFunctionContainer = {};

                let dataTypes = result.filter(item => {
                    return item.type === "DefaultType";
                });

                let keywordList = result.filter(item => {
                    return item.type === "Keyword";
                });

                let root = result.find(item => item.name === "CalculationContext");

                variables = convertClassToVariables(root, result);

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
