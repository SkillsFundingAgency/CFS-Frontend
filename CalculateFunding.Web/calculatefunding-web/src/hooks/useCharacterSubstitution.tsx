import { useState } from "react";

export interface CharacterSubstitutionResult {
    substituteCharacters: (value: string) => void;
    substitution: string;
}

export const useCharacterSubstitution = (): CharacterSubstitutionResult => {
    const [substitution, setSubstitution] = useState<string>("");

    const exemptValues: string[] = ["Nullable(Of Decimal)", "Nullable(Of Integer)"];
    const reservedWords: string[] = ["AddHandler", "AddressOf", "Alias", "And", "AndAlso", "As", "Boolean", "ByRef", "Byte", "ByVal", "Call", "Case", "Catch", "CBool", "CByte", "CChar", "CDate", "CDbl", "CDec", "Char", "CInt", "Class", "CLng", "CObj", "Const", "Continue", "CSByte", "CShort", "CSng", "CStr", "CType", "CUInt", "CULng", "CUShort", "Date", "Decimal", "Declare", "Default", "Delegate", "Dim", "DirectCast", "Do", "Double", "Each", "Else", "ElseIf", "End", "EndIf", "Enum", "Erase", "Error", "Event", "Exit", "False", "Finally", "For", "Friend", "Function", "Get", "GetType", "GetXmlNamespace", "Global", "GoSub", "GoTo", "Handles", "If", "Implements", "Imports", "In", "Inherits", "Integer", "Interface", "Is", "IsNot", "Let", "Lib", "Like", "Long", "Loop", "Me", "Mod", "Module", "MustInherit", "MustOverride", "MyBase", "MyClass", "Namespace", "Narrowing", "New", "Next", "Not", "Nothing", "NotInheritable", "NotOverridable", "Object", "Of", "On", "Operator", "Option", "Optional", "Or", "OrElse", "Overloads", "Overridable", "Overrides", "ParamArray", "Partial", "Private", "Property", "Protected", "Public", "RaiseEvent", "ReadOnly", "ReDim", "REM", "RemoveHandler", "Resume", "Return", "SByte", "Select", "Set", "Shadows", "Shared", "Short", "Single", "Static", "Step", "Stop", "String", "Structure", "Sub", "SyncLock", "Then", "Throw", "To", "True", "Try", "TryCast", "TypeOf", "UInteger", "ULong", "UShort", "Using", "Variant", "Wend", "When", "While", "Widening", "With", "WithEvents", "WriteOnly", "Xor"];

    const escapeReservedWord = (value: string) => {
        if (value === null || value.trimEnd() === "") {
            return "";
        }

        if (reservedWords.includes(value)) {
            return `[${value}]`;
        } else {
            return value;
        }
    }

    const generateIdentifier = (value: string, escapeLeadingNumber = true) => {
        if (value === null || value.trim() === "") {
            return "";
        }
        if (exemptValues.includes(value)) {
            return value;
        }
        let className = value;
        className = className.replace("<", "LessThan");
        className = className.replace(">", "GreaterThan");
        className = className.replace("%", "Percent");
        className = className.replace("£", "Pound");
        className = className.replace("=", "Equals");
        className = className.replace("+", "Plus");
        className = className.replace(/["]+/g, "");

        const chars: string[] = [];

        for (let i = 0; i < className.length; i++) {
            chars.push(className.substring(i, 1));
        }

        const convertToSentenceCase = new RegExp("\\b[a-z]");

        const matches = convertToSentenceCase.exec(className);

        if (matches) {
            for (let i = 0; i < matches?.length; i++) {
                chars.push(matches[i].toString().toUpperCase());
            }
            chars.forEach(char => {
                className.concat(char)

                const regex = new RegExp("/[ !\"#$%&'()*+,-./:;<=>?@[\\\\]^_`{|}~]/");

                const invalidCharMatches = regex.exec(className);

                invalidCharMatches?.forEach((invalidCharMatch) =>{
                    className.replace(invalidCharMatch, "");
                })
            });
        }

        const characterRegExp  = new RegExp("[0-9]");

        if (escapeLeadingNumber && characterRegExp.exec(className.charAt(0))) {
            className = `_${className}`;
        }

        return className.replace(" ", "");
    }

    const substituteCharacters = (value: string) => {
        const inspection = value.split(" ");

        let result = "";

        inspection.forEach(word => {
            const escapeResult = escapeReservedWord(word);
            const identifier = generateIdentifier(word);

            if (escapeResult !== word) {
                result = result.concat(escapeResult);
            } else if (identifier !== word) {
                result = result.concat(identifier);
            } else {
                result = result.concat(word);
            }
        });

        setSubstitution(result);
    }

    return {
        substituteCharacters,
        substitution
    }
}
