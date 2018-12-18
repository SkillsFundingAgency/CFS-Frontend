/// <reference path="common.d.ts" />

namespace calculateFunding.providers {

    export class GherkinIntellisenseProvider {
        private datasets: IDatasetContainer = {};
        private calculations: Array<ICalculation> = [];

        // Used for future intellisense enhancement
        //private comparisonOperators: string[] = [
        //    "is greater than",
        //    "is greater than or equal to",
        //    "is less than",
        //    "is less than or equal to",
        //    "is equal to",
        //    "is not equal to"
        //];

        public setDatasets(datasets: Array<IDataset>) {
            this.datasets = {};
            if (datasets) {
                for (let i in datasets) {
                    let dataset: IDataset = datasets[i];
                    this.datasets[dataset.name] = dataset;
                }
            }
        }

        public setCalculations(calculations: Array<ICalculation>) {
            if (calculations) {
                this.calculations = calculations;
            }
            else {
                this.calculations = [];
            }
        }

        public getCompletionProvider(): monaco.languages.CompletionItemProvider {
            let self: GherkinIntellisenseProvider = this;
            return {
                triggerCharacters: ["'"],
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

                    let nextCharacter = model.getValueInRange(new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1));

                    let previousPosition: monaco.Position = new monaco.Position(position.lineNumber, position.column - 1);
                    let previousPositionWord = model.getWordAtPosition(previousPosition);

                    let aDatasetRegex = new RegExp(/(\s)+the(\s)+dataset(\s)+'$/);
                    if (aDatasetRegex.test(lineContentsSoFar)) {
                        for (let i in self.datasets) {
                            let dataset: IDataset = self.datasets[i];
                            let completionItem: monaco.languages.CompletionItem = {
                                label: dataset.name,
                                kind: monaco.languages.CompletionItemKind.Field,
                                insertText: dataset.name
                            };

                            if (typeof dataset.description !== "undefined") {
                                completionItem.documentation = dataset.description;
                            }

                            if (nextCharacter !== "'") {
                                completionItem.insertText = dataset.name + "'";
                            }

                            results.suggestions.push(completionItem);
                        }

                        return results;
                    }

                    let aDatasetComparisonWithValueRegex = new RegExp(/(\s)+the(\s)+dataset(\s)+('[a-zA-Z0-9-_ ]+')(\s)+field(\s)+'$/);
                    if (aDatasetComparisonWithValueRegex.test(lineContentsSoFar)) {
                        let datasetNameRegex = aDatasetComparisonWithValueRegex.exec(lineContentsSoFar);

                        // Dataset name in 4th index of regex expression. It has single quotes surrounding it. If the regex changes above in aDatasetComparisonWithValueRegex, then change the index
                        var datasetName = datasetNameRegex[4];
                        datasetName = datasetName.substr(1, datasetName.length - 2);

                        let currentDataset: IDataset = self.datasets[datasetName];

                        if (currentDataset) {
                            for (let i: number = 0; i < currentDataset.fields.length; i++) {
                                let datasetField: IDatasetField = currentDataset.fields[i];
                                let completionItem: monaco.languages.CompletionItem = {
                                    label: datasetField.name,
                                    kind: monaco.languages.CompletionItemKind.Field,
                                    detail: datasetField.type,
                                    insertText: datasetField.name
                                };

                                if (typeof datasetField.description !== "undefined") {
                                    completionItem.documentation = datasetField.description;
                                }

                                if (nextCharacter !== "'") {
                                    completionItem.insertText = datasetField.name + "'";
                                }

                                results.suggestions.push(completionItem);
                            }
                        }

                        return results;
                    }

                    let calculationResultRegex = new RegExp(/(the)(\s)+(result)(\s)+(for)(\s)+'$/);
                    if (calculationResultRegex.test(lineContentsSoFar)) {

                        for (let i: number = 0; i < self.calculations.length; i++) {
                            let calculation: ICalculation = self.calculations[i];
                            let completionItem: monaco.languages.CompletionItem = {
                                label: calculation.name,
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: calculation.name
                            };

                            if (typeof calculation.description !== "undefined") {
                                completionItem.documentation = calculation.description;
                            }

                            if (nextCharacter !== "'") {
                                completionItem.insertText = calculation.name + "'";
                            }

                            results.suggestions.push(completionItem);

                        }
                    }
                    
                    return results;
                },

                resolveCompletionItem: (model: monaco.editor.ITextModel, position: monaco.Position, item: monaco.languages.CompletionItem, token: monaco.CancellationToken): monaco.languages.CompletionItem | monaco.Thenable<monaco.languages.CompletionItem> => {
                    return null;
                }
            };
        }

        // Used in future enhancement
        //    public static ProcessSourceToRemoveComments(contents: string) {
        //        if (!contents) {
        //            return "";
        //        }

        //        let lines = contents.split("\r\n");
        //        let result = "";

        //        let newLine = "\r\n";

        //        for (let i in lines) {
        //            let line = lines[i];
        //            if (line) {
        //                let previousCharacter: string = "";
        //                let withinString: boolean = false;
        //                let firstMatch: number = -1;
        //                for (let i = 0; i < line.length; i++) {
        //                    let character: string = line[i];
        //                    if (character === "#" && !withinString) {
        //                        firstMatch = i;
        //                        break;
        //                    }

        //                    if (character === "'" && previousCharacter !== "\'") {
        //                        if (withinString) {
        //                            withinString = false;
        //                        }
        //                        else {
        //                            withinString = true;
        //                        }
        //                    }

        //                    previousCharacter = character;
        //                }
        //                if (firstMatch === 0) {
        //                    continue;
        //                }
        //                else if (firstMatch > 0) {
        //                    result = result + line.substr(0, firstMatch) + newLine;
        //                }
        //                else {
        //                    result = result + line + newLine;
        //                }
        //            }
        //        }

        //        return result;
        //    }

    }

    export interface IDatasetContainer {
        [key: string]: IDataset;
    }

    export interface IDataset {
        name: string;
        description?: string;
        fields: Array<IDatasetField>;
    }

    export interface IDatasetField {
        name: string;
        fieldName: string;
        description?: string;
        type: string;
    }

    export interface ICalculation {
        name: string;
        description: string;
    }
}