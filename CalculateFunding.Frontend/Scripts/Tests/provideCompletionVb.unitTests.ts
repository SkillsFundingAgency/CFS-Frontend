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
    describe("when using Sum", function () {
        it("then IsAggregableFunctionDeclared is true", function () {
          
            var result = calculateFunding.providers.VisualBasicIntellisenseProvider.IsAggregableFunctionDeclared("Dim a = Sum(");

            expect(result).toEqual(true);
        });
    });
    describe("when using Avg", function () {
        it("then IsAggregableFunctionDeclared is true", function () {

            var result = calculateFunding.providers.VisualBasicIntellisenseProvider.IsAggregableFunctionDeclared("Dim a = Avg(");

            expect(result).toEqual(true);
        });
    });
    describe("when using Min", function () {
        it("then IsAggregableFunctionDeclared is true", function () {

            var result = calculateFunding.providers.VisualBasicIntellisenseProvider.IsAggregableFunctionDeclared("Dim a = Min(");

            expect(result).toEqual(true);
        });
    });
    describe("when using Max", function () {
        it("then IsAggregableFunctionDeclared is true", function () {

            var result = calculateFunding.providers.VisualBasicIntellisenseProvider.IsAggregableFunctionDeclared("Dim a = Max(");

            expect(result).toEqual(true);
        });
    });
    describe("when Sum has been typed ", function () {
        var container = {
            "providers": {
                name: "Providers",
                friendlyName: "Providers",
                type: "",
                isAggregable: "false",
                items: {
                    urn: {
                        name: "URN", friendlyName: "URN", items: {}, type: "", isAggregable: "false"
                    }
                }
            },
            "datasets": {
                name: "Datasets",
                friendlyName: "Datasets",
                isAggregable: "false",
                type: "",
                items: {
                    ds1: {
                        name: "ds1", isAggregable: "false", friendlyName: "", type: "", items: {
                            f1: { name: "f1", isAggregable: "true", friendlyName: "", type: "", items: {} }, f2: { name: "f2", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f3", isAggregable: "true", friendlyName: "", type: "", items: {} }
                        }
                    },
                    ds2: {
                        name: "ds2", isAggregable: "false", friendlyName: "", type: "", items: { f11: { name: "f11", isAggregable: "false", friendlyName: "", type: "", items: {} }, f2: { name: "f22", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f33", isAggregable: "false", friendlyName: "", type: "", items: {} } }
                    }
                }
            },
            "calc1": {
                name: "Calc1",
                friendlyName: "Calc1",
                isAggregable: "true",
            },
            "calc2": {
                name: "Calc2",
                friendlyName: "Calc2",
                isAggregable: "true",
            },
            "calc3": {
                name: "Calc3",
                friendlyName: "Calc3",
                isAggregable: "true",
            }
        };

        it("then variable for completion only contains aggregable datasets and fields", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariableForAggregatePath("Dim s = Sum(", container);
            expect(variables[0].name === "Providers").toBeFalsy();
            expect(variables[0].name === "Datasets").toBeTruthy();
            expect(variables[0].items.ds1).toBeTruthy();
            expect(variables[0].items.ds1.items.f1).toBeTruthy();
            expect(variables[0].items.ds1.items.f2).toBeFalsy();
            expect(variables[0].items.ds1.items.f3).toBeTruthy();
            expect(variables[0].items.ds2).toBeFalsy();
            expect(variables[1].name === "Calc1").toBeTruthy();
            expect(variables[2].name === "Calc2").toBeTruthy();
            expect(variables[3].name === "Calc3").toBeTruthy();
        });
    });

    describe("when Avg has been typed ", function () {
        var container = {
            "providers": {
                name: "Providers",
                friendlyName: "Providers",
                isAggregable: "false",
                type: "",
                items: {
                    urn: {
                        name: "URN", friendlyName: "URN", items: {}, type: "", isAggregable: "false"
                    }
                }
            },
            "datasets": {
                name: "Datasets",
                friendlyName: "Datasets",
                isAggregable: "false",
                type: "",
                items: {
                    ds1: {
                        name: "ds1", isAggregable: "false", friendlyName: "", type: "", items: {
                            f1: { name: "f1", isAggregable: "true", friendlyName: "", type: "", items: {} }, f2: { name: "f2", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f3", isAggregable: "true", friendlyName: "", type: "", items: {} }
                        }
                    },
                    ds2: {
                        name: "ds2", isAggregable: "false", friendlyName: "", type: "", items: { f11: { name: "f11", isAggregable: "false", friendlyName: "", type: "", items: {} }, f2: { name: "f22", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f33", isAggregable: "false", friendlyName: "", type: "", items: {} } }
                    }
                }
            },
            "calc1": {
                name: "Calc1",
                friendlyName: "Calc1",
                isAggregable: "true",
            },
            "calc2": {
                name: "Calc2",
                friendlyName: "Calc2",
                isAggregable: "true",
            },
            "calc3": {
                name: "Calc3",
                friendlyName: "Calc3",
                isAggregable: "true",
            }
        };
        it("then variable for completion only contains aggregable datasets and fields", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariableForAggregatePath("Dim s = Avg(", container);
            expect(variables[0].name === "Providers").toBeFalsy();
            expect(variables[0].name === "Datasets").toBeTruthy();
            expect(variables[0].items.ds1).toBeTruthy();
            expect(variables[0].items.ds1.items.f1).toBeTruthy();
            expect(variables[0].items.ds1.items.f2).toBeFalsy();
            expect(variables[0].items.ds1.items.f3).toBeTruthy();
            expect(variables[0].items.ds2).toBeFalsy();
            expect(variables[1].name === "Calc1").toBeTruthy();
            expect(variables[2].name === "Calc2").toBeTruthy();
            expect(variables[3].name === "Calc3").toBeTruthy();
        });
    });
    describe("when Min has been typed ", function () {
        var container = {
            "providers": {
                name: "Providers",
                friendlyName: "Providers",
                isAggregable: "false",
                type: "",
                items: {
                    urn: {
                        name: "URN", friendlyName: "URN", items: {}, type: "", isAggregable: "false"
                    }
                }
            },
            "datasets": {
                name: "Datasets",
                friendlyName: "Datasets",
                isAggregable: "false",
                type: "",
                items: {
                    ds1: {
                        name: "ds1", isAggregable: "false", friendlyName: "", type: "", items: {
                            f1: { name: "f1", isAggregable: "true", friendlyName: "", type: "", items: {} }, f2: { name: "f2", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f3", isAggregable: "true", friendlyName: "", type: "", items: {} }
                        }
                    },
                    ds2: {
                        name: "ds2", isAggregable: "false", friendlyName: "", type: "", items: { f11: { name: "f11", isAggregable: "false", friendlyName: "", type: "", items: {} }, f2: { name: "f22", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f33", isAggregable: "false", friendlyName: "", type: "", items: {} } }
                    }
                }
            },
            "calc1": {
                name: "Calc1",
                friendlyName: "Calc1",
                isAggregable: "true",
            },
            "calc2": {
                name: "Calc2",
                friendlyName: "Calc2",
                isAggregable: "true",
            },
            "calc3": {
                name: "Calc3",
                friendlyName: "Calc3",
                isAggregable: "true",
            }
        };
        it("then variable for completion only contains aggregable datasets and fields", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariableForAggregatePath("Dim s = Min(", container);
            expect(variables[0].name === "Providers").toBeFalsy();
            expect(variables[0].name === "Datasets").toBeTruthy();
            expect(variables[0].items.ds1).toBeTruthy();
            expect(variables[0].items.ds1.items.f1).toBeTruthy();
            expect(variables[0].items.ds1.items.f2).toBeFalsy();
            expect(variables[0].items.ds1.items.f3).toBeTruthy();
            expect(variables[0].items.ds2).toBeFalsy();
            expect(variables[1].name === "Calc1").toBeTruthy();
            expect(variables[2].name === "Calc2").toBeTruthy();
            expect(variables[3].name === "Calc3").toBeTruthy();
        });
    });
    describe("when Max has been typed ", function () {
        var container = {
            "providers": {
                name: "Providers",
                friendlyName: "Providers",
                isAggregable: "false",
                type: "",
                items: {
                    urn: {
                        name: "URN", friendlyName: "URN", items: {}, type: "", isAggregable: "false"
                    }
                }
            },
            "datasets": {
                name: "Datasets",
                friendlyName: "Datasets",
                isAggregable: "false",
                type: "",
                items: {
                    ds1: {
                        name: "ds1", isAggregable: "false", friendlyName: "", type: "", items: {
                            f1: { name: "f1", isAggregable: "true", friendlyName: "", type: "", items: {} }, f2: { name: "f2", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f3", isAggregable: "true", friendlyName: "", type: "", items: {} }
                        }
                    },
                    ds2: {
                        name: "ds2", isAggregable: "false", friendlyName: "", type: "", items: { f11: { name: "f11", isAggregable: "false", friendlyName: "", type: "", items: {} }, f2: { name: "f22", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f33", isAggregable: "false", friendlyName: "", type: "", items: {} } }
                    }
                }
            },
            "calc1": {
                name: "Calc1",
                friendlyName: "Calc1",
                isAggregable: "true",
            },
            "calc2": {
                name: "Calc2",
                friendlyName: "Calc2",
                isAggregable: "true",
            },
            "calc3": {
                name: "Calc3",
                friendlyName: "Calc3",
                isAggregable: "true",
            }

        };
        it("then variable for completion only contains aggregable datasets and fields", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariableForAggregatePath("Dim s = Max(", container);
            expect(variables[0].name === "Providers").toBeFalsy();
            expect(variables[0].name === "Datasets").toBeTruthy();
            expect(variables[0].items.ds1).toBeTruthy();
            expect(variables[0].items.ds1.items.f1).toBeTruthy();
            expect(variables[0].items.ds1.items.f2).toBeFalsy();
            expect(variables[0].items.ds1.items.f3).toBeTruthy();
            expect(variables[0].items.ds2).toBeFalsy();
            expect(variables[1].name === "Calc1").toBeTruthy();
            expect(variables[2].name === "Calc2").toBeTruthy();
            expect(variables[3].name === "Calc3").toBeTruthy();
        });
    });
    describe("when dataset (ds1) is selected ", function () {
        var container = {
            "providers": {
                name: "Providers",
                friendlyName: "Providers",
                isAggregable: "false",
                type: "",
                items: {
                    urn: {
                        name: "URN", friendlyName: "URN", items: {}, type: "", isAggregable: "false"
                    }
                }
            },
            "datasets": {
                name: "Datasets",
                friendlyName: "Datasets",
                isAggregable: "false",
                type: "",
                items: {
                    ds1: {
                        name: "ds1", isAggregable: "false", friendlyName: "", type: "", items: {
                            f1: { name: "f1", isAggregable: "true", friendlyName: "", type: "", items: {} }, f2: { name: "f2", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f3", isAggregable: "true", friendlyName: "", type: "", items: {} }
                        }
                    },
                    ds2: {
                        name: "ds2", isAggregable: "false", friendlyName: "", type: "", items: { f11: { name: "f11", isAggregable: "false", friendlyName: "", type: "", items: {} }, f2: { name: "f22", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f33", isAggregable: "false", friendlyName: "", type: "", items: {} } }
                    }
                }
            }
        };
        it("then all fields are returned", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariablesForPath("Datasets.ds1", container);
            console.log(variables);
            expect(variables.length === 3).toBeTruthy();
            expect(variables[0].name === "f1").toBeTruthy();
            expect(variables[1].name === "f2").toBeTruthy();
            expect(variables[2].name === "f3").toBeTruthy();
        });
    });
    describe("when dataset (ds2) is selected ", function () {
        var container = {
            "providers": {
                name: "Providers",
                friendlyName: "Providers",
                isAggregable: "false",
                type: "",
                items: {
                    urn: {
                        name: "URN", friendlyName: "URN", items: {}, type: "", isAggregable: "false" }
                }
            },
            "datasets": {
                name: "Datasets",
                friendlyName: "Datasets",
                isAggregable: "false",
                type: "",
                items: {
                    ds1: {
                        name: "ds1", isAggregable: "false", friendlyName: "", type: "", items: {
                            f1: { name: "f1", isAggregable: "true", friendlyName: "", type: "", items: {} }, f2: { name: "f2", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f3", isAggregable: "true", friendlyName: "", type: "", items: {} }
                        }
                    },
                    ds2: {
                        name: "ds2", isAggregable: "false", friendlyName: "", type: "", items: { f11: { name: "f11", isAggregable: "false", friendlyName: "", type: "", items: {} }, f2: { name: "f22", isAggregable: "false", friendlyName: "", type: "", items: {} }, f3: { name: "f33", isAggregable: "false", friendlyName: "", type: "", items: {} } }
                    }
                }
            }
        };
        it("then all fields are returned", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariablesForPath("Datasets.ds2", container);
            console.log(variables);
            expect(variables.length === 3).toBeTruthy();
            expect(variables[0].name === "f11").toBeTruthy();
            expect(variables[1].name === "f22").toBeTruthy();
            expect(variables[2].name === "f33").toBeTruthy();
        });
    });

    describe("when (as) is not specified ", function () {
        var container = {
            "string": { label: "String", items: {} },
            "boolean": { label: "Boolean", items: {} },
            "integer": { label: "Integer", items: {}  },
        };
        it("then returns empty completion item", function () {
            var items = calculateFunding.providers.VisualBasicIntellisenseProvider.GetDefaultDataTypesCompletionItems("Dim s ", container);
            expect(items).toEqual([]);
        });
    });

    describe("when (as) is specified ", function () {
        var container = {
            "string": { label: "String", items: {} },
            "boolean": { label: "Boolean", items: {} },
            "integer": { label: "Integer", items: {} },
        };
        it("then returns completion item", function () {
            var items = calculateFunding.providers.VisualBasicIntellisenseProvider.GetDefaultDataTypesCompletionItems("Dim s as ", container);
            expect(items.length).toEqual(3);
        });
    });

    describe("when line is not empty ", function () {
        var container = {
            "if": { label: "If" },
            "elseif": { label: "ElseIf" },
            "endif": { label: "EndIf" },
            "then": { label: "Then" },
            "if-then": { label: "If-Then" },
            "if-then-else": { label: "If-Then-Else" },
            "if-then-elseif-else": { label: "If-Then-ElseIf-Then" }
        };
        it("then it does not display if statements in completion items", function () {
            var items = calculateFunding.providers.VisualBasicIntellisenseProvider.GetKeywordsCompletionItems("Dim s =", container);
            expect(items.length).toEqual(0);
        });
    });

    describe("when line is empty ", function () {
        var container = {
            "if": { label: "If" },
            "elseif": { label: "ElseIf" },
            "endif": { label: "EndIf" },
            "then": { label: "Then" },
            "if-then": { label: "If-Then" },
            "if-then-else": { label: "If-Then-Else" },
            "if-then-elseif-else": { label: "If-Then-ElseIf-Then" }
        };
        it("then it does display if statements in completion items", function () {
            var items = calculateFunding.providers.VisualBasicIntellisenseProvider.GetKeywordsCompletionItems("  ", container);
            expect(items.length).toEqual(7);
        });
       it("then if-then inserts correct text", function () {
            var items = calculateFunding.providers.VisualBasicIntellisenseProvider.GetKeywordsCompletionItems("  ", container);
            expect(items[4].insertText === "If <condition> Then\n\r\n\rEnd If").toBeTruthy();
        });
        it("then if-then-else inserts correct text", function () {
            var items = calculateFunding.providers.VisualBasicIntellisenseProvider.GetKeywordsCompletionItems("  ", container);
            expect(items[5].insertText === "If <condition> Then\n\r\n\rElse\n\r\n\rEnd If").toBeTruthy();
        });
        it("then if-then-else inserts correct text", function () {
            var items = calculateFunding.providers.VisualBasicIntellisenseProvider.GetKeywordsCompletionItems("  ", container);
            expect(items[6].insertText === "If <condition> Then\n\r\n\rElseIf <condition> Then\n\r\n\rElse\n\r\n\rEnd If").toBeTruthy();
        });
    });
});