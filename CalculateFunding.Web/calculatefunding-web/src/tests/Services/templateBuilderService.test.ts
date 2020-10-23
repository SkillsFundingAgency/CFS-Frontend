import {singleNodeTemplate, singleNodeDs, withChildFundingLineTemplate, withChildFundingLineDs, withChildFundingLineAndCalculationTemplate, withChildFundingLineAndCalculationDs, multipleFundingLinesDs, multipleFundingLinesTemplate, clonedNodeDs, clonedNodeTemplate, multipleCalculationsDs, clonedFundingLinesDs, cloneWithChildrenNodeDs, clonedCalculationsAndFundingLinesNodeDs} from "./templateBuilderTestData";
import {addNode, updateNode, findAllClonedNodeIds, removeNode, moveNode, cloneNode, templateFundingLinesToDatasource, datasourceToTemplateFundingLines, getLastUsedId, getAllCalculations, getAllFundingLines, cloneCalculation, isChildOf, getAllTemplateCalculationIds, getAllTemplateLineIds, findParentId, isCloneRoot} from "../../services/templateBuilderDatasourceService";
import {FundingLineDictionaryEntry, FundingLineType, NodeType, FundingLineUpdateModel, CalculationUpdateModel, CalculationType, AggregrationType, ValueFormatType, Calculation} from "../../types/TemplateBuilderDefinitions";
import cloneDeep from 'lodash/cloneDeep';
import {v4 as uuidv4} from 'uuid';
jest.mock('uuid');

const key1RootId = "n1";
const cloneOfKey1RootId = "n1:12345";

let ds: Array<FundingLineDictionaryEntry>;
let cloneDs: Array<FundingLineDictionaryEntry>;

let incrementNextId: () => void;

beforeEach(() => {
    ds = [
        {
            key: 1,
            value: {
                id: key1RootId,
                type: FundingLineType.Information,
                kind: NodeType.FundingLine,
                fundingLineCode: "Code 1",
                name: "Test",
                templateLineId: 1
            }
        },
        {
            key: 2,
            value: {
                id: "n2",
                type: FundingLineType.Information,
                kind: NodeType.FundingLine,
                fundingLineCode: "Code 2",
                name: "Test 1",
                templateLineId: 2,
                children: [
                    {
                        id: cloneOfKey1RootId,
                        type: FundingLineType.Information,
                        kind: NodeType.FundingLine,
                        fundingLineCode: "Code 1",
                        name: "Test",
                        templateLineId: 1
                    },
                    {
                        id: "n3",
                        type: FundingLineType.Information,
                        kind: NodeType.FundingLine,
                        fundingLineCode: "Code 3",
                        name: "Test 3",
                        templateLineId: 3
                    }
                ]
            }
        }
    ];
    cloneDs = cloneDeep(cloneWithChildrenNodeDs);
    incrementNextId = jest.fn();
});

it("adds new node", async () => {
    const childFundingLine = {
        id: "n4",
        type: FundingLineType.Information,
        kind: NodeType.FundingLine,
        fundingLineCode: "Code 4",
        name: "Test 4",
        templateLineId: 4
    };

    await addNode(ds, "n3", childFundingLine, incrementNextId);

    const addedNode = ds.find(d => d.key === 2)?.value;
    if (!addedNode?.children) throw new Error('Unexpected undefined value');
    const addedNodeChildren = addedNode.children.find(c => c.id === "n3");
    if (!addedNodeChildren?.children) throw new Error('Unexpected undefined value');

    expect(addedNodeChildren.children.length).toBe(1);
    expect(incrementNextId).toBeCalledTimes(1);
});

it("updates funding line node", async () => {
    const updateModel: FundingLineUpdateModel = {
        id: key1RootId,
        type: FundingLineType.Payment,
        kind: NodeType.FundingLine,
        name: "New Name",
        templateLineId: 2,
        fundingLineCode: "1"
    };

    await updateNode(ds, updateModel);

    const updatedNode = ds.find(d => d.key === 1)?.value;

    expect(updatedNode?.name).toBe("New Name");
    expect(updatedNode?.templateLineId).toBe(2);
    expect(updatedNode?.type).toBe(FundingLineType.Payment);
});

it("updates calculation node", async () => {
    const calc: Calculation = {
        id: "n4",
        type: CalculationType.Cash,
        kind: NodeType.Calculation,
        name: "Original Name",
        templateCalculationId: 1,
        aggregationType: AggregrationType.None,
        formulaText: "",
        valueFormat: ValueFormatType.Currency
    };

    await addNode(ds, key1RootId, calc, incrementNextId);

    const updateModel: CalculationUpdateModel = {
        id: "n4",
        type: CalculationType.Cash,
        kind: NodeType.Calculation,
        name: "New Name",
        aggregationType: AggregrationType.None,
        valueFormat: ValueFormatType.Currency,
        formulaText: "",
        templateCalculationId: 2
    };

    await updateNode(ds, updateModel);

    const updatedNode = (ds.find(d => d.key === 1)?.value.children?.find(c => c.id === "n4"));
    if (!updatedNode) throw new Error('Unexpected undefined value');

    expect((updatedNode as Calculation).templateCalculationId).toBe(2);
});

it("finds all cloned nodes correctly", async () => {
    const key1FundingLine = ds.find(d => d.key === 1);
    const key2FundingLine = ds.find(d => d.key === 2);

    if (!key1FundingLine || !key2FundingLine) throw new Error('Unexpected undefined value');

    const idsInKey1 = await findAllClonedNodeIds(key1FundingLine.value, key1RootId);
    const idsInKey2 = await findAllClonedNodeIds(key2FundingLine.value, key1RootId);
    const clonedIdsInKey1 = await findAllClonedNodeIds(key1FundingLine.value, cloneOfKey1RootId);
    const clonedIdsInKey2 = await findAllClonedNodeIds(key2FundingLine.value, cloneOfKey1RootId);

    expect(idsInKey1.length).toBe(1);
    expect(idsInKey2.length).toBe(1);
    expect(clonedIdsInKey1.length).toBe(1);
    expect(clonedIdsInKey2.length).toBe(1);

    const falseMatches = ["n11", "rn1", "-n1", ":n1"]

    for (let i = 0; i < falseMatches.length; i++) {
        const falseMatch = await findAllClonedNodeIds(key1FundingLine.value, falseMatches[i]);
        expect(falseMatch.length).toBe(0);
    }
});

it("updates all cloned nodes when original is updated", async () => {
    const updateModel: FundingLineUpdateModel = {
        id: "n1",
        type: FundingLineType.Payment,
        kind: NodeType.FundingLine,
        name: "New Name",
        fundingLineCode: "1",
        templateLineId: 1
    };

    await updateNode(ds, updateModel);

    const fundingLine1 = ds.find(d => d.key === 1)?.value;
    const fundingLine2 = ds.find(d => d.key === 2)?.value;

    if (!fundingLine1 || !fundingLine2 || !fundingLine2.children) throw new Error('Unexpected undefined value');

    expect(fundingLine1.name).toBe("New Name");
    expect(fundingLine1.type).toBe(FundingLineType.Payment);
    expect(fundingLine2.children[0].name).toBe(fundingLine1.name);
    expect(fundingLine2.children[0].type).toBe(fundingLine1.type);
});

it("updates all cloned nodes when a clone is updated", async () => {
    const updateModel: FundingLineUpdateModel = {
        id: "n1:12345",
        type: FundingLineType.Payment,
        kind: NodeType.FundingLine,
        name: "New Name",
        fundingLineCode: "1",
        templateLineId: 1
    };

    await updateNode(ds, updateModel);

    const fundingLine1 = ds.find(d => d.key === 1)?.value;
    const fundingLine2 = ds.find(d => d.key === 2)?.value;

    if (!fundingLine1 || !fundingLine2 || !fundingLine2.children) throw new Error('Unexpected undefined value');

    expect(fundingLine2.children[0].name).toBe("New Name");
    expect(fundingLine2.children[0].type).toBe(FundingLineType.Payment);
    expect(fundingLine1.name).toBe(fundingLine2.children[0].name);
    expect(fundingLine1.type).toBe(fundingLine2.children[0].type);
});

it("adds a new child to all cloned nodes", async () => {
    const childFundingLine = {
        id: "n4",
        type: FundingLineType.Information,
        kind: NodeType.FundingLine,
        fundingLineCode: "Code 4",
        name: "Test 4",
        templateLineId: 4
    };

    await addNode(ds, key1RootId, childFundingLine, incrementNextId);

    const originalNodeChildren = ds.find(d => d.key === 1)?.value.children;
    const clonedNodeParent = ds.find(d => d.key === 2)?.value.children;
    const clonedNodeChildren = clonedNodeParent?.find(c => c.id === cloneOfKey1RootId)?.children;

    if (!originalNodeChildren) throw new Error("Unexpected undefined value");
    const originalNodeAddedChild = originalNodeChildren[0];

    if (!clonedNodeChildren) throw new Error("Unexpected undefined value");
    const clonedNodeClonedChild = clonedNodeChildren[0];

    expect(originalNodeChildren?.length).toBe(1);
    expect(clonedNodeChildren?.length).toBe(1);
    expect(originalNodeAddedChild.id).toBe("n4");
    expect(clonedNodeClonedChild.id).not.toBe("n4");
    expect(clonedNodeClonedChild.id).toMatch(/n4:*/);
    expect(incrementNextId).toBeCalledTimes(2);
});

it("adds a new child to all cloned nodes when new child is added to a cloned node", async () => {
    const childFundingLine = {
        id: "n4",
        type: FundingLineType.Information,
        kind: NodeType.FundingLine,
        fundingLineCode: "Code 4",
        name: "Test 4",
        templateLineId: 4
    };

    await addNode(ds, cloneOfKey1RootId, childFundingLine, incrementNextId);

    const originalNodeChildren = ds.find(d => d.key === 1)?.value.children;
    const clonedNodeParent = ds.find(d => d.key === 2)?.value.children;
    const clonedNodeChildren = clonedNodeParent?.find(c => c.id === cloneOfKey1RootId)?.children;

    if (!originalNodeChildren) throw new Error("Unexpected undefined value");
    const originalNodeAddedChild = originalNodeChildren[0];

    if (!clonedNodeChildren) throw new Error("Unexpected undefined value");
    const clonedNodeClonedChild = clonedNodeChildren[0];

    expect(originalNodeChildren?.length).toBe(1);
    expect(clonedNodeChildren?.length).toBe(1);
    expect(originalNodeAddedChild.id).toMatch(/n4*/);
    expect(clonedNodeClonedChild.id).toBe("n4");
    expect(incrementNextId).toBeCalledTimes(2);
});

it("deletes a node", async () => {
    expect(ds.length).toBe(2);
    await removeNode(ds, key1RootId);
    expect(ds.length).toBe(1);
});

it("deletes cloned nodes when original is deleted", async () => {
    const firstFundingLineChildren = cloneDs.find(d => d.key === 1)?.value.children;
    const secondFundingLineChildren = cloneDs.find(d => d.key === 2)?.value.children;

    if (!firstFundingLineChildren) throw new Error("Unexpected undefined value");
    if (!secondFundingLineChildren) throw new Error("Unexpected undefined value");

    expect(firstFundingLineChildren.find(fl => fl.id === "n0")).toBeDefined();
    expect(secondFundingLineChildren.find(fl => fl.id === "n0:12345")).toBeDefined();

    await removeNode(cloneDs, "n0");

    expect(firstFundingLineChildren.length).toBe(0);
    expect(firstFundingLineChildren.find(fl => fl.id === "n0")).toBeUndefined();
    expect(secondFundingLineChildren.length).toBe(1);
    expect(firstFundingLineChildren.find(fl => fl.id === "n0:12345")).toBeUndefined();
});

it("deletes child node from all cloned nodes (delete original)", async () => {
    const firstFundingLineChildren = cloneDs.find(d => d.key === 1)?.value.children;
    const secondFundingLineChildren = cloneDs.find(d => d.key === 2)?.value.children;

    if (!firstFundingLineChildren) throw new Error("Unexpected undefined value");
    if (!secondFundingLineChildren) throw new Error("Unexpected undefined value");

    expect(firstFundingLineChildren[0].children?.find(fl => fl.id === "n5")).toBeDefined();
    expect(secondFundingLineChildren[1].children?.find(fl => fl.id === "n5:12345")).toBeDefined();

    await removeNode(cloneDs, "n5");

    expect(firstFundingLineChildren.length).toBe(1);
    expect(firstFundingLineChildren.find(fl => fl.id === "n0")?.children?.length).toBe(0);

    expect(secondFundingLineChildren.length).toBe(2);
    expect(secondFundingLineChildren.find(fl => fl.id === "n0:12345")?.children?.length).toBe(0);
});

it("can delete clone if it's a clone root but only deletes that clone instance (top-level funding line was cloned)", async () => {
    const firstFundingLine = ds[0].value;
    const secondFundingLineChildren = ds[1].value.children;

    if (!firstFundingLine) throw new Error("Unexpected undefined value");
    if (!secondFundingLineChildren) throw new Error("Unexpected undefined value");

    expect(secondFundingLineChildren.length).toBe(2);
    expect(secondFundingLineChildren.find(fl => fl.id === cloneOfKey1RootId)).toBeDefined();

    await removeNode(ds, cloneOfKey1RootId);

    expect(secondFundingLineChildren.length).toBe(1);
    expect(secondFundingLineChildren.find(fl => fl.id === cloneOfKey1RootId)).toBeUndefined();
    expect(ds.length).toEqual(2);
});

it("can delete clone if it's a clone root but only deletes that clone instance (child calc was cloned)", async () => {
    const originalNode = cloneDs.find(d => d.key === 1)?.value.children?.find(c => c.id === "n0");
    if (!originalNode) throw new Error("Unexpected undefined value");

    const clonedNodeToDelete = cloneDs.find(d => d.key === 2)?.value.children?.find(c => c.id === "n0:12345");
    if (!clonedNodeToDelete) throw new Error("Unexpected undefined value");

    await removeNode(cloneDs, "n0:12345");

    expect(cloneDs.find(d => d.key === 1)?.value.children?.find(c => c.id === "n0")).toBeDefined();
    expect(cloneDs.find(d => d.key === 2)?.value.children?.find(c => c.id === "n0:12345")).toBeUndefined();
});

it("cannot delete a child cloned node (must be deleted on original)", async () => {
    await expect(removeNode(cloneDs, "n5:12345")).rejects.toThrowError("Cannot delete a clone child");
});

it("clones nodes", async () => {
    const draggedItem = {
        id: "n3",
        type: FundingLineType.Information,
        kind: NodeType.FundingLine,
        fundingLineCode: "Code 3",
        name: "Test 3",
        templateLineId: 3
    };

    const sourceNodeParentChildren = ds[1].value?.children;
    if (!sourceNodeParentChildren) throw new Error("Unexpected undefined value");
    expect(sourceNodeParentChildren.length).toBe(2);

    await cloneNode(ds, draggedItem, 2, key1RootId, 1);

    const parentOfClonedNodeChildren = ds[0].value?.children;
    if (!parentOfClonedNodeChildren) throw new Error("Unexpected undefined value");
    const clonedNode = parentOfClonedNodeChildren[0];

    expect(parentOfClonedNodeChildren.length).toBe(1);
    expect(sourceNodeParentChildren.length).toBe(2);
    expect(clonedNode.id).toMatch(/n3:/);
});

it("moves nodes", async () => {
    const draggedItem = {
        id: "n3",
        type: FundingLineType.Information,
        kind: NodeType.FundingLine,
        fundingLineCode: "Code 3",
        name: "Test 3",
        templateLineId: 3
    };

    const sourceNodeParentChildren = ds[1].value?.children;
    if (!sourceNodeParentChildren) throw new Error("Unexpected undefined value");
    expect(sourceNodeParentChildren.length).toBe(2);

    await moveNode(ds, draggedItem, 2, key1RootId, 1);

    const parentOfMovedNodeChildren = ds[0].value?.children;
    if (!parentOfMovedNodeChildren) throw new Error("Unexpected undefined value");
    const movedNode = parentOfMovedNodeChildren[0];

    expect(parentOfMovedNodeChildren.length).toBe(1);
    expect(sourceNodeParentChildren.length).toBe(1);
    expect(movedNode.id).toBe("n3");
});

it("updates clones when new child node is moved onto original", async () => {
    const draggedItem: Calculation = {
        id: "n6",
        type: CalculationType.Number,
        kind: NodeType.Calculation,
        templateCalculationId: 6,
        name: "Calculation 6",
        aggregationType: AggregrationType.None,
        formulaText: "",
        valueFormat: ValueFormatType.Currency,
    };

    expect(cloneDs.find(d => d.key === 1)?.value.children?.find(c => c.id === "n0")?.children?.length).toEqual(1);

    await moveNode(cloneDs, draggedItem, 3, "n0", 1);

    expect(cloneDs.find(d => d.key === 1)?.value.children?.find(c => c.id === "n0")?.children?.length).toEqual(2);
    expect(cloneDs.find(d => d.key === 2)?.value.children?.find(c => c.id === "n0:12345")?.children?.length).toEqual(2);
});

it("updates clones when child node is moved off original", async () => {
    const draggedItem: Calculation = {
        id: "n5",
        type: CalculationType.Enum,
        kind: NodeType.Calculation,
        templateCalculationId: 5,
        name: "Calculation 5",
        aggregationType: AggregrationType.None,
        formulaText: "",
        valueFormat: ValueFormatType.Currency,
        allowedEnumTypeValues: "Option1,Option2,Option3"
    };

    expect(cloneDs.find(d => d.key === 1)?.value.children?.find(c => c.id === "n0")?.children?.length).toEqual(1);

    await moveNode(cloneDs, draggedItem, 1, "n4", 3);

    expect(cloneDs.find(d => d.key === 1)?.value.children?.find(c => c.id === "n0")?.children?.length).toEqual(0);
    expect(cloneDs.find(d => d.key === 2)?.value.children?.find(c => c.id === "n0:12345")?.children?.length).toEqual(0);
});

it("clones calculations", async () => {
    const dsCalcs: Array<FundingLineDictionaryEntry> = cloneDeep(multipleCalculationsDs);

    expect(getAllCalculations(dsCalcs.map(d => d.value))).toEqual([
        {"id": "n2", "name": "Calculation 2", "templateCalculationId": 2, "aggregationType": "Sum"},
        {"id": "n3", "name": "Calculation 3", "templateCalculationId": 3, "aggregationType": "Sum"},
        {"id": "n4", "name": "Calculation 4", "templateCalculationId": 4, "aggregationType": "Sum"},
        {"id": "n6", "name": "Calculation 6", "templateCalculationId": 6, "aggregationType": "Sum"}
    ]);

    await cloneCalculation(dsCalcs, "n4", "n3");

    expect(getAllCalculations(dsCalcs.map(d => d.value))).toEqual([
        {"id": "n2", "name": "Calculation 2", "templateCalculationId": 2, "aggregationType": "Sum"},
        {"id": "n3", "name": "Calculation 3", "templateCalculationId": 3, "aggregationType": "Sum"},
        {"id": "n6", "name": "Calculation 6", "templateCalculationId": 6, "aggregationType": "Sum"}
    ]);
});

it("transforms single node template into datasource", () => {
    const datasource = templateFundingLinesToDatasource(singleNodeTemplate);
    expect(datasource).toStrictEqual(singleNodeDs);
});

it("transforms cloned node template into datasource", () => {
    uuidv4.mockImplementation(() => '12345');
    const template = templateFundingLinesToDatasource(clonedNodeTemplate);
    expect(template).toStrictEqual(clonedNodeDs);
});

it("transforms template with children into datasource", () => {
    const datasource = templateFundingLinesToDatasource(withChildFundingLineTemplate);
    expect(datasource).toStrictEqual(withChildFundingLineDs);
});

it("transforms template with children of type funding line and calculation into datasource", () => {
    const datasource = templateFundingLinesToDatasource(withChildFundingLineAndCalculationTemplate);
    expect(datasource).toStrictEqual(withChildFundingLineAndCalculationDs);
});

it("transforms template with multiple funding lines into datasource", () => {
    const datasource = templateFundingLinesToDatasource(multipleFundingLinesTemplate);
    expect(datasource).toStrictEqual(multipleFundingLinesDs);
});

it("transforms single node datasource into template", () => {
    const template = datasourceToTemplateFundingLines(singleNodeDs);
    expect(template).toStrictEqual(singleNodeTemplate);
});

it("transforms datasource with cloned node into template", () => {
    const template = datasourceToTemplateFundingLines(clonedNodeDs);
    expect(template).toStrictEqual(clonedNodeTemplate);
});

it("transforms datasource with children into template", () => {
    const template = datasourceToTemplateFundingLines(withChildFundingLineDs);
    expect(template).toStrictEqual(withChildFundingLineTemplate);
});

it("transforms datasource with children of type funding line and calculation into template", () => {
    const template = datasourceToTemplateFundingLines(withChildFundingLineAndCalculationDs);
    expect(template).toStrictEqual(withChildFundingLineAndCalculationTemplate);
});

it("transforms datasource with multiple funding lines into template", () => {
    const template = datasourceToTemplateFundingLines(multipleFundingLinesDs);
    expect(template).toStrictEqual(multipleFundingLinesTemplate);
});

it("calculates lastUsedId correctly", () => {
    expect(getLastUsedId(singleNodeTemplate)).toBe(0);
    expect(getLastUsedId(withChildFundingLineTemplate)).toBe(1);
    expect(getLastUsedId(withChildFundingLineAndCalculationTemplate)).toBe(3);
    expect(getLastUsedId(multipleFundingLinesTemplate)).toBe(4);
    expect(getLastUsedId(clonedNodeTemplate)).toBe(4);
});

it("calculates getAllCalculations correctly", () => {
    expect(getAllCalculations(singleNodeDs.map(d => d.value))).toEqual([]);
    expect(getAllCalculations(withChildFundingLineDs.map(d => d.value))).toEqual([]);
    expect(getAllCalculations(withChildFundingLineAndCalculationDs.map(d => d.value))).toEqual([{"id": "n2", "name": "Calculation 3", "templateCalculationId": 3, "aggregationType": "None"}]);
    expect(getAllCalculations(multipleFundingLinesDs.map(d => d.value))).toEqual([{"id": "n2", "name": "Calculation 4", "templateCalculationId": 4, "aggregationType": "Sum"}]);
    expect(getAllCalculations(clonedNodeDs.map(d => d.value))).toEqual([{"id": "n0", "name": "Calculation 4", "templateCalculationId": 4, "aggregationType": "Sum"}]);
    expect(getAllCalculations(multipleCalculationsDs.map(d => d.value))).toEqual([
        {"id": "n2", "name": "Calculation 2", "templateCalculationId": 2, "aggregationType": "Sum"},
        {"id": "n3", "name": "Calculation 3", "templateCalculationId": 3, "aggregationType": "Sum"},
        {"id": "n4", "name": "Calculation 4", "templateCalculationId": 4, "aggregationType": "Sum"},
        {"id": "n6", "name": "Calculation 6", "templateCalculationId": 6, "aggregationType": "Sum"}
    ]);
    expect(getAllCalculations(clonedCalculationsAndFundingLinesNodeDs.map(d => d.value), true)).toEqual([
        {"id": "n0", "name": "Calculation 4", "templateCalculationId": 4, "aggregationType": "Sum"},
        {"id": "n0:12345", "name": "Calculation 4", "templateCalculationId": 4, "aggregationType": "Sum"},
        {"id": "n0:54321", "name": "Calculation 4", "templateCalculationId": 4, "aggregationType": "Sum"},
        {"id": "n0:00000", "name": "Calculation 4", "templateCalculationId": 4, "aggregationType": "Sum"},
    ]);
});

it("calculates getAllFundingLines correctly", () => {
    expect(getAllFundingLines(singleNodeDs.map(d => d.value))).toEqual([
        {"id": "n0", "name": "Funding Line 0", "templateLineId": 0}
    ]);
    expect(getAllFundingLines(withChildFundingLineDs.map(d => d.value))).toEqual([
        {"id": "n1", "name": "Funding Line 0", "templateLineId": 0},
        {"id": "n0", "name": "Funding Line 1", "templateLineId": 1}
    ]);
    expect(getAllFundingLines(withChildFundingLineAndCalculationDs.map(d => d.value))).toEqual([
        {"id": "n3", "name": "Funding Line 0", "templateLineId": 0},
        {"id": "n1", "name": "Funding Line 1", "templateLineId": 1},
        {"id": "n0", "name": "Funding Line 2", "templateLineId": 2}
    ]);
    expect(getAllFundingLines(multipleFundingLinesDs.map(d => d.value))).toEqual([
        {"id": "n0", "name": "Funding Line 0", "templateLineId": 0},
        {"id": "n3", "name": "Funding Line 1", "templateLineId": 1},
        {"id": "n4", "name": "Funding Line 2", "templateLineId": 2},
        {"id": "n1", "name": "Funding Line 3", "templateLineId": 3}
    ]);
    expect(getAllFundingLines(clonedNodeDs.map(d => d.value))).toEqual([
        {"id": "n1", "name": "Funding Line 0", "templateLineId": 0},
        {"id": "n3", "name": "Funding Line 1", "templateLineId": 1},
        {"id": "n4", "name": "Funding Line 2", "templateLineId": 2},
        {"id": "n2", "name": "Funding Line 3", "templateLineId": 3}
    ]);
    expect(getAllFundingLines(multipleCalculationsDs.map(d => d.value))).toEqual([
        {"id": "n0", "name": "Funding Line 0", "templateLineId": 0},
        {"id": "n1", "name": "Funding Line 1", "templateLineId": 1},
        {"id": "n5", "name": "Funding Line 5", "templateLineId": 5},
        {"id": "n7", "name": "Funding Line 7", "templateLineId": 7}
    ]);
    expect(getAllFundingLines(clonedFundingLinesDs.map(d => d.value))).toEqual([
        {"id": "n0", "name": "Funding Line 0", "templateLineId": 0},
        {"id": "n1", "name": "Funding Line 1", "templateLineId": 1}
    ]);
    expect(getAllFundingLines(clonedCalculationsAndFundingLinesNodeDs.map(d => d.value), true)).toEqual([
        {"id": "n1", "name": "Funding Line 0", "templateLineId": 0},
        {"id": "n3", "name": "Funding Line 1", "templateLineId": 1},
        {"id": "n4", "name": "Funding Line 2", "templateLineId": 2},
        {"id": "n4:12345", "name": "Funding Line 2", "templateLineId": 2},
        {"id": "n2", "name": "Funding Line 3", "templateLineId": 3},
        {"id": "n5", "name": "Funding Line 4", "templateLineId": 4}
    ]);
});

it("calculates isChildOf correctly", async () => {
    expect(await isChildOf(multipleCalculationsDs, "n5", "n1")).toBeTruthy();
    expect(await isChildOf(multipleCalculationsDs, "n5", "n2")).toBeTruthy();
    expect(await isChildOf(multipleCalculationsDs, "n5", "n3")).toBeTruthy();
    expect(await isChildOf(multipleCalculationsDs, "n5", "n7")).toBeFalsy();
    expect(await isChildOf(multipleCalculationsDs, "n7", "n6")).toBeTruthy();
});

it("calculates all templateCalculationIds correctly", () => {
    expect(getAllTemplateCalculationIds(singleNodeDs)).toEqual([]);
    expect(getAllTemplateCalculationIds(multipleCalculationsDs)).toEqual([2, 3, 4, 6]);
    expect(getAllTemplateCalculationIds(withChildFundingLineAndCalculationDs)).toEqual([3]);
    expect(getAllTemplateCalculationIds(withChildFundingLineDs)).toEqual([]);
    expect(getAllTemplateCalculationIds(multipleFundingLinesDs)).toEqual([4]);
    expect(getAllTemplateCalculationIds(clonedNodeDs)).toEqual([4]);
});

it("calculates all templateLineIds correctly", () => {
    expect(getAllTemplateLineIds(singleNodeDs)).toEqual([0]);
    expect(getAllTemplateLineIds(multipleCalculationsDs)).toEqual([0, 1, 5, 7]);
    expect(getAllTemplateLineIds(withChildFundingLineAndCalculationDs)).toEqual([0, 1, 2]);
    expect(getAllTemplateLineIds(withChildFundingLineDs)).toEqual([0, 1]);
    expect(getAllTemplateLineIds(multipleFundingLinesDs)).toEqual([0, 1, 2, 3]);
    expect(getAllTemplateLineIds(clonedNodeDs)).toEqual([0, 1, 2, 3]);
});

it("calculates parentId correctly", () => {
    expect(findParentId(singleNodeDs.map(d => d.value), "n0")).toEqual("");
    expect(findParentId(withChildFundingLineDs.map(d => d.value), "n0")).toEqual("n1");
    expect(findParentId(withChildFundingLineDs.map(d => d.value), "n1")).toEqual("");
    expect(findParentId(withChildFundingLineAndCalculationDs.map(d => d.value), "n0")).toEqual("n1");
    expect(findParentId(withChildFundingLineAndCalculationDs.map(d => d.value), "n1")).toEqual("n3");
    expect(findParentId(withChildFundingLineAndCalculationDs.map(d => d.value), "n2")).toEqual("n3");
    expect(findParentId(withChildFundingLineAndCalculationDs.map(d => d.value), "n3")).toEqual("");
    expect(findParentId(multipleFundingLinesDs.map(d => d.value), "n0")).toEqual("");
    expect(findParentId(multipleFundingLinesDs.map(d => d.value), "n1")).toEqual("n3");
    expect(findParentId(multipleFundingLinesDs.map(d => d.value), "n2")).toEqual("n3");
    expect(findParentId(multipleFundingLinesDs.map(d => d.value), "n3")).toEqual("");
    expect(findParentId(multipleFundingLinesDs.map(d => d.value), "n4")).toEqual("");
    expect(findParentId(clonedNodeDs.map(d => d.value), "n0:12345")).toEqual("n3");
    expect(findParentId(multipleCalculationsDs.map(d => d.value), "n3")).toEqual("n4");
    expect(findParentId(cloneWithChildrenNodeDs.map(d => d.value), "n0:12345")).toEqual("n3");
});

it("calculates isCloneRoot correctly", () => {
    expect(isCloneRoot(cloneWithChildrenNodeDs.map(d => d.value), "n0")).toEqual(false);
    expect(isCloneRoot(cloneWithChildrenNodeDs.map(d => d.value), "n1")).toEqual(false);
    expect(isCloneRoot(cloneWithChildrenNodeDs.map(d => d.value), "n2")).toEqual(false);
    expect(isCloneRoot(cloneWithChildrenNodeDs.map(d => d.value), "n3")).toEqual(false);
    expect(isCloneRoot(cloneWithChildrenNodeDs.map(d => d.value), "n4")).toEqual(false);
    expect(isCloneRoot(cloneWithChildrenNodeDs.map(d => d.value), "n5")).toEqual(false);
    expect(isCloneRoot(cloneWithChildrenNodeDs.map(d => d.value), "n0:12345")).toEqual(true);
    expect(isCloneRoot(cloneWithChildrenNodeDs.map(d => d.value), "n5:12345")).toEqual(false);

});
