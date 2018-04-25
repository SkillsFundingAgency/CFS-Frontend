/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../../node_modules/@types/requirejs/index.d.ts" />
/// <reference path="../provider.completion.gherkin.ts" />

require.config({ paths: { 'vs': '/assets/libs/js/monaco/vs' } });


describe("GherkinIntellisenseProvider - provideCompletionItems", function () {

    describe("when no text in editor", function () {
        let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;

        // Arrange
        beforeEach((done) => {
            require(['vs/editor/editor.main'], function () {
                let model = monaco.editor.createModel("", "gherkin");

                let provider = new calculateFunding.providers.GherkinIntellisenseProvider();
                let completionProvider = provider.getCompletionProvider();

                // Act
                result = completionProvider.provideCompletionItems(model, new monaco.Position(0, 0), null, null);
                done();

            });
        });

        it("No completion items returned", function () {
            let expectedResult: monaco.languages.CompletionItem[] = [];

            // Assert
            expect(result).toEqual(expectedResult);
        });

    });
    describe("dataset syntax", function () {

        describe("dataset name parsing", () => {
            describe("When a single item in datasets", () => {
                let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;

                // Arrange
                beforeEach((done) => {
                    let datasets: Array<calculateFunding.providers.IDataset> = [{
                        name: "Test Dataset",
                        fields: [],
                    }];

                    // Act
                    runMonacoCompletion("Given the dataset '", 1, 21, datasets, [], done, (completionResult) => { result = completionResult });
                });

                it("A CompletionItem for given dataset is returned", function () {
                    // Assert
                    let expectedResult: monaco.languages.CompletionItem[] = [{
                        label: "Test Dataset",
                        kind: monaco.languages.CompletionItemKind.Field,
                        insertText: "Test Dataset'",
                    }];

                    expect(result).toEqual(expectedResult);
                });
            });
            describe("When no items set in datasets", () => {
                let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;

                beforeEach((done) => {
                    runMonacoCompletion("Given the dataset '", 1, 21, [], [], done, (r) => { result = r });
                });

                it("No completion items returned", function () {
                    // Assert
                    let expectedResult: monaco.languages.CompletionItem[] = [];

                    expect(result).toEqual(expectedResult);

                });
            });
            describe("When a multiple items in datasets", () => {
                let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;

                beforeEach((done) => {
                    let datasets: Array<calculateFunding.providers.IDataset> = [];
                    datasets.push({
                        name: "Test Dataset 1",
                        description: "Test Dataset 1 Description",
                        fields: [],
                    });

                    // Undefined description
                    datasets.push({
                        name: "Test Dataset 2",
                        fields: [],
                    });

                    // Null description
                    datasets.push({
                        name: "Test Dataset 3",
                        fields: [],
                        description: null,
                    });

                    runMonacoCompletion("Given the dataset '", 1, 21, datasets, [], done, (r) => { result = r });
                });

                it("Multiple completion items are returned", function () {
                    // Assert

                    let expectedResult: monaco.languages.CompletionItem[] = [{
                        label: "Test Dataset 1",
                        kind: monaco.languages.CompletionItemKind.Field,
                        documentation: "Test Dataset 1 Description",
                        insertText: "Test Dataset 1'",
                    },
                    {
                        label: "Test Dataset 2",
                        kind: monaco.languages.CompletionItemKind.Field,
                        insertText: "Test Dataset 2'",
                    },
                    {
                        label: "Test Dataset 3",
                        kind: monaco.languages.CompletionItemKind.Field,
                        documentation: null,
                        insertText: "Test Dataset 3'",
                    }];

                    expect(result).toEqual(expectedResult);

                });
            });

        });
        describe("dataset field name parsing", () => {
            describe("When previous dataset given and fields exist", () => {
                let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;

                // Arrange
                beforeEach((done) => {
                    let datasets: Array<calculateFunding.providers.IDataset> = [{
                        name: "Test Dataset",
                        fields: [
                            { name: "Field 1", fieldName: "Field1", type: "String", },
                            { name: "Field 2", fieldName: "Field2", type: "Decimal", }
                        ]
                    },
                    {
                        name: "Test Dataset 2",
                        fields: [
                            { name: "TDS2 - Field 3", fieldName: "Field3", type: "Decimal" },
                            { name: "TDS2 - Field 4", fieldName: "Field4", type: "String" }
                        ]

                    }];

                    // Act
                    runMonacoCompletion("Given the dataset 'Test Dataset' field '", 1, 41, datasets, [], done, (completionResult) => { result = completionResult });
                });

                it("Expected completion items returned for dataset fields", function () {
                    // Assert
                    let expectedResult: monaco.languages.CompletionItem[] = [{
                        label: "Field 1",
                        kind: monaco.languages.CompletionItemKind.Field,
                        detail: "String",
                        insertText: "Field 1'",
                    },
                    {
                        label: "Field 2",
                        kind: monaco.languages.CompletionItemKind.Field,
                        detail: "Decimal",
                        insertText: "Field 2'",
                    }];

                    expect(result).toEqual(expectedResult);
                });
            });
            describe("When previous dataset given and dataset doesn't exist", () => {
                let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;
                let cip: monaco.languages.CompletionItemProvider;

                // Arrange
                beforeEach((done) => {
                    let datasets: Array<calculateFunding.providers.IDataset> = [{
                        name: "Test Dataset",
                        fields: [
                            { name: "Field 1", fieldName: "Field1", type: "String", },
                            { name: "Field 2", fieldName: "Field2", type: "Decimal", }
                        ]
                    },
                    {
                        name: "Test Dataset 2",
                        fields: [
                            { name: "TDS2 - Field 3", fieldName: "Field3", type: "Decimal" },
                            { name: "TDS2 - Field 4", fieldName: "Field4", type: "String" }
                        ]

                    }];

                    // Act
                    runMonacoCompletion("Given the dataset 'Not Dataset' with '", 1, 40, datasets, [], done, (completionResult, completionProvider) => { result = completionResult, cip = completionProvider });
                });

                it("No completion items returned", function () {
                    // Assert                    
                    expect(cip.provideCompletionItems).toHaveBeenCalled();
                    expect(result).toEqual([]);
                });
            });
            describe("When previous dataset given and no fields exist", () => {
                let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;
                let cip: monaco.languages.CompletionItemProvider;

                // Arrange
                beforeEach((done) => {
                    let datasets: Array<calculateFunding.providers.IDataset> = [{
                        name: "Test Dataset",
                        fields: []
                    },
                    {
                        name: "Test Dataset 2",
                        fields: [
                            { name: "TDS2 - Field 3", fieldName: "Field3", type: "Decimal" },
                            { name: "TDS2 - Field 4", fieldName: "Field4", type: "String" }
                        ]

                    }];

                    // Act
                    runMonacoCompletion("Given the dataset 'Test Dataset' with '", 1, 41, datasets, [], done, (completionResult, cr) => { result = completionResult, cip = cr });
                });

                it("An empty list of completion items are returned", function () {
                    // Assert
                    expect(result).toEqual([]);

                    expect(cip.provideCompletionItems).toHaveBeenCalled();
                });
            });
        });

    });

    describe("calculation syntax", () => {
        describe("calculation field lookup", () => {
            describe("When calculations exist", () => {
                let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;

                // Arrange
                beforeEach((done) => {

                    let datasets: Array<calculateFunding.providers.IDataset> = generateSampleDatasets();

                    let calculations: Array<calculateFunding.providers.ICalculation> = [
                        { name: "Calc 1", description: "Description for Calc 1", },
                        { name: "Calc 2", description: "Description for Calc 2", },
                        { name: "Calc 3", description: "Description for Calc 3", },
                    ];

                    // Act
                    runMonacoCompletion("Given the result for '", 1, 23, datasets, calculations, done, (completionResult) => { result = completionResult });
                });

                it("Expected completion items returned for calculation names", function () {
                    // Assert
                    let expectedResult: monaco.languages.CompletionItem[] = [{
                        label: "Calc 1",
                        kind: monaco.languages.CompletionItemKind.Method,
                        documentation: "Description for Calc 1",
                        insertText: "Calc 1'",
                    },
                    {
                        label: "Calc 2",
                        kind: monaco.languages.CompletionItemKind.Method,
                        documentation: "Description for Calc 2",
                        insertText: "Calc 2'",
                    },
                    {
                        label: "Calc 3",
                        kind: monaco.languages.CompletionItemKind.Method,
                        documentation: "Description for Calc 3",
                        insertText: "Calc 3'",
                    }];

                    expect(result).toEqual(expectedResult);
                });
            });
            describe("When no calculations exist", () => {
                let result: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider;

                // Arrange
                beforeEach((done) => {

                    let datasets : Array<calculateFunding.providers.IDataset> = generateSampleDatasets();
                    let calculations: Array<calculateFunding.providers.ICalculation> = [];

                    // Act
                    runMonacoCompletion("Given the result for '", 1, 23, datasets, calculations, done, (completionResult) => { result = completionResult });
                });

                it("Expected completion items returned for calculation names", function () {
                    // Assert
                    let expectedResult: monaco.languages.CompletionItem[] = [];

                    expect(result).toEqual(expectedResult);
                });
            });
        });
    });
});


function runMonacoCompletion(contents: string, lineNumber: number, column: number, datasets: Array<calculateFunding.providers.IDataset> = [], calculations: Array<calculateFunding.providers.ICalculation> = [], done: DoneFn = null, resultCallback: (completionResult: monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList>, completionProvider: monaco.languages.CompletionItemProvider) => void = null) {
    require(['vs/editor/editor.main'], function () {
        // Arrange
        let model = monaco.editor.createModel(contents, "gherkin");

        let provider = new calculateFunding.providers.GherkinIntellisenseProvider();

        let completionProvider = provider.getCompletionProvider();
        spyOn(completionProvider, "provideCompletionItems").and.callThrough();

        provider.setDatasets(datasets);
        provider.setCalculations(calculations);

        // Act
        let result = completionProvider.provideCompletionItems(model, new monaco.Position(lineNumber, column), null, null);
        if (resultCallback) {
            resultCallback(result, completionProvider);
        }

        if (done) {
            done();
        }
    });
}

function generateSampleDatasets(): Array<calculateFunding.providers.IDataset> {
    return [{
        name: "Test Dataset",
        fields: [
            { name: "Field 1", fieldName: "Field1", type: "String", },
            { name: "Field 2", fieldName: "Field2", type: "Decimal", }
        ]
    },
    {
        name: "Test Dataset 2",
        fields: [
            { name: "TDS2 - Field 3", fieldName: "Field3", type: "Decimal" },
            { name: "TDS2 - Field 4", fieldName: "Field4", type: "String" }
        ]

    }];
}