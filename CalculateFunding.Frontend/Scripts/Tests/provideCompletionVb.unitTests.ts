/// <reference path="../provider.completion.vb.ts" />
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />

describe("VisualBasicIntellisenseProvider - FindDeclaredVariables", function () {

    describe("when no variables are declared", function () {
        it("with empty string then no declared variables declared", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("");
            expect(variables).toEqual([]);
        });
        it("with string not containing any variables", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("No variables here");
            expect(variables).toEqual([]);
        });
        it("with lowercase dim then no variables declared", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("dim s");
            expect(variables).toEqual([]);
        });
    });
    describe("when a single variable is declared without type", function () {
        it("then variable at the beginning of a string is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("Dim s");
            expect(variables).toEqual(["s"]);
        });
        it("then variable at the beginning of second line is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("Test = 1\r\nDim s");
            expect(variables).toEqual(["s"]);
        });
        it("then variable is found with preceeding spaces", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("    Dim s");
            expect(variables).toEqual(["s"]);
        });
        it("then variable is found with preceeding tab", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("\tDim s");
            expect(variables).toEqual(["s"]);
        });
    });
    describe("when a single variable is declared with type", function () {
        it("then variable at the beginning of a string is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("Dim s as String");
            expect(variables).toEqual(["s"]);
        });
        it("then variable at the beginning of second line is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("Test = 1\r\nDim s as String");
            expect(variables).toEqual(["s"]);
        });
        it("then variable is found with preceeding spaces", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("    Dim s as String");
            expect(variables).toEqual(["s"]);
        });
        it("then variable is found with preceeding tab", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("\tDim s as String");
            expect(variables).toEqual(["s"]);
        });
    });
    describe("when a multi variable string is declared with two variables", function () {
        it("then variable at the beginning of a string is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("Dim s, s2");
            expect(variables).toEqual(["s", "s2"]);
        });
        it("then variable at the beginning of second line is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("Test = 1\r\nDim s, s2");
            expect(variables).toEqual(["s", "s2"]);
        });
        it("then variable is found with preceeding spaces", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("    Dim s, s2");
            expect(variables).toEqual(["s", "s2"]);
        });
        it("then variable is found with preceeding tab", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("\tDim s, s2");
            expect(variables).toEqual(["s", "s2"]);
        });
    });
    describe("when a multi variable string is declared with two variables and no spaces", function () {
        it("then variable at the beginning of a string is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("Dim s,s2");
            expect(variables).toEqual(["s", "s2"]);
        });
        it("then variable at the beginning of second line is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("Test = 1\r\nDim s,s2");
            expect(variables).toEqual(["s", "s2"]);
        });
        it("then variable is found with preceeding spaces", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("    Dim s,s2");
            expect(variables).toEqual(["s", "s2"]);
        });
        it("then variable is found with preceeding tab", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("\tDim s,s2");
            expect(variables).toEqual(["s", "s2"]);
        });
    });
    describe("when using ReDim", function () {
        it("then no match is found", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.FindDeclaredVariables("ReDim s");
            expect(variables).toEqual([]);
        });
    });
});