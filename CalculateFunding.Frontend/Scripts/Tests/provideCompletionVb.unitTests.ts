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
                items: {
                    urn: { name: "URN" }
                }
            },
            "datasets": {
                name: "Datasets",
                items: {
                    ds1: {
                        name: "ds1", items: { f1: { name: "f1", isAggregable: "true" }, f2: { name: "f2", isAggregable: "false" }, f3: { name: "f3", isAggregable: "true" } }
                    },
                    ds2: {
                        name: "ds2", items: { f11: { name: "f11", isAggregable: "false" }, f2: { name: "f22", isAggregable: "false" }, f3: { name: "f33", isAggregable: "false" } }
                    }
                }
            }
        };
        it("then variable for completion only contains aggregable datasets and fields", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariableForAggregatePath("Dim s = Sum(", container);
            expect(variables.name === "Providers").toBeFalsy();
            expect(variables.name === "Datasets").toBeTruthy();
            expect(variables.items.ds1).toBeTruthy();
            expect(variables.items.ds1.items.f1).toBeTruthy();
            expect(variables.items.ds1.items.f2).toBeFalsy();
            expect(variables.items.ds1.items.f3).toBeTruthy();
            expect(variables.items.ds2).toBeFalsy();
        });
    });

    describe("when Avg has been typed ", function () {
        var container = {
            "providers": {
                name: "Providers",
                items: {
                    urn: { name: "URN" }
                }
            },
            "datasets": {
                name: "Datasets",
                items: {
                    ds1: {
                        name: "ds1", items: { f1: { name: "f1", isAggregable: "true" }, f2: { name: "f2", isAggregable: "false" }, f3: { name: "f3", isAggregable: "true" } }
                    },
                    ds2: {
                        name: "ds2", items: { f11: { name: "f11", isAggregable: "false" }, f2: { name: "f22", isAggregable: "false" }, f3: { name: "f33", isAggregable: "false" } }
                    }
                }
            }
        };
        it("then variable for completion only contains aggregable datasets and fields", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariableForAggregatePath("Dim s = Avg(", container);
            expect(variables.name === "Providers").toBeFalsy();
            expect(variables.name === "Datasets").toBeTruthy();
            expect(variables.items.ds1).toBeTruthy();
            expect(variables.items.ds1.items.f1).toBeTruthy();
            expect(variables.items.ds1.items.f2).toBeFalsy();
            expect(variables.items.ds1.items.f3).toBeTruthy();
            expect(variables.items.ds2).toBeFalsy();
        });
    });
    describe("when Min has been typed ", function () {
        var container = {
            "providers": {
                name: "Providers",
                items: {
                    urn: { name: "URN" }
                }
            },
            "datasets": {
                name: "Datasets",
                items: {
                    ds1: {
                        name: "ds1", items: { f1: { name: "f1", isAggregable: "true" }, f2: { name: "f2", isAggregable: "false" }, f3: { name: "f3", isAggregable: "true" } }
                    },
                    ds2: {
                        name: "ds2", items: { f11: { name: "f11", isAggregable: "false" }, f2: { name: "f22", isAggregable: "false" }, f3: { name: "f33", isAggregable: "false" } }
                    }
                }
            }
        };
        it("then variable for completion only contains aggregable datasets and fields", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariableForAggregatePath("Dim s = Min(", container);
            expect(variables.name === "Providers").toBeFalsy();
            expect(variables.name === "Datasets").toBeTruthy();
            expect(variables.items.ds1).toBeTruthy();
            expect(variables.items.ds1.items.f1).toBeTruthy();
            expect(variables.items.ds1.items.f2).toBeFalsy();
            expect(variables.items.ds1.items.f3).toBeTruthy();
            expect(variables.items.ds2).toBeFalsy();
        });
    });
    describe("when Max has been typed ", function () {
        var container = {
            "providers": {
                name: "Providers",
                items: {
                    urn: { name: "URN" }
                }
            },
            "datasets": {
                name: "Datasets",
                items: {
                    ds1: {
                        name: "ds1", items: { f1: { name: "f1", isAggregable: "true" }, f2: { name: "f2", isAggregable: "false" }, f3: { name: "f3", isAggregable: "true" } }
                    },
                    ds2: {
                        name: "ds2", items: { f11: { name: "f11", isAggregable: "false" }, f2: { name: "f22", isAggregable: "false" }, f3: { name: "f33", isAggregable: "false" } }
                    }
                }
            }
        };
        it("then variable for completion only contains aggregable datasets and fields", function () {
            var variables = calculateFunding.providers.VisualBasicIntellisenseProvider.GetVariableForAggregatePath("Dim s = Max(", container);
            expect(variables.name === "Providers").toBeFalsy();
            expect(variables.name === "Datasets").toBeTruthy();
            expect(variables.items.ds1).toBeTruthy();
            expect(variables.items.ds1.items.f1).toBeTruthy();
            expect(variables.items.ds1.items.f2).toBeFalsy();
            expect(variables.items.ds1.items.f3).toBeTruthy();
            expect(variables.items.ds2).toBeFalsy();
        });
    });
    describe("when dataset (ds1) is selected ", function () {
        var container = {
            "providers": {
                name: "Providers",
                items: {
                    urn: { name: "URN" }
                }
            },
            "datasets": {
                name: "Datasets",
                items: {
                    ds1: {
                        name: "ds1", items: { f1: { name: "f1", isAggregable: "true" }, f2: { name: "f2", isAggregable: "false" }, f3: { name: "f3", isAggregable: "true" } }
                    },
                    ds2: {
                        name: "ds2", items: { f11: { name: "f11", isAggregable: "false" }, f2: { name: "f22", isAggregable: "false" }, f3: { name: "f33", isAggregable: "false" } }
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
                items: {
                    urn: { name: "URN" }
                }
            },
            "datasets": {
                name: "Datasets",
                items: {
                    ds1: {
                        name: "ds1", items: { f1: { name: "f1", isAggregable: "true" }, f2: { name: "f2", isAggregable: "false" }, f3: { name: "f3", isAggregable: "true" } }
                    },
                    ds2: {
                        name: "ds2", items: { f11: { name: "f11", isAggregable: "false" }, f2: { name: "f22", isAggregable: "false" }, f3: { name: "f33", isAggregable: "false" } }
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
});