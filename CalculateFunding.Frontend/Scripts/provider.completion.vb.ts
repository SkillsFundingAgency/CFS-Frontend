declare var variableRegex: RegExp;

namespace calculateFunding.providers {

    export class VisualBasicIntellisenseProvider {
        private contextVariables: IVariableContainer = {};
        private contextFunctions: ILocalFunctionContainer = {};
        private contextDefaultTypes: IDefaultTypeContainer = {};
        private contextKeywords: IKeywordsContainer = {};

        private aggregatesFeatureEnabled: boolean;

        private variableAllowedNowPrefixes: Array<string> = [
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

        public setContextVariables(variables: IVariableContainer) {
            delete variables["aggregations"];
            this.contextVariables = variables;
        }

        public setLocalFunctions(functions: ILocalFunctionContainer) {
            this.contextFunctions = functions;
        }

        public setDefaultTypes(defaultTypes: IDefaultTypeContainer) {
            this.contextDefaultTypes = defaultTypes;
        }

        public setKeywords(keywords: IKeywordsContainer) {
            this.contextKeywords = keywords;
        }

        public setAggregateFeatureEnabled(isEnabled: boolean = false) {
            this.aggregatesFeatureEnabled = isEnabled;
        }

        public getCompletionProvider(): monaco.languages.CompletionItemProvider {
            let self: VisualBasicIntellisenseProvider = this;
            return {
                triggerCharacters: [".", " ", "("],
                provideCompletionItems: function (model: monaco.editor.ITextModel, position: monaco.Position, context: monaco.languages.CompletionContext, token: monaco.CancellationToken): monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> {

                    let results: monaco.languages.CompletionList = {
                        suggestions: []
                    };
                   
                    let lastCharacterTyped: string = "";
                    if (position.column > 0) {
                        let range: monaco.Range = new monaco.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column);

                        lastCharacterTyped = model.getValueInRange(range);
                        console.log("Last character typed ", lastCharacterTyped);
                    }

                    let lineContentsSoFar = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));
                    console.log("Line contents so far: ", lineContentsSoFar);

                    let previousPosition: monaco.Position = new monaco.Position(position.lineNumber, position.column - 1);
                    let previousPositionWord = model.getWordAtPosition(previousPosition);

                    if (lastCharacterTyped === ".") {
                        if (previousPositionWord) {
                            console.log("Previous position word: ", previousPositionWord);

                            let previousSpace = lineContentsSoFar.lastIndexOf(" ");
                            let previousOpenBracket = lineContentsSoFar.lastIndexOf("(");

                            let previousCharacter: number = previousSpace > previousOpenBracket ? previousSpace : previousOpenBracket;
                            console.log("Previous Character", previousCharacter);

                            if (previousCharacter > 0) {
                                let path = lineContentsSoFar.substr(previousCharacter + 1, lineContentsSoFar.length - previousCharacter - 2);
                                //console.log("Path: ", path);

                                if (path) {
                                    let pathItems = VisualBasicIntellisenseProvider.GetVariablesForPath(path, self.contextVariables);
                                    if (pathItems && pathItems.length > 0) {

                                        for (let variableResultKey in pathItems) {
                                            let variable: IVariable = pathItems[variableResultKey];
                                            let pathVariable: monaco.languages.CompletionItem = {
                                                label: variable.name,
                                                kind: monaco.languages.CompletionItemKind.Field,
                                                detail: variable.type,
                                                insertText: variable.name
                                            }

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

                                                pathVariable.documentation = {
                                                    value: documentationValue,
                                                    isTrusted: true,
                                                };
                                            }


                                            results.suggestions.push(pathVariable);
                                        }
                                    }
                                }
                            }

                            // TODO - add default types
                            //let defaultTypes = getDefaultTypes();
                            //let defaultType = defaultTypes[previousPositionWord.word];
                            //if (defaultType) {
                            //    for (let k in defaultType.items) {
                            //        let member = defaultType.items[k];
                            //        let defaultTypeItem: monaco.languages.CompletionItem = {
                            //            label: member.label,
                            //            kind: member.type,
                            //        };

                            //        if (typeof member.description != null) {
                            //            defaultTypeItem.detail = member.description;
                            //        }

                            //        if (member.type === monaco.languages.CompletionItemKind.Function) {
                            //            defaultTypeItem.detail = "This is the detail";
                            //            defaultTypeItem.documentation = "This is the documentation";
                            //        }

                            //        results.push(defaultTypeItem);
                            //    }
                            //}
                        }
                    }
                    else {
                        //if (lastCharacterTyped === " " || lastCharacterTyped == "(") {

                        let foundPrefix: boolean = false;
                        for (let i in self.variableAllowedNowPrefixes) {
                            let prefix = self.variableAllowedNowPrefixes[i];
                            let exists = new RegExp(prefix + "$").test(lineContentsSoFar);
                            if (exists) {
                                console.log("Found prefix of :", prefix);
                                foundPrefix = true;
                                break;
                            }
                        }

                        let whitespaceRegex = new RegExp(/(\s)?/);

                        if (foundPrefix || position.column === 1 || whitespaceRegex.test(lineContentsSoFar)) {

                            let variables: Array<IVariable>;
                            let isAggregableFunctionDeclared = (self.aggregatesFeatureEnabled === true && VisualBasicIntellisenseProvider.IsAggregableFunctionDeclared(lineContentsSoFar));

                            if (isAggregableFunctionDeclared === true) {

                                variables = VisualBasicIntellisenseProvider.GetVariableForAggregatePath(lineContentsSoFar, self.contextVariables);

                                for (let i in variables) {
                                    results.suggestions.push(self.CreateCompletionItem(variables[i]));
                                }
                            }
                            else {
                                for (let key in self.contextVariables) {

                                    let variable = self.contextVariables[key];

                                    results.suggestions.push(self.CreateCompletionItem(variable));
                                }
                            }

                            if (isAggregableFunctionDeclared === true) {
                                let defaultTypeCompletionItems = VisualBasicIntellisenseProvider.GetDefaultDataTypesCompletionItems(lineContentsSoFar, self.contextDefaultTypes);

                                if (defaultTypeCompletionItems) {
                                    results.suggestions.push.apply(results, defaultTypeCompletionItems)
                                }

                                return results;
                            }

                            let codeWithNoComments = VisualBasicIntellisenseProvider.ProcessSourceToRemoveComments(model.getValueInRange(new monaco.Range(1, 1, position.lineNumber, position.column)));
                            console.log("Code with no comments: ", codeWithNoComments);

                            let declaredVariables = VisualBasicIntellisenseProvider.FindDeclaredVariables(codeWithNoComments);
                            for (let i in declaredVariables) {
                                let variable: string = declaredVariables[i];
                                let variableItem: monaco.languages.CompletionItem = {
                                    label: variable,
                                    kind: monaco.languages.CompletionItemKind.Field,
                                    insertText: variable
                                };

                                results.suggestions.push(variableItem);
                            }

                            // TODO - add default types
                            //let defaultTypes = getDefaultTypes();
                            //for (let i in defaultTypes) {
                            //    let defaultType: IDefaultType = defaultTypes[i];
                            //    let defaultTypeItem: monaco.languages.CompletionItem = {
                            //        label: defaultType.label,
                            //        kind: monaco.languages.CompletionItemKind.Class,
                            //    };

                            //    if (typeof defaultType.description !== "undefined") {
                            //        defaultTypeItem.detail = defaultType.description;
                            //    }

                            //    results.push(defaultTypeItem);
                            //}

                            console.log("Previous position word ", previousPositionWord);


                            for (let i in self.contextFunctions) {
                                let localFunction: ILocalFunction = self.contextFunctions[i];

                                let localFunctionItem: monaco.languages.CompletionItem = {
                                    label: localFunction.label,
                                    kind: monaco.languages.CompletionItemKind.Function,
                                    detail: localFunction.getFunctionAndParameterDescription(),
                                    insertText: localFunction.label
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

                                    localFunctionItem.documentation = {
                                        value: documentationValue,
                                        isTrusted: true,
                                    };
                                }

                                let indexOfDuplicateFunction = results.suggestions.indexOf(results.suggestions.filter(function (val) {
                                    return val.label === localFunction.label;
                                })[0]);

                                if (indexOfDuplicateFunction > -1) {
                                    results.suggestions[indexOfDuplicateFunction] = localFunctionItem;
                                }
                                else {
                                    results.suggestions.push(localFunctionItem);
                                }
                            }

                            let defaultTypeCompletionItems = VisualBasicIntellisenseProvider.GetDefaultDataTypesCompletionItems(lineContentsSoFar, self.contextDefaultTypes);

                            if (defaultTypeCompletionItems) {
                                results.suggestions.push.apply(results, defaultTypeCompletionItems)
                            }

                            let keywordCompletionItems = VisualBasicIntellisenseProvider.GetKeywordsCompletionItems(lineContentsSoFar, self.contextKeywords);

                            if (keywordCompletionItems) {
                                results.suggestions.push.apply(results, keywordCompletionItems)
                            }

                        }
                    }

                    return results;
                },

                resolveCompletionItem: (model: monaco.editor.ITextModel, position: monaco.Position, item: monaco.languages.CompletionItem, token: monaco.CancellationToken): monaco.languages.CompletionItem | monaco.Thenable<monaco.languages.CompletionItem> => {
                    if (item) {
                        if (item.label) {
                            
                            let description = item.detail;
                            let lowerLabel = item.label.toLowerCase();
                            let localFunction = self.contextFunctions[lowerLabel];
                            if (localFunction && description.indexOf("function aggregate") === -1) {
                                item.insertText = localFunction.label + "(";
                            }
                        }
                    }
                    return item;
                }
            };
        }

        public CreateCompletionItem(variable: IVariable): monaco.languages.CompletionItem {

            let variableItem: monaco.languages.CompletionItem = {
                label: variable.name,
                kind: monaco.languages.CompletionItemKind.Field,
                detail: variable.type,
                insertText: variable.name
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

                variableItem.documentation = {
                    value: documentationValue,
                    isTrusted: true,
                };

                if (documentationValue.indexOf("function aggregate") > -1) {
                    variableItem.kind = 2
                }

                variableItem.detail = documentationValue;
            }

            return variableItem;
        }

        public getHoverProvider(): monaco.languages.HoverProvider {
            let self = this;
            let hoverProvider: monaco.languages.HoverProvider = {
                provideHover: function (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.Hover | monaco.Thenable<monaco.languages.Hover> {
                    let lineContents = model.getLineContent(position.lineNumber);
                    let forwardTextForCurrentLine = model.getValueInRange(new monaco.Range(position.lineNumber, position.column, position.lineNumber, lineContents.length + 1));

                    let variableHover: monaco.languages.Hover = VisualBasicIntellisenseProvider.getHoverDescriptionForVariable(model, position, forwardTextForCurrentLine, self.contextVariables);
                    if (variableHover) {
                        return variableHover;
                    }

                    let variableLocalFunction: monaco.languages.Hover = VisualBasicIntellisenseProvider.getHoverDescriptionForLocalFunction(model, position, forwardTextForCurrentLine, self.contextFunctions);
                    if (variableLocalFunction) {
                        return variableLocalFunction;
                    }

                    let defaultDataTypes: monaco.languages.Hover = VisualBasicIntellisenseProvider.getHoverDescriptionForDefaultType(model, position, self.contextDefaultTypes);
                    if (defaultDataTypes) {
                        return defaultDataTypes;
                    }

                    return null;
                }
            }

            return hoverProvider;
        }

        public static getHoverDescriptionForDefaultType(model: monaco.editor.IReadOnlyModel, position: monaco.Position, dataTypes: IDefaultTypeContainer): monaco.languages.Hover {

            let word = model.getWordAtPosition(position).word

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
                    range: null,
                }

                return hover;
            }

            return null;
        }

        public static getHoverDescriptionForLocalFunction(model: monaco.editor.IReadOnlyModel, position: monaco.Position, forwardText: string, functions: ILocalFunctionContainer): monaco.languages.Hover {
            let backwardsFunctionNameText: string = "";
            if (position.column > 1) {
                let backwardsText = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));
                console.log("Backwards text for local function:", backwardsText);

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
                    console.log("Forward local function", forwardsLocalFunctionText);
                }
            }

            console.log("Backwards text for local function: ", backwardsFunctionNameText);
            console.log("Forward text for local function: ", forwardsLocalFunctionText);

            let localFunctionText = (backwardsFunctionNameText + forwardsLocalFunctionText).trim();
            if (localFunctionText) {
                console.log("Searching for local function: '" + localFunctionText + "'");

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
                        range: null,
                    }

                    return hover;
                }
            }

            return null;
        }

        public static getHoverDescriptionForVariable(model: monaco.editor.IReadOnlyModel, position: monaco.Position, forwardText: string, variables: IVariableContainer): monaco.languages.Hover {
            let backwardsVariableText: string = "";
            if (position.column > 1) {
                let backwardsText = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));
                console.log("Backwards text:", backwardsText);

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
                    console.log("Forward variable", forwardsVariableText);
                }
            }

            console.log("Backwards text for variable: ", backwardsVariableText);
            console.log("Forward text for variable: ", forwardsVariableText);

            let variableText = (backwardsVariableText + forwardsVariableText).trim();
            if (variableText) {
                console.log("Searching for variable: '" + variableText + "'");

                let foundVariable: IVariable = VisualBasicIntellisenseProvider.GetVariableByPath(variableText, variables);
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
                        range: null
                    }

                    return hover;
                }
            }

            return null;
        }

        public static ProcessSourceToRemoveComments(contents: string) {
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
                            }
                            else {
                                withinString = true;
                            }
                        }

                        previousCharacter = character;
                    }
                    if (firstMatch === 0) {
                        continue;
                    }
                    else if (firstMatch > 0) {
                        result = result + line.substr(0, firstMatch) + newLine;
                    }
                    else {
                        result = result + line + newLine;
                    }
                }
            }

            return result;
        }

        public static FindDeclaredVariables(contents: string): Array<string> {
            variableRegex = /\b(\s)?Dim\s+([a-zA-Z][(\w}|\d){0-254}]*([,]([ ])?)*)+/g;
            let regex = new RegExp(variableRegex);
            let matches: Array<string> = [];
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

            console.log("Variable names:", result);

            return result;
        }

        public static GetVariablesForPath(path: string, variables: IVariableContainer): Array<IVariable> {
            if (!path) {
                return [];
            }

            path = path.toLowerCase();

            let pathArray: Array<string> = path.split(".");
            let currentVariableContainer: IVariableContainer = variables;

            for (let variableKey in pathArray) {
                if (currentVariableContainer == null) {
                    break;
                }

                let variableContainerKey = pathArray[variableKey];
                let currentVariable: IVariable = currentVariableContainer[variableContainerKey];
                if (!currentVariable) {
                    currentVariableContainer = null;
                    break;
                }

                if (typeof currentVariable.items !== "undefined") {
                    currentVariableContainer = currentVariable.items;
                }
                else {
                    currentVariableContainer = null;
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

        public static GetVariableByPath(path: string, variables: IVariableContainer): IVariable {
            if (!path) {
                return null;
            }

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
                        currentVariableContainer = null;
                        break;
                    }

                    if (typeof currentVariable.items !== "undefined") {
                        currentVariableContainer = currentVariable.items;
                    }
                    else {
                        currentVariableContainer = null;
                    }
                }
            }
            else {
                currentVariableContainer = variables;
            }

            if (currentVariableContainer) {
                return currentVariableContainer[pathArray[pathArray.length - 1]];
            }

            return null;
        }

        public static GetDefaultDataTypesCompletionItems(path: string, defaultDataTypes: IDefaultTypeContainer): Array<monaco.languages.CompletionItem> {

            let asWithWhitespaceRegex = new RegExp(/(\s)as(\s)/i);

            let items: Array<monaco.languages.CompletionItem> = [];

            if (asWithWhitespaceRegex.test(path)) {
                for (let i in defaultDataTypes) {
                    let defaultType: IDefaultType = defaultDataTypes[i];

                    let defaultTypeItem: monaco.languages.CompletionItem = {
                        label: defaultType.label,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        detail: defaultType.description,
                        insertText: defaultType.label
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

        public static GetKeywordsCompletionItems(path: string, keywords: IKeywordsContainer): Array<monaco.languages.CompletionItem> {
        
            let items: Array<monaco.languages.CompletionItem> = [];

            if (path.trim() === "" || path.trim().toLowerCase() == "i") {
                for (let k in keywords) {
                    let keyword: IKeyword = keywords[k];

                    let keywordItem: monaco.languages.CompletionItem = {
                        label: keyword.label,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        detail: keyword.label,
                        insertText: keyword.label
                    };

                    if (keyword.label === "If-Then-ElseIf-Then") {
                        keywordItem.insertText = "If <condition> Then\n\r\n\rElseIf <condition> Then\n\r\n\rElse\n\r\n\rEnd If";
                    }
                    else if (keyword.label === "If-Then-Else") {
                        keywordItem.insertText = "If <condition> Then\n\r\n\rElse\n\r\n\rEnd If";
                    }
                    else if (keyword.label === "If-Then") {
                        keywordItem.insertText = "If <condition> Then\n\r\n\rEnd If";
                    }

                    items.push(keywordItem);
                }
            }

            return items;
        }

        public static IsAggregableFunctionDeclared(path: string): boolean {

            if (!path) {
                return false;
            }

            let pathRegex = "( Min|Avg|Max|Sum\\()";

            let regex = new RegExp(pathRegex);

            let match = regex.exec(path);

            if (match) {
                return true
            }

            return false;
        }

        public static GetVariableForAggregatePath(path: string, variables: IVariableContainer): Array<IVariable> {
            let clonedVariableContainer = Object.assign({}, variables) as IVariableContainer;
            let clonedVariable = clonedVariableContainer["datasets"];
            let variablesArray: Array<IVariable> = [];

            let datasets = VisualBasicIntellisenseProvider.GetVariablesForPath("Datasets", clonedVariableContainer);

            if (datasets && datasets.length > 0) {
                for (let i in datasets) {
                    let datasetVariable: IVariable = datasets[i];
                    let fields = VisualBasicIntellisenseProvider.GetVariablesForPath("Datasets." + datasetVariable.name, clonedVariableContainer);

                    let filteredVariables: IVariableContainer = {};

                    let hasAggregateFields = false;

                    for (let f in fields) {
                        let fieldVariable: IVariable = fields[f];
                        if (fieldVariable.isAggregable.toLowerCase() == "true") {
                            hasAggregateFields = true;
                            filteredVariables[fieldVariable.name.toLowerCase()] = fieldVariable;
                        }
                    }

                    if (!hasAggregateFields) {
                        delete clonedVariableContainer["datasets"].items[datasetVariable.name.toLowerCase()];
                    }
                    else {
                        datasetVariable.items = filteredVariables;
                    }
                }
            }

            variablesArray.push(clonedVariable);

            for (let c in clonedVariableContainer) {
                let calcVariable: IVariable = clonedVariableContainer[c];

                if (calcVariable.isAggregable !== null && calcVariable.isAggregable.toLowerCase() === "true") {

                    variablesArray.push(calcVariable);
                    //clonedVariable.items[calcVariable.name] = calcVariable
                }
            }

            return variablesArray;
        }
    }

    export interface IVariableContainer {
        [key: string]: IVariable
    }

    export interface IVariable {
        name: string;
        friendlyName: string;
        type: string;
        description?: string;
        items?: IVariableContainer;
        isAggregable: string;
    }

    export interface IKeyword {
        label: string;
    }

    export interface IKeywordsContainer {
        [key: string]: IKeyword
    }

    export interface IDefaultTypes {
        [key: string]: IDefaultType
    }

    export interface IDefaultTypeContainer {
        [key: string]: IDefaultType
    }

    export interface IDefaultMemberTypeContainer {
        [key: string]: IDefaultTypeMember
    }

    export interface IDefaultType {
        label: string;

        description?: string;

        items: IDefaultMemberTypeContainer;
    }

    export interface IDefaultTypeMember {
        label: string;

        description?: string;

        type: monaco.languages.CompletionItemKind;
    }

    export interface ILocalFunctionContainer {
        [key: string]: ILocalFunction
    }

    export interface ILocalFunction {
        label: string;

        friendlyName: string;

        description: string;

        parameters: Array<IFunctionParameter>;

        returnType: string;

        isCustom: boolean;

        getFunctionAndParameterDescription(): string;
    }

    export interface IFunctionParameter {
        name: string;

        description: string;

        type: string;
    }

    export interface ILocalFunctionConstructorParameters {
        label: string;

        description: string;

        friendlyName: string;

        parameters: Array<IFunctionParameter>;

        returnType: string;

        isCustom: boolean;
    }

    export class VisualBasicSub implements ILocalFunction {
        constructor(data?: ILocalFunctionConstructorParameters) {
            if (data) {
                this.label = data.label;
                this.description = data.description;
                this.parameters = data.parameters;
                this.returnType = data.returnType;
                this.friendlyName = data.friendlyName;
                this.isCustom = data.isCustom;
            }
        }

        public label: string;

        public friendlyName: string;

        public description: string;

        public parameters: Array<IFunctionParameter>;

        public returnType: string;

        public isCustom: boolean;

        public getFunctionAndParameterDescription(): string {

            let parameterDescription: Array<string> = [];
            if (this.parameters) {
                for (let p in this.parameters) {
                    parameterDescription.push(this.parameters[p].type + " " + this.parameters[p].name);
                }
            }

            return (this.returnType ? this.returnType : "Void") + " " + this.label + "(" + parameterDescription.join(", ") + ")";
        }
    }
}