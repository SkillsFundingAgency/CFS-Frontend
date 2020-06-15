import { singleNodeTemplate, singleNodeDs, withChildFundingLineTemplate, withChildFundingLineDs, withChildFundingLineAndCalculationTemplate, withChildFundingLineAndCalculationDs, multipleFundingLinesDs, multipleFundingLinesTemplate, clonedNodeDs, clonedNodeTemplate, multipleCalculationsDs } from "./templateBuilderTestData";
import { addNode, updateNode, findAllClonedNodeIds, removeNode, moveNode, cloneNode, templateFundingLinesToDatasource, datasourceToTemplateFundingLines, getLastUsedId, getAllCalculations, cloneCalculation, isChildOf } from "../../services/templateBuilderDatasourceService";
import { FundingLineDictionaryEntry, FundingLineType, NodeType, FundingLineUpdateModel, CalculationType, AggregrationType, ValueFormatType } from "../../types/TemplateBuilderDefinitions";
import cloneDeep from 'lodash/cloneDeep';
import { v4 as uuidv4 } from 'uuid';
jest.mock('uuid');

const key1RootId = "n1";
const cloneOfKey1RootId = "n1:12345";

let ds: Array<FundingLineDictionaryEntry>;

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

it("updates node", async () => {
    const updateModel: FundingLineUpdateModel = {
        id: key1RootId,
        type: FundingLineType.Payment,
        kind: NodeType.FundingLine,
        name: "New Name",
        fundingLineCode: "1"
    };

    await updateNode(ds, updateModel);

    const updatedNode = ds.find(d => d.key === 1)?.value;

    expect(updatedNode?.name).toBe("New Name");
    expect(updatedNode?.type).toBe(FundingLineType.Payment);
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
        fundingLineCode: "1"
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
        fundingLineCode: "1"
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

it("does not delete cloned nodes", async () => {
    await removeNode(ds, key1RootId);
    expect(ds.length).toBe(1);
    expect(ds[0].value?.children?.length).toBe(2);
});

it("does not delete original node when clone is deleted", async () => {
    await removeNode(ds, cloneOfKey1RootId);
    expect(ds.length).toBe(2);
    expect(ds[1].value?.children?.length).toBe(1);
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
});

it("calculates isChildOf correctly", async () => {
    expect(await isChildOf(multipleCalculationsDs, "n5", "n1")).toBeTruthy();
    expect(await isChildOf(multipleCalculationsDs, "n5", "n2")).toBeTruthy();
    expect(await isChildOf(multipleCalculationsDs, "n5", "n3")).toBeTruthy();
    expect(await isChildOf(multipleCalculationsDs, "n5", "n7")).toBeFalsy();
    expect(await isChildOf(multipleCalculationsDs, "n7", "n6")).toBeTruthy();
});
