declare var variableRegex: RegExp;


namespace calculateFunding.providers {

    export class VisualBasicIntellisenseProvider {
        private contextVariables: IVariableContainer = {};
        private contextFunctions: ILocalFunctionContainer = {};

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
        ];

        public setContextVariables(variables: IVariableContainer) {
            this.contextVariables = variables;
        }

        public setLocalFunctions(functions: ILocalFunctionContainer) {
            this.contextFunctions = functions;
        }

        public getCompletionProvider(): monaco.languages.CompletionItemProvider {
            let self: VisualBasicIntellisenseProvider = this;
            return {
                triggerCharacters: [".", " ", "("],
                provideCompletionItems: function (model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> {

                    let results: Array<monaco.languages.CompletionItem> = [];

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
                                            }

                                            //// TODO - reenable once backend is providing data
                                            //if (typeof variable.description !== "undefined") {
                                            //    pathVariable.documentation = {
                                            //        value: variable.description,
                                            //        isTrusted: false,
                                            //    };
                                            //}

                                            results.push(pathVariable);
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
                            for (let key in self.contextVariables) {
                                let variable = self.contextVariables[key];
                                let variableItem: monaco.languages.CompletionItem = {
                                    label: variable.name,
                                    kind: monaco.languages.CompletionItemKind.Field,
                                    detail: variable.type,
                                };

                                //// TODO - reenable once backend is providing data
                                //if (typeof variable.description != "undefined") {
                                //    variableItem.documentation = variable.description;
                                //}

                                results.push(variableItem);
                            }


                            let codeWithNoComments = VisualBasicIntellisenseProvider.ProcessSourceToRemoveComments(model.getValueInRange(new monaco.Range(1, 1, position.lineNumber, position.column)));
                            console.log("Code with no comments: ", codeWithNoComments);

                            let declaredVariables = VisualBasicIntellisenseProvider.FindDeclaredVariables(codeWithNoComments);
                            for (let i in declaredVariables) {
                                let variable: string = declaredVariables[i];
                                let variableItem: monaco.languages.CompletionItem = {
                                    label: variable,
                                    kind: monaco.languages.CompletionItemKind.Field,
                                };

                                results.push(variableItem);
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
                                };

                                // TODO - reenable once backend is providing data
                                //if (typeof localFunction.description !== "undefined") {
                                //    localFunctionItem.documentation: {
                                //value: localFunction.description,
                                //    isTrusted: false,
                                //    };
                                //}

                                results.push(localFunctionItem);
                            }
                        }
                    }

                    return results;
                },
                resolveCompletionItem: (item: monaco.languages.CompletionItem, token: monaco.CancellationToken): monaco.languages.CompletionItem | monaco.Thenable<monaco.languages.CompletionItem> => {
                    if (item) {
                        if (item.label) {
                            let lowerLabel = item.label.toLowerCase();
                            let localFunction = self.contextFunctions[lowerLabel];
                            if (localFunction) {
                                item.insertText = localFunction.label + "(";
                            }
                        }
                    }
                    return item;
                }
            };
        }

        public getHoverProvider(): monaco.languages.HoverProvider {
            let self = this;
            let hoverProvider: monaco.languages.HoverProvider = {
                provideHover: function (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.Hover | monaco.Thenable<monaco.languages.Hover> {

                    // TODO - reenable once backend is providing data
                    //let lineContents = model.getLineContent(position.lineNumber);
                    //let forwardTextForCurrentLine = model.getValueInRange(new monaco.Range(position.lineNumber, position.column, position.lineNumber, lineContents.length + 1));

                    //let variableHover: monaco.languages.Hover = VisualBasicIntellisenseProvider.getHoverDescriptionForVariable(model, position, forwardTextForCurrentLine, self.contextVariables);
                    //if (variableHover) {
                    //    return variableHover;
                    //}

                    //let variableLocalFunction: monaco.languages.Hover = VisualBasicIntellisenseProvider.getHoverDescriptionForLocalFunction(model, position, forwardTextForCurrentLine, self.contextFunctions);
                    //if (variableLocalFunction) {
                    //    return variableLocalFunction;
                    //}

                    return null;
                }
            }

            return hoverProvider;
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
                    let description = foundLocalFunction.label;

                    if (typeof foundLocalFunction.description !== "undefined" && foundLocalFunction.description) {
                        description = foundLocalFunction.description;
                    }

                    let hover: monaco.languages.Hover = {
                        contents: [
                            {
                                value: description,
                                isTrusted: false,
                            }
                        ],
                        range: null,
                    }

                    return hover;
                }
            }
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
                    let description = foundVariable.name;

                    if (typeof foundVariable.description !== "undefined" && foundVariable.description) {
                        description = foundVariable.description;
                    }

                    let hover: monaco.languages.Hover = {
                        contents: [
                            {
                                value: description,
                                isTrusted: false,
                            }
                        ],
                        range: null
                    }

                    return hover;
                }
            }
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

    }

    export interface IVariableContainer {
        [key: string]: IVariable
    }

    export interface IVariable {
        name: string;
        type: string;
        description?: string;
        items?: IVariableContainer;
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

        description: string;

        parameters: Array<IFunctionParameter>;

        returnType: string;

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

        parameters: Array<IFunctionParameter>;

        returnType: string;
    }

    export class VisualBasicSub implements ILocalFunction {
        constructor(data?: ILocalFunctionConstructorParameters) {
            if (data) {
                this.label = data.label;
                this.description = data.description;
                this.parameters = data.parameters;
                this.returnType = data.returnType;
            }
        }

        public label: string;

        public description: string;

        public parameters: Array<IFunctionParameter>;

        public returnType: string;

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