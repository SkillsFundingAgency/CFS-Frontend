declare var variableRegex: RegExp;

namespace calculateFunding.providers {

    //let variables: IVariableContainer = {
    //    "datasets": {
    //        label: "Datasets",
    //        items: {
    //            "ds1": { label: "Ds1", description: "Dataset 1" },
    //            "dataset2": {
    //                label: "DataSet2",
    //                description: "This is the Dataset2 Description",
    //                items: {
    //                    "prop1": { label: "Prop1", description: "Property One Description lkjads;lfkjdsaflkjasdflkjsadflkjsadflkjsadflkjdsaflkjadsflkjadsflkjadsflkjasdflkajsdflkajsdf" },
    //                    "prop2": { label: "Prop2", description: "Property Two Description" }

    //                }
    //            },
    //            "previousyear": { label: "PreviousYear", description: "Previous years results" }
    //        }
    //    },
    //    "provider": {
    //        label: "Provider",
    //        description: "Current Provider",
    //        items: {
    //            "name": { label: "Name", description: "Provider Name" },
    //            "postcode": { label: "Postcode", description: "Provider post code" },
    //            "address": { label: "Address", description: "Provider street address" },
    //        }
    //    }
    //}

    //function getDefaultTypes(): IDefaultTypeContainer {
    //    let defaultTypes: IDefaultTypeContainer = {
    //        "Decimal": {
    //            label: "Decimal",
    //            description: "Represents a decimal number",
    //            items: {
    //                "MinValue": { label: "MinValue", type: monaco.languages.CompletionItemKind.Field },
    //                "MaxValue": { label: "MaxValue", type: monaco.languages.CompletionItemKind.Field },
    //            }
    //        },
    //        "String": {
    //            label: "String",
    //            description: "Represents text as a sequence of UTF-16 code units.",
    //            items: {
    //                "Empty": { label: "Empty", type: monaco.languages.CompletionItemKind.Field },
    //                "Join": { label: "Join", type: monaco.languages.CompletionItemKind.Function },

    //            }
    //        }
    //    }

    //    return defaultTypes;
    //}

    let variables: IVariableContainer = {
        "datasets": {
            label: "Datasets",
            items: {
                "studentscensuscurrentyear": {
                    label: "StudentsCensusCurrentYear",
                    description: "The Students Census contains student band information and total students for lagged.",
                    items: {
                        "band1total": { label: "Band1Total", description: "S05 Band 1 Total" },
                        "band2total": { label: "Band2Total", description: "S05 Band 2 Total" },
                        "band3total": { label: "Band3Total", description: "S05 Band 3 Total" },
                        "band4atotal": { label: "Band4aTotal", description: "S05 Band 4a Total" },
                        "band4btotal": { label: "Band4bTotal", description: "S05 Band 4b Total" },
                        "band5total": { label: "Band5Total", description: "S05 Band 5 Total" },
                        "band1ftes": { label: "Band1FTEs", description: "S05 Band 1 Full Time Equivalents" },
                        "totalstudentsforlagged": { label: "TotalStudentsForLagged", description: "S02 TOTAL students for lagged" },
                    }
                },
            }
        },
        "provider": {
            label: "Provider",
            description: "Current Provider",
            items: {
                "name": { label: "Name", description: "Provider Name" },
                "postcode": { label: "Postcode", description: "Provider post code" },
                "address": { label: "Address", description: "Provider street address" },
            }
        },
        "rid": {
            label: "rid",
            description: "String",
        },
        "currentscenario": {
            label: "CurrentScenario",
            description: "Scenario",
        }
    }

    function getDefaultTypes(): IDefaultTypeContainer {
        let defaultTypes: IDefaultTypeContainer = {
            "Decimal": {
                label: "Decimal",
                description: "Represents a decimal number",
                items: {
                    "MinValue": { label: "MinValue", type: monaco.languages.CompletionItemKind.Field },
                    "MaxValue": { label: "MaxValue", type: monaco.languages.CompletionItemKind.Field },
                }
            },
            "String": {
                label: "String",
                description: "Represents text as a sequence of UTF-16 code units.",
                items: {
                    "Empty": { label: "Empty", type: monaco.languages.CompletionItemKind.Field },
                    "Join": { label: "Join", type: monaco.languages.CompletionItemKind.Function },

                }
            }
        }

        return defaultTypes;
    }

    let localFunctions: ILocalFunctionContainer = {
        "rateperstudent": {
            label: "RatePerStudent",
            description: "Decimal RatePerStudent() - This calculation returns the rate per student.",
            parameters: null,
            returnType: "Decimal",
        },
        "latoprov": {
            label: "LAToProv",
            description: "T LAToProv(T value)",
            parameters: [{ name: "value", description: "value", type: "T" }],
            returnType: "T",
        },
        "print": {
            label: "Print",
            description: "Void Print(T value, String name, String rid)",
            parameters: [{ name: "value", description: "value", type: "T" }],
            returnType: "Void",
        },
        "iif": {
            label: "IIf",
            description: "T IIf(T value, Boolean one, Boolean two)",
            parameters: [{ name: "value", description: "value", type: "T" }],
            returnType: "T",
        }
    }

    let variableAllowedNowPrefixes: Array<string> = [
        // If and If with brackets and spaces, but not matching End If
        "(?<!End )If(\s)*(\\()?( )*",
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

    function GetVariablesForPath(path: string): Array<IVariable> {
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

    function GetVariableByPath(path: string): IVariable {
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

    export function getVbCompletionProvider(): monaco.languages.CompletionItemProvider {
        return {
            triggerCharacters: [".", " ", "("],
            provideCompletionItems: function (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> {
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
                                let pathItems = GetVariablesForPath(path);
                                if (pathItems && pathItems.length > 0) {

                                    for (let variableResultKey in pathItems) {
                                        let variable: IVariable = pathItems[variableResultKey];
                                        let pathVariable: monaco.languages.CompletionItem = {
                                            label: variable.label,
                                            kind: monaco.languages.CompletionItemKind.Field,
                                        }

                                        if (typeof variable.description !== "undefined") {
                                            pathVariable.detail = variable.description;
                                        }

                                        results.push(pathVariable);
                                    }
                                }
                            }
                        }

                        let defaultTypes = getDefaultTypes();
                        let defaultType = defaultTypes[previousPositionWord.word];
                        if (defaultType) {
                            for (let k in defaultType.items) {
                                let member = defaultType.items[k];
                                let defaultTypeItem: monaco.languages.CompletionItem = {
                                    label: member.label,
                                    kind: member.type,
                                };

                                if (typeof member.description != null) {
                                    defaultTypeItem.detail = member.description;
                                }

                                if (member.type === monaco.languages.CompletionItemKind.Function) {
                                    defaultTypeItem.detail = "This is the detail";
                                    defaultTypeItem.documentation = "This is the documentation";
                                }

                                results.push(defaultTypeItem);
                            }
                        }
                    }
                }

                if (lastCharacterTyped === " " || lastCharacterTyped == "(") {

                    let foundPrefix: boolean = false;
                    for (let i in variableAllowedNowPrefixes) {
                        let prefix = variableAllowedNowPrefixes[i];
                        let exists = new RegExp(prefix + "$").test(lineContentsSoFar);
                        if (exists) {
                            console.log("Found prefix of :", prefix);
                            foundPrefix = true;
                            break;
                        }
                    }

                    if (foundPrefix) {
                        for (let key in variables) {
                            let variable = variables[key];
                            let variableItem: monaco.languages.CompletionItem = {
                                label: variable.label,
                                kind: monaco.languages.CompletionItemKind.Field,
                            };

                            if (typeof variable.description != "undefined") {
                                variableItem.detail = variable.description;
                            }

                            results.push(variableItem);
                        }


                        let codeWithNoComments = ProcessSourceToRemoveComments(model.getValueInRange(new monaco.Range(1, 1, position.lineNumber, position.column)));
                        console.log("Code with no comments: ", codeWithNoComments);

                        let declaredVariables = FindDeclaredVariables(codeWithNoComments);
                        for (let i in declaredVariables) {
                            let variable: string = declaredVariables[i];
                            let variableItem: monaco.languages.CompletionItem = {
                                label: variable,
                                kind: monaco.languages.CompletionItemKind.Field,
                            };

                            results.push(variableItem);
                        }

                        let defaultTypes = getDefaultTypes();
                        for (let i in defaultTypes) {
                            let defaultType: IDefaultType = defaultTypes[i];
                            let defaultTypeItem: monaco.languages.CompletionItem = {
                                label: defaultType.label,
                                kind: monaco.languages.CompletionItemKind.Class,
                            };

                            if (typeof defaultType.description !== "undefined") {
                                defaultTypeItem.detail = defaultType.description;
                            }

                            results.push(defaultTypeItem);
                        }
                        console.log("Previous position word ", previousPositionWord);


                        for (let i in localFunctions) {
                            let localFunction: ILocalFunction = localFunctions[i];

                            let localFunctionItem: monaco.languages.CompletionItem = {
                                label: localFunction.label,
                                kind: monaco.languages.CompletionItemKind.Function,
                            };

                            if (typeof localFunction.description !== "undefined") {
                                localFunctionItem.detail = localFunction.description;
                            }

                            results.push(localFunctionItem);
                        }
                    }
                }

                return results;
            }
        };
    }

    export function getSignatureHelpProvider(): monaco.languages.SignatureHelpProvider {
        return {
            signatureHelpTriggerCharacters: ["("],
            provideSignatureHelp: function (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.SignatureHelp | monaco.Thenable<monaco.languages.SignatureHelp> {
                let signatures: Array<monaco.languages.SignatureInformation> = [];

                //let sig: monaco.languages.SignatureInformation = {
                //    label: "String Join(separator as String, values as IEnumerable(Of String))",
                //    documentation: "Concatenates the members of a constructed System.Collections.Generic.IEnumerable`1 collection of type System.String, using the specified separator between each member.",
                //    parameters: [
                //        {
                //            label: "separator",
                //            documentation: "The string to use as a separator.separator is included in the returned string only if values has more than one element."
                //        },
                //        {
                //            label: "values",
                //            documentation: "A collection that contains the strings to concatenate."
                //        }
                //    ]
                //}

                //signatures.push(sig);


                let result = {
                    signatures: signatures,
                    activeSignature: 0,
                    activeParameter: 0,
                };
                console.log("Signature result: ", result);
                return result;
            }
        }
    }

    export function getHoverProvider(): monaco.languages.HoverProvider {
        let hoverProvider: monaco.languages.HoverProvider = {
            provideHover: function (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.Hover | monaco.Thenable<monaco.languages.Hover> {

                let lineContents = model.getLineContent(position.lineNumber);
                let forwardTextForCurrentLine = model.getValueInRange(new monaco.Range(position.lineNumber, position.column, position.lineNumber, lineContents.length + 1));

                let variableHover: monaco.languages.Hover = getHoverDescriptionForVariable(model, position, forwardTextForCurrentLine);
                if (variableHover) {
                    return variableHover;
                }

                let variableLocalFunction: monaco.languages.Hover = getHoverDescriptionForLocalFunction(model, position, forwardTextForCurrentLine);
                if (variableLocalFunction) {
                    return variableLocalFunction;
                }

                return null;

                //    let backwardsVariableText: string = "";
                //    if (position.column > 1) {
                //        let backwardsText = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));
                //        console.log("Backwards text:", backwardsText);

                //        let variableDetectionRegexBack = new RegExp(/\b(([a-zA-Z])([a-zA-Z0-9]{0,254})(\.)?)+/g);
                //        let reversedTextRegexResult;

                //        let result;
                //        while (result = variableDetectionRegexBack.exec(backwardsText)) {
                //            if (!result) {
                //                break;
                //            }

                //            reversedTextRegexResult = result;
                //        }
                //        if (reversedTextRegexResult) {
                //            if (reversedTextRegexResult.length > 0) {
                //                backwardsVariableText = reversedTextRegexResult[0];
                //            }
                //        }
                //    }

                //    let forwardsVariableText: string = "";
                //    if (forwardText) {
                //        let variableDetectionRegex = new RegExp(/\b(([a-zA-Z])([a-zA-Z0-9]{0,254})+)/);

                //        let forwardsVariableResult = variableDetectionRegex.exec(forwardText);
                //        if (forwardsVariableResult) {
                //            forwardsVariableText = forwardsVariableResult[0];
                //            console.log("Forward variable", forwardsVariableText);
                //        }
                //    }

                //    console.log("Backwards text for variable: ", backwardsVariableText);
                //    console.log("Forward text for variable: ", forwardsVariableText);

                //    let variableText = (backwardsVariableText + forwardsVariableText).trim();
                //    if (variableText) {
                //        console.log("Searching for variable: '" + variableText + "'");

                //        let foundVariable: IVariable = GetVariableByPath(variableText);
                //        if (foundVariable) {
                //            let description = foundVariable.label;

                //            if (typeof foundVariable.description !== "undefined" && foundVariable.description) {
                //                description = foundVariable.description;
                //            }

                //            let hover: monaco.languages.Hover = {
                //                contents: [
                //                    {
                //                        language: 'hover',
                //                        value: description
                //                    }
                //                ],
                //                range: null
                //            }

                //            return hover;
                //        }
                //    }
                //}
            }
        }

        return hoverProvider;
    }

    function getHoverDescriptionForVariable(model: monaco.editor.IReadOnlyModel, position: monaco.Position, forwardText: string): monaco.languages.Hover {
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

            let foundVariable: IVariable = GetVariableByPath(variableText);
            if (foundVariable) {
                let description = foundVariable.label;

                if (typeof foundVariable.description !== "undefined" && foundVariable.description) {
                    description = foundVariable.description;
                }

                let hover: monaco.languages.Hover = {
                    contents: [
                        {
                            language: 'hover',
                            value: description
                        }
                    ],
                    range: null
                }

                return hover;
            }
        }
    }

    function getHoverDescriptionForLocalFunction(model: monaco.editor.IReadOnlyModel, position: monaco.Position, forwardText: string): monaco.languages.Hover {
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

            let foundLocalFunction: ILocalFunction = localFunctions[localFunctionKey];
            if (foundLocalFunction) {
                let description = foundLocalFunction.label;

                if (typeof foundLocalFunction.description !== "undefined" && foundLocalFunction.description) {
                    description = foundLocalFunction.description;
                }

                let hover: monaco.languages.Hover = {
                    contents: [
                        {
                            language: 'hover',
                            value: description
                        }
                    ],
                    range: null
                }

                return hover;
            }
        }
    }


    function ProcessSourceToRemoveComments(contents: string) {
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

    function FindDeclaredVariables(contents: string): Array<string> {
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
            let variableNamesSplit: Array<string> = variableNames.split(", ");
            for (let k in variableNamesSplit) {
                let variableName = variableNamesSplit[k];

                // Make sure there are no duplicates (if the user has defined a variable twice)
                if (result.indexOf(variableName) < 0) {
                    result.push(variableName);
                }
            }
        }

        console.log("Variable names:", result);

        return result;
    }

    interface IVariableContainer {
        [key: string]: IVariable
    }

    interface IVariable {
        label: string;

        description?: string;

        items?: IVariableContainer;
    }

    interface IDefaultTypes {
        [key: string]: IDefaultType
    }

    interface IDefaultTypeContainer {
        [key: string]: IDefaultType
    }

    interface IDefaultMemberTypeContainer {
        [key: string]: IDefaultTypeMember
    }

    interface IDefaultType {
        label: string;

        description?: string;

        items: IDefaultMemberTypeContainer;
    }

    interface IDefaultTypeMember {
        label: string;

        description?: string;

        type: monaco.languages.CompletionItemKind;
    }

    interface ILocalFunctionContainer {
        [key: string]: ILocalFunction
    }

    interface ILocalFunction {
        label: string;

        description?: string;

        parameters: Array<IFunctionParameter>;

        returnType: string;
    }

    interface IFunctionParameter {
        name: string;

        description: string;

        type: string;
    }
}