// @ts-nocheck
import {
  checkAggregableFunctionDeclared,
  findDeclaredVariables,
  findEnumItems,
  getDefaultDataTypesCompletionItems,
  getKeywordsCompletionItems,
  getObsoleteDefaultTypes,
  getObsoleteFunctions,
  getObsoleteVariables,
  getVariableForAggregatePath,
  getVariablesForPath,
} from "../../../services/IntellisenseProvider";
import { IDefaultTypeContainer } from "../../../types/GdsMonacoEditor/IDefaultTypeContainer";
import { ILocalFunctionContainer } from "../../../types/GdsMonacoEditor/ILocalFunctionContainer";
import { IVariableContainer } from "../../../types/GdsMonacoEditor/IVariableContainer";
import { CreateInformationTestData } from "./IntellisenseTestData";

require("../../../services/IntellisenseProvider");

describe("IntellisenseProvider service ", () => {
  it("should return Correct Enum Items", () => {
    const data = CreateInformationTestData();
    const actual = findEnumItems("Scenario", data);

    expect(actual?.name == "Scenario").toBeTruthy();
  });
});

describe("IntellisenseProvider - FindDeclaredVariables", () => {
  describe("when no variables are declared", () => {
    it("with empty string then no declared variables declared", () => {
      const variables = findDeclaredVariables("");
      expect(variables).toEqual([]);
    });
    it("with string not containing any variables", () => {
      const variables = findDeclaredVariables("No variables here");
      expect(variables).toEqual([]);
    });
    it("with lowercase dim then no variables declared", () => {
      const variables = findDeclaredVariables("dim s");
      expect(variables).toEqual([]);
    });
  });
  describe("when a single variable is declared without type", () => {
    it("then variable at the beginning of a string is found", () => {
      const variables = findDeclaredVariables("Dim s");
      expect(variables).toEqual(["s"]);
    });
    it("then variable at the beginning of second line is found", () => {
      const variables = findDeclaredVariables("Test = 1\r\nDim s");
      expect(variables).toEqual(["s"]);
    });
    it("then variable is found with preceeding spaces", () => {
      const variables = findDeclaredVariables("    Dim s");
      expect(variables).toEqual(["s"]);
    });
    it("then variable is found with preceeding tab", () => {
      const variables = findDeclaredVariables("\tDim s");
      expect(variables).toEqual(["s"]);
    });
  });

  describe("when a single variable is declared with type", () => {
    it("then variable at the beginning of a string is found", () => {
      const variables = findDeclaredVariables("Dim s as String");
      expect(variables).toEqual(["s"]);
    });
    it("then variable at the beginning of second line is found", () => {
      const variables = findDeclaredVariables("Test = 1\r\nDim s as String");
      expect(variables).toEqual(["s"]);
    });
    it("then variable is found with preceeding spaces", () => {
      const variables = findDeclaredVariables("    Dim s as String");
      expect(variables).toEqual(["s"]);
    });
    it("then variable is found with preceeding tab", () => {
      const variables = findDeclaredVariables("\tDim s as String");
      expect(variables).toEqual(["s"]);
    });
  });
  describe("when a multi variable string is declared with two variables", () => {
    it("then variable at the beginning of a string is found", () => {
      const variables = findDeclaredVariables("Dim s, s2");
      expect(variables).toEqual(["s", "s2"]);
    });
    it("then variable at the beginning of second line is found", () => {
      const variables = findDeclaredVariables("Test = 1\r\nDim s, s2");
      expect(variables).toEqual(["s", "s2"]);
    });
    it("then variable is found with preceeding spaces", () => {
      const variables = findDeclaredVariables("    Dim s, s2");
      expect(variables).toEqual(["s", "s2"]);
    });
    it("then variable is found with preceeding tab", () => {
      const variables = findDeclaredVariables("\tDim s, s2");
      expect(variables).toEqual(["s", "s2"]);
    });
  });
  describe("when a multi variable string is declared with two variables and no spaces", () => {
    it("then variable at the beginning of a string is found", () => {
      const variables = findDeclaredVariables("Dim s,s2");
      expect(variables).toEqual(["s", "s2"]);
    });
    it("then variable at the beginning of second line is found", () => {
      const variables = findDeclaredVariables("Test = 1\r\nDim s,s2");
      expect(variables).toEqual(["s", "s2"]);
    });
    it("then variable is found with preceeding spaces", () => {
      const variables = findDeclaredVariables("    Dim s,s2");
      expect(variables).toEqual(["s", "s2"]);
    });
    it("then variable is found with preceeding tab", () => {
      const variables = findDeclaredVariables("\tDim s,s2");
      expect(variables).toEqual(["s", "s2"]);
    });
  });
  describe("when using ReDim", () => {
    it("then no match is found", () => {
      const variables = findDeclaredVariables("ReDim s");
      expect(variables).toEqual([]);
    });
  });
  describe("when using Sum", () => {
    it("then IsAggregableFunctionDeclared is true", () => {
      const result = checkAggregableFunctionDeclared("Dim a = Sum(");

      expect(result).toEqual(true);
    });
  });
  describe("when using Avg", () => {
    it("then IsAggregableFunctionDeclared is true", () => {
      const result = checkAggregableFunctionDeclared("Dim a = Avg(");

      expect(result).toEqual(true);
    });
  });
  describe("when using Min", () => {
    it("then IsAggregableFunctionDeclared is true", () => {
      const result = checkAggregableFunctionDeclared("Dim a = Min(");

      expect(result).toEqual(true);
    });
  });
  describe("when using Max", () => {
    it("then IsAggregableFunctionDeclared is true", () => {
      const result = checkAggregableFunctionDeclared("Dim a = Max(");

      expect(result).toEqual(true);
    });
  });
  describe("when Sum has been typed ", () => {
    const container: IVariableContainer = {
      providers: {
        name: "Providers",
        friendlyName: "Providers",
        type: "",
        isAggregable: false,
        items: {
          urn: {
            name: "URN",
            friendlyName: "URN",
            items: {},
            type: "",
            isAggregable: false,
          },
        },
      },
      datasets: {
        name: "Datasets",
        friendlyName: "Datasets",
        isAggregable: false,
        type: "",
        items: {
          ds1: {
            name: "ds1",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f1: { name: "f1", isAggregable: true, friendlyName: "", type: "", items: {} },
              f2: { name: "f2", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f3", isAggregable: true, friendlyName: "", type: "", items: {} },
            },
          },
          ds2: {
            name: "ds2",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f11: { name: "f11", isAggregable: false, friendlyName: "", type: "", items: {} },
              f2: { name: "f22", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f33", isAggregable: false, friendlyName: "", type: "", items: {} },
            },
          },
        },
      },
      calc1: {
        name: "Calc1",
        friendlyName: "Calc1",
        isAggregable: true,
        type: "",
      },
      calc2: {
        name: "Calc2",
        friendlyName: "Calc2",
        isAggregable: true,
        type: "",
      },
      calc3: {
        name: "Calc3",
        friendlyName: "Calc3",
        isAggregable: true,
        type: "",
      },
    };

    it("then variable for completion only contains aggregable datasets and fields", () => {
      const variables = getVariableForAggregatePath("Dim s = Sum(", container);
      expect(variables[0].name === "Providers").toBeFalsy();
      expect(variables[0].name === "Datasets").toBeTruthy();

      if (variables !== undefined) {
        expect(variables[0]?.items && variables[0]?.items["ds1"]).toBeTruthy();
        expect(
          variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items["ds1"].items["f1"]
        ).toBeTruthy();
        expect(
          variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items["ds1"].items["f2"]
        ).toBeFalsy();
        expect(
          variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items["ds1"].items["f3"]
        ).toBeTruthy();
        expect(variables[0]?.items && variables[0].items["ds2"]).toBeFalsy();
        expect(variables[1].name === "Calc1").toBeTruthy();
        expect(variables[2].name === "Calc2").toBeTruthy();
        expect(variables[3].name === "Calc3").toBeTruthy();
      }
    });
  });

  describe("when Avg has been typed ", () => {
    const container: IVariableContainer = {
      providers: {
        name: "Providers",
        friendlyName: "Providers",
        isAggregable: false,
        type: "",
        items: {
          urn: {
            name: "URN",
            friendlyName: "URN",
            items: {},
            type: "",
            isAggregable: false,
          },
        },
      },
      datasets: {
        name: "Datasets",
        friendlyName: "Datasets",
        isAggregable: false,
        type: "",
        items: {
          ds1: {
            name: "ds1",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f1: { name: "f1", isAggregable: true, friendlyName: "", type: "", items: {} },
              f2: { name: "f2", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f3", isAggregable: true, friendlyName: "", type: "", items: {} },
            },
          },
          ds2: {
            name: "ds2",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f11: { name: "f11", isAggregable: false, friendlyName: "", type: "", items: {} },
              f2: { name: "f22", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f33", isAggregable: false, friendlyName: "", type: "", items: {} },
            },
          },
        },
      },
      calc1: {
        name: "Calc1",
        friendlyName: "Calc1",
        isAggregable: true,
        type: "",
      },
      calc2: {
        name: "Calc2",
        friendlyName: "Calc2",
        isAggregable: true,
        type: "",
      },
      calc3: {
        name: "Calc3",
        friendlyName: "Calc3",
        isAggregable: true,
        type: "",
      },
    };
    it("then variable for completion only contains aggregable datasets and fields", () => {
      const variables = getVariableForAggregatePath("Dim s = Avg(", container);
      expect(variables[0].name === "Providers").toBeFalsy();
      expect(variables[0].name === "Datasets").toBeTruthy();
      expect(variables[0]?.items && variables[0].items.ds1).toBeTruthy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f1
      ).toBeTruthy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f2
      ).toBeFalsy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f3
      ).toBeTruthy();
      expect(variables[0]?.items?.ds2).toBeFalsy();
      expect(variables[1].name === "Calc1").toBeTruthy();
      expect(variables[2].name === "Calc2").toBeTruthy();
      expect(variables[3].name === "Calc3").toBeTruthy();
    });
  });
  describe("when Min has been typed ", () => {
    const container: IVariableContainer = {
      providers: {
        name: "Providers",
        friendlyName: "Providers",
        isAggregable: false,
        type: "",
        items: {
          urn: {
            name: "URN",
            friendlyName: "URN",
            items: {},
            type: "",
            isAggregable: false,
          },
        },
      },
      datasets: {
        name: "Datasets",
        friendlyName: "Datasets",
        isAggregable: false,
        type: "",
        items: {
          ds1: {
            name: "ds1",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f1: { name: "f1", isAggregable: true, friendlyName: "", type: "", items: {} },
              f2: { name: "f2", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f3", isAggregable: true, friendlyName: "", type: "", items: {} },
            },
          },
          ds2: {
            name: "ds2",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f11: { name: "f11", isAggregable: false, friendlyName: "", type: "", items: {} },
              f2: { name: "f22", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f33", isAggregable: false, friendlyName: "", type: "", items: {} },
            },
          },
        },
      },
      calc1: {
        name: "Calc1",
        friendlyName: "Calc1",
        isAggregable: true,
        type: "",
      },
      calc2: {
        name: "Calc2",
        friendlyName: "Calc2",
        isAggregable: true,
        type: "",
      },
      calc3: {
        name: "Calc3",
        friendlyName: "Calc3",
        isAggregable: true,
        type: "",
      },
    };
    it("then variable for completion only contains aggregable datasets and fields", () => {
      const variables = getVariableForAggregatePath("Dim s = Min(", container);
      expect(variables[0].name === "Providers").toBeFalsy();
      expect(variables[0].name === "Datasets").toBeTruthy();
      expect(variables[0]?.items && variables[0].items.ds1).toBeTruthy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f1
      ).toBeTruthy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f2
      ).toBeFalsy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f3
      ).toBeTruthy();
      expect(variables[0]?.items?.ds2).toBeFalsy();
      expect(variables[1].name === "Calc1").toBeTruthy();
      expect(variables[2].name === "Calc2").toBeTruthy();
      expect(variables[3].name === "Calc3").toBeTruthy();
    });
  });
  describe("when Max has been typed ", () => {
    const container: IVariableContainer = {
      providers: {
        name: "Providers",
        friendlyName: "Providers",
        isAggregable: false,
        type: "",
        items: {
          urn: {
            name: "URN",
            friendlyName: "URN",
            items: {},
            type: "",
            isAggregable: false,
          },
        },
      },
      datasets: {
        name: "Datasets",
        friendlyName: "Datasets",
        isAggregable: false,
        type: "",
        items: {
          ds1: {
            name: "ds1",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f1: { name: "f1", isAggregable: true, friendlyName: "", type: "", items: {} },
              f2: { name: "f2", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f3", isAggregable: true, friendlyName: "", type: "", items: {} },
            },
          },
          ds2: {
            name: "ds2",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f11: { name: "f11", isAggregable: false, friendlyName: "", type: "", items: {} },
              f2: { name: "f22", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f33", isAggregable: false, friendlyName: "", type: "", items: {} },
            },
          },
        },
      },
      calc1: {
        name: "Calc1",
        friendlyName: "Calc1",
        isAggregable: true,
        type: "",
      },
      calc2: {
        name: "Calc2",
        friendlyName: "Calc2",
        isAggregable: true,
        type: "",
      },
      calc3: {
        name: "Calc3",
        friendlyName: "Calc3",
        isAggregable: true,
        type: "",
      },
    };
    it("then variable for completion only contains aggregable datasets and fields", () => {
      const variables = getVariableForAggregatePath("Dim s = Max(", container);
      expect(variables[0].name === "Providers").toBeFalsy();
      expect(variables[0].name === "Datasets").toBeTruthy();
      expect(variables[0]?.items && variables[0].items.ds1).toBeTruthy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f1
      ).toBeTruthy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f2
      ).toBeFalsy();
      expect(
        variables[0]?.items && variables[0]?.items["ds1"]?.items && variables[0].items.ds1.items.f3
      ).toBeTruthy();
      expect(variables[0]?.items?.ds2).toBeFalsy();
      expect(variables[1].name === "Calc1").toBeTruthy();
      expect(variables[2].name === "Calc2").toBeTruthy();
      expect(variables[3].name === "Calc3").toBeTruthy();
    });
  });
  describe("when dataset (ds1) is selected ", () => {
    const container: IVariableContainer = {
      providers: {
        name: "Providers",
        friendlyName: "Providers",
        isAggregable: false,
        type: "",
        items: {
          urn: {
            name: "URN",
            friendlyName: "URN",
            items: {},
            type: "",
            isAggregable: false,
          },
        },
      },
      datasets: {
        name: "Datasets",
        friendlyName: "Datasets",
        isAggregable: false,
        type: "",
        items: {
          ds1: {
            name: "ds1",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f1: { name: "f1", isAggregable: true, friendlyName: "", type: "", items: {} },
              f2: { name: "f2", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f3", isAggregable: true, friendlyName: "", type: "", items: {} },
            },
          },
          ds2: {
            name: "ds2",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f11: { name: "f11", isAggregable: false, friendlyName: "", type: "", items: {} },
              f2: { name: "f22", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f33", isAggregable: false, friendlyName: "", type: "", items: {} },
            },
          },
        },
      },
    };
    it("then all fields are returned", () => {
      const variables = getVariablesForPath("Datasets.ds1", container);
      expect(variables.length === 3).toBeTruthy();
      expect(variables[0].name === "f1").toBeTruthy();
      expect(variables[1].name === "f2").toBeTruthy();
      expect(variables[2].name === "f3").toBeTruthy();
    });
  });
  describe("when dataset (ds2) is selected ", () => {
    const container = {
      providers: {
        name: "Providers",
        friendlyName: "Providers",
        isAggregable: false,
        type: "",
        items: {
          urn: {
            name: "URN",
            friendlyName: "URN",
            items: {},
            type: "",
            isAggregable: false,
          },
        },
      },
      datasets: {
        name: "Datasets",
        friendlyName: "Datasets",
        isAggregable: false,
        type: "",
        items: {
          ds1: {
            name: "ds1",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f1: { name: "f1", isAggregable: true, friendlyName: "", type: "", items: {} },
              f2: { name: "f2", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f3", isAggregable: true, friendlyName: "", type: "", items: {} },
            },
          },
          ds2: {
            name: "ds2",
            isAggregable: false,
            friendlyName: "",
            type: "",
            items: {
              f11: { name: "f11", isAggregable: false, friendlyName: "", type: "", items: {} },
              f2: { name: "f22", isAggregable: false, friendlyName: "", type: "", items: {} },
              f3: { name: "f33", isAggregable: false, friendlyName: "", type: "", items: {} },
            },
          },
        },
      },
    };
    it("then all fields are returned", () => {
      const variables = getVariablesForPath("Datasets.ds2", container);
      expect(variables.length === 3).toBeTruthy();
      expect(variables[0].name === "f11").toBeTruthy();
      expect(variables[1].name === "f22").toBeTruthy();
      expect(variables[2].name === "f33").toBeTruthy();
    });
  });

  describe("when (as) is not specified ", () => {
    const range = {
      startLineNumber: 0,
      endLineNumber: 10,
      startColumn: 0,
      endColumn: 0,
    };

    const container = {
      string: { label: "String", items: {} },
      boolean: { label: "Boolean", items: {} },
      integer: { label: "Integer", items: {} },
    };
    it("then returns empty completion item", () => {
      const items = getDefaultDataTypesCompletionItems("Dim s ", container, range);
      expect(items).toEqual([]);
    });
  });

  describe("when line is not empty ", () => {
    const range = {
      startLineNumber: 0,
      endLineNumber: 10,
      startColumn: 0,
      endColumn: 0,
    };

    const container = {
      if: { label: "If" },
      elseif: { label: "ElseIf" },
      endif: { label: "EndIf" },
      then: { label: "Then" },
      "if-then": { label: "If-Then" },
      "if-then-else": { label: "If-Then-Else" },
      "if-then-elseif-else": { label: "If-Then-ElseIf-Then" },
    };
    it("then it does not display if statements in completion items", () => {
      const items = getKeywordsCompletionItems("Dim s =", container, range);
      expect(items.length).toEqual(0);
    });
  });

  describe("check for obsolete default types ", () => {
    it("and return correct count", () => {
      const defaultContainer: IDefaultTypeContainer = {};

      defaultContainer["first"] = {
        description: "First default type",
        label: "First default type",
        items: {},
        isObsolete: true,
      };

      defaultContainer["second"] = {
        description: "Second default type",
        label: "Second default type",
        items: {},
        isObsolete: false,
      };

      const actual = getObsoleteDefaultTypes(defaultContainer);

      expect(actual.length).toBe(1);
    });

    it("and return correct count", () => {
      const defaultContainer: IDefaultTypeContainer = {};

      defaultContainer["first"] = {
        description: "First default type",
        label: "First default type",
        items: {},
        isObsolete: false,
      };

      defaultContainer["second"] = {
        description: "Second default type",
        label: "Second default type",
        items: {},
        isObsolete: false,
      };

      const actual = getObsoleteDefaultTypes(defaultContainer);

      expect(actual.length).toBe(0);
    });
  });

  describe("check for obsolete functions ", () => {
    it("and return correct count for one function", () => {
      const functionContainer: ILocalFunctionContainer = {};

      functionContainer["firstFunction"] = {
        returnType: "",
        getFunctionAndParameterDescription(): string {
          return "";
        },
        description: "first function",
        friendlyName: "first function",
        isObsolete: true,
        label: "first function",
        isCustom: false,
        parameters: [],
      };
      functionContainer["secondFunction"] = {
        returnType: "",
        getFunctionAndParameterDescription(): string {
          return "";
        },
        description: "second function",
        friendlyName: "second function",
        isObsolete: false,
        label: "second function",
        isCustom: false,
        parameters: [],
      };

      const actual = getObsoleteFunctions(functionContainer);

      expect(actual.length).toBe(1);
    });
    it("and return correct count for no matching functions", () => {
      const functionContainer: ILocalFunctionContainer = {};

      functionContainer["firstFunction"] = {
        returnType: "",
        getFunctionAndParameterDescription(): string {
          return "";
        },
        description: "first function",
        friendlyName: "first function",
        isObsolete: false,
        label: "first function",
        isCustom: false,
        parameters: [],
      };
      functionContainer["secondFunction"] = {
        returnType: "",
        getFunctionAndParameterDescription(): string {
          return "";
        },
        description: "second function",
        friendlyName: "second function",
        isObsolete: false,
        label: "second function",
        isCustom: false,
        parameters: [],
      };

      const actual = getObsoleteFunctions(functionContainer);

      expect(actual.length).toBe(0);
    });
  });

  describe("check for obsolete variables ", () => {
    it("should return 0 when no variables are passed", () => {
      const variableContainer: IVariableContainer = {};

      const actual = getObsoleteVariables(variableContainer);

      expect(actual.length).toBe(0);
    });

    it("should return 1 obsolete variable", () => {
      const variableContainer: IVariableContainer = {};
      variableContainer["firstVariable"] = {
        friendlyName: "",
        isAggregable: false,
        isObsolete: true,
        variableType: undefined,
        name: "first variable",
        type: "variable",
      };
      const actual = getObsoleteVariables(variableContainer);

      expect(actual.length).toBe(1);
    });
  });
});
