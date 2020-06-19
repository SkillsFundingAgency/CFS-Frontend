import JSONDigger from "json-digger";
import { v4 as uuidv4 } from 'uuid';
import {
    AggregrationType,
    Calculation,
    CalculationType,
    CalculationUpdateModel,
    FundingLine,
    FundingLineDictionaryEntry,
    FundingLineOrCalculation,
    FundingLineType,
    FundingLineUpdateModel,
    NodeType,
    TemplateCalculation,
    TemplateFundingLine,
    ValueFormatType,
    TemplateResponse, TemplateContentUpdateCommand, CalculationDictionaryItem, FundingStreamWithPeriodsResponse
} from "../types/TemplateBuilderDefinitions";
import { TemplateSearchRequest } from "../types/searchRequestViewModel";
import axiosInstance from "../services/axiosInterceptor"
import cloneDeep from 'lodash/cloneDeep';
import { AxiosResponse } from "axios";

const fundingLineIdField = "id";
const fundingLineChildrenField = "children";

export const addNode = async (ds: Array<FundingLineDictionaryEntry>, id: string, newChild: FundingLine | Calculation, incrementNextId: () => void) => {
    for (let i = 0; i < ds.length; i++) {
        const fundingLine = ds[i];
        if (!fundingLine) return;
        const digger = new JSONDigger(fundingLine.value, fundingLineIdField, fundingLineChildrenField);
        const clonedNodeIds = await findAllClonedNodeIds(fundingLine.value, id);
        for (let j = 0; j < clonedNodeIds.length; j++) {
            try {
                const clonedNodeId = clonedNodeIds[j];
                if (clonedNodeId !== id) {
                    const childToAdd = { ...newChild };
                    childToAdd.id = `${newChild.id.split(":")[0]}:${uuidv4()}`.replace(/-/gi, "");
                    await digger.addChildren(clonedNodeId, [childToAdd]);
                } else {
                    await digger.addChildren(clonedNodeId, [newChild]);
                }
                incrementNextId();
            }
            catch {
                // ignore
            }
        };
    }
}

export const findNodeById = async (ds: Array<FundingLineDictionaryEntry>, id: string) => {
    for (let fl = 0; fl < ds.length; fl++) {
        const digger = new JSONDigger(ds[fl].value, fundingLineIdField, fundingLineChildrenField);
        try {
            const node = await digger.findNodeById(id);
            return node;
        }
        catch {
            // Node does not exist in current funding line
        }
    }

    throw new Error(`Node with id ${id} not found.`);
}

function isRootNode(ds: Array<FundingLineDictionaryEntry>, id: string): boolean {
    const rootNodeIds = ds.map(d => d.value).map(v => v.id);
    return rootNodeIds.includes(id);
}

export const removeNode = async (ds: Array<FundingLineDictionaryEntry>, id: string) => {
    const rootNodesToDelete: Array<number> = [];

    for (let i = 0; i < ds.length; i++) {
        const fundingLine = ds[i];
        if (!fundingLine) return;

        const digger = new JSONDigger(fundingLine.value, fundingLineIdField, fundingLineChildrenField);

        try {
            if (isRootNode(ds, id)) {
                rootNodesToDelete.push(fundingLine.key);
                break;
            }
            await digger.removeNode(id);
        }
        catch {
            // ignore
        }
    }

    rootNodesToDelete.forEach(k => {
        const fundingLineKeyIndex = ds.findIndex(d => d.key === k);
        ds.splice(fundingLineKeyIndex, 1);
    });
}

function getNewCloneId(id: string) {
    return `${id.split(":")[0]}:${uuidv4()}`.replace(/-/gi, "");
}

export const cloneNode = async (ds: Array<FundingLineDictionaryEntry>, draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => {
    const sourceFundingLine = ds.find(k => k.key === draggedItemDsKey);
    if (!sourceFundingLine) return;
    const destinationFundingLine = ds.find(k => k.key === dropTargetDsKey);
    if (!destinationFundingLine) return;
    draggedItemData.dsKey = cloneDeep(dropTargetDsKey);
    draggedItemData.id = getNewCloneId(draggedItemData.id);

    if (draggedItemData.children && draggedItemData.children.length > 0) {
        cloneChildNodes(draggedItemData.children, dropTargetDsKey);
    }

    const destinationDsDigger = new JSONDigger(destinationFundingLine.value, fundingLineIdField, fundingLineChildrenField);
    await destinationDsDigger.addChildren(dropTargetId, cloneDeep(draggedItemData));
}

export const cloneCalculation = async (ds: Array<FundingLineDictionaryEntry>, targetCalculationId: string, sourceCalculationId: string) => {
    const targetCalculation: Calculation = await findNodeById(ds, targetCalculationId);
    const sourceCalculation: Calculation = await findNodeById(ds, sourceCalculationId);

    const targetDsKey = cloneDeep(targetCalculation.dsKey) || 0;

    targetCalculation.id = getNewCloneId(sourceCalculationId);
    targetCalculation.templateCalculationId = cloneDeep(sourceCalculation.templateCalculationId);
    targetCalculation.type = cloneDeep(sourceCalculation.type);
    targetCalculation.name = cloneDeep(sourceCalculation.name);
    targetCalculation.aggregationType = cloneDeep(sourceCalculation.aggregationType);
    targetCalculation.formulaText = cloneDeep(sourceCalculation.formulaText);
    targetCalculation.valueFormat = cloneDeep(sourceCalculation.valueFormat);
    targetCalculation.allowedEnumTypeValues = cloneDeep(sourceCalculation.allowedEnumTypeValues);
    targetCalculation.groupRate = cloneDeep(sourceCalculation.groupRate);
    targetCalculation.percentageChangeBetweenAandB = cloneDeep(sourceCalculation.percentageChangeBetweenAandB);

    if (sourceCalculation.children && sourceCalculation.children.length > 0) {
        targetCalculation.children = cloneDeep(sourceCalculation.children);
        cloneChildNodes(targetCalculation.children, targetDsKey);
    }
}

function cloneChildNodes(nodes: any, dsKey: number) {
    if (!nodes) {
        return;
    }
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].id = getNewCloneId(nodes[i].id);
        nodes[i].dsKey = cloneDeep(dsKey);
        cloneChildNodes(nodes[i].children, dsKey);
    }
}

export const moveNode = async (ds: Array<FundingLineDictionaryEntry>, draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => {
    const sourceFundingLine = ds.find(k => k.key === draggedItemDsKey);
    if (!sourceFundingLine) return;
    const destinationFundingLine = ds.find(k => k.key === dropTargetDsKey);
    if (!destinationFundingLine) return;
    const destinationDsDigger = new JSONDigger(destinationFundingLine.value, fundingLineIdField, fundingLineChildrenField);
    draggedItemData.dsKey = dropTargetDsKey;
    if (isRootNode(ds, draggedItemData.id)) {
        await destinationDsDigger.addChildren(dropTargetId, draggedItemData);
        const fundingLineKeyIndex = ds.findIndex(d => d.key === draggedItemDsKey);
        ds.splice(fundingLineKeyIndex, 1);
    }
    else {
        await destinationDsDigger.addChildren(dropTargetId, draggedItemData);
        const sourceDsDigger = new JSONDigger(sourceFundingLine.value, fundingLineIdField, fundingLineChildrenField);
        await sourceDsDigger.removeNode(draggedItemData.id);
    }
}

export async function findAllClonedNodeIds(fundingLine: FundingLine, id: string): Promise<Array<string>> {
    const digger = new JSONDigger(fundingLine, fundingLineIdField, fundingLineChildrenField);
    const originalId = id.split(":")[0];
    const findClonedNodesCondition = new RegExp(`${originalId}:|^${originalId}$`, 'i')
    try {
        const clonedNodes: Array<FundingLineOrCalculation> = await digger.findNodes({ 'id': findClonedNodesCondition });
        return clonedNodes ? clonedNodes.map((n: FundingLineOrCalculation) => n.id) : [];
    }
    catch (err) {
        return [];
    }
}

export const updateNode = async (ds: Array<FundingLineDictionaryEntry>, updateModel: FundingLineUpdateModel | CalculationUpdateModel) => {
    for (let i = 0; i < ds.length; i++) {
        const fundingLine = ds[i];
        if (!fundingLine) continue;
        try {
            const digger = new JSONDigger(fundingLine.value, fundingLineIdField, fundingLineChildrenField);
            const clonedNodeIds = await findAllClonedNodeIds(fundingLine.value, updateModel.id);
            clonedNodeIds.forEach(async c => {
                const cloneUpdateModel = { ...updateModel };
                cloneUpdateModel.id = c;
                try {
                    await digger.updateNode(cloneUpdateModel);
                }
                catch {
                    // ignore
                }
            });
        }
        catch {
            // ignore
        }
    };
}

let id: number = 0;
let templateLineAndCalculationIds: any = {};

function initialiseId() {
    id = 0;
    templateLineAndCalculationIds = {};
}

function getId(templateLineOrCalculationId: number) {
    if (templateLineAndCalculationIds.hasOwnProperty(`n${templateLineOrCalculationId}`)) {
        return `${templateLineAndCalculationIds[`n${templateLineOrCalculationId}`]}:${uuidv4()}`.replace(/-/gi, "");
    }
    const nodeId = id++;
    templateLineAndCalculationIds[`n${templateLineOrCalculationId}`] = nodeId;
    return nodeId;
}

function getChildren(fundingLinesOrCalculations: Array<TemplateFundingLine> | Array<TemplateCalculation> | undefined,
    id: number, key: number): Array<FundingLineOrCalculation> {
    let children: Array<FundingLineOrCalculation> = [];
    if (fundingLinesOrCalculations) {
        for (let i = 0; i < fundingLinesOrCalculations.length; i++) {
            const node: TemplateFundingLine | TemplateCalculation = fundingLinesOrCalculations[i];
            if ('templateLineId' in node) {
                const childFundingLine = getFundingLine(node, id, key)
                children.push(childFundingLine);
            }
            else {
                const childCalculation = getCalculation(node, id, key)
                children.push(childCalculation);
            }
        }
    }
    return children;
}

export function getStringArray(options: string | undefined): string[] | undefined {
    if (!options || options.length === 0) {
        return undefined;
    }

    return options.split(",").map(s => s.trim());
}

export function stringArrayToString(options: string[] | undefined): string | undefined {
    if (!options || options.length === 0) {
        return undefined;
    }

    return options.join(", ").trimEnd();
}

function getCalculation(templateCalculation: TemplateCalculation, id: number, key: number): Calculation {
    let currentId = id;
    const childCalculations = getChildren(templateCalculation.calculations, currentId, key);

    return {
        id: `n${getId(templateCalculation.templateCalculationId)}`,
        templateCalculationId: templateCalculation.templateCalculationId,
        kind: NodeType.Calculation,
        type: templateCalculation.type as CalculationType,
        name: templateCalculation.name,
        aggregationType: templateCalculation.aggregationType as AggregrationType,
        dsKey: key,
        formulaText: templateCalculation.formulaText,
        valueFormat: templateCalculation.valueFormat as ValueFormatType,
        allowedEnumTypeValues: stringArrayToString(templateCalculation.allowedEnumTypeValues),
        groupRate: templateCalculation.groupRate,
        percentageChangeBetweenAandB: templateCalculation.percentageChangeBetweenAandB,
        children: childCalculations
    }
}

function getFundingLine(templateFundingLine: TemplateFundingLine, id: number, key: number): FundingLine {
    let currentId = id;
    const childFundingLines = getChildren(templateFundingLine.fundingLines, currentId, key);
    const childCalculations = getChildren(templateFundingLine.calculations, currentId, key);
    return {
        id: `n${getId(templateFundingLine.templateLineId)}`,
        templateLineId: templateFundingLine.templateLineId,
        type: <FundingLineType>templateFundingLine.type,
        fundingLineCode: templateFundingLine.fundingLineCode,
        name: templateFundingLine.name,
        kind: NodeType.FundingLine,
        dsKey: key,
        children: childFundingLines.concat(childCalculations)
    };
}

export const templateFundingLinesToDatasource = (templateFundingLines: Array<TemplateFundingLine>): Array<FundingLineDictionaryEntry> => {
    initialiseId();
    let datasource: Array<FundingLineDictionaryEntry> = [];
    let id = 0;
    for (let i = 0; i < templateFundingLines.length; i++) {
        const key: number = i + 1;
        const fundingLine: FundingLine = getFundingLine(templateFundingLines[i], id, key);
        datasource.push({ key, value: fundingLine })
    }
    return datasource;
}

function getTemplateFundingLines(fundingLines: FundingLineOrCalculation[] | undefined): TemplateFundingLine[] {
    let result: TemplateFundingLine[] = [];

    if (fundingLines === undefined || fundingLines.length === 0) {
        return result;
    }

    for (let fl = 0; fl < fundingLines.length; fl++) {
        if (fundingLines[fl].kind === NodeType.Calculation) {
            continue;
        }
        const fundingLine = fundingLines[fl] as FundingLine;
        let templateFundingLine: TemplateFundingLine = getTemplateFundingLine(fundingLine);
        result.push(templateFundingLine);
    }

    return result;
}

function getTemplateCalculations(fundingLines: FundingLineOrCalculation[] | undefined): TemplateCalculation[] {
    let result: TemplateCalculation[] = [];

    if (fundingLines === undefined || fundingLines.length === 0) {
        return result;
    }

    for (let fl = 0; fl < fundingLines.length; fl++) {
        if (fundingLines[fl].kind === NodeType.FundingLine) {
            continue;
        }
        const calculation = fundingLines[fl] as Calculation;
        let templateCalculation: TemplateCalculation = getTemplateCalculation(calculation);
        result.push(templateCalculation);
    }

    return result;
}

function getTemplateCalculation(calculation: Calculation) {
    const childCalculations = getTemplateCalculations(calculation.children);

    const templateCalculation: TemplateCalculation = {
        templateCalculationId: calculation.templateCalculationId,
        type: calculation.type,
        name: calculation.name,
        aggregationType: calculation.aggregationType,
        formulaText: calculation.formulaText,
        valueFormat: calculation.valueFormat,
        allowedEnumTypeValues: getStringArray(calculation.allowedEnumTypeValues),
        groupRate: calculation.groupRate,
        percentageChangeBetweenAandB: calculation.percentageChangeBetweenAandB,
        calculations: childCalculations
    };

    return templateCalculation;
}

function getTemplateFundingLine(fundingLine: FundingLine) {
    const childFundingLines = getTemplateFundingLines(fundingLine.children);
    const childCalculations = getTemplateCalculations(fundingLine.children);

    const templateFundingLine: TemplateFundingLine = {
        templateLineId: fundingLine.templateLineId,
        type: fundingLine.type,
        name: fundingLine.name,
        fundingLineCode: fundingLine.fundingLineCode,
        fundingLines: childFundingLines,
        calculations: childCalculations
    };

    return templateFundingLine;
}

function getTemplateFundingLinesFromDatasource(fundingLines: Array<FundingLineDictionaryEntry>): Array<TemplateFundingLine> {
    const templateFundingLines: Array<TemplateFundingLine> = [];

    for (let key = 0; key < fundingLines.length; key++) {
        const templateFundingLine: TemplateFundingLine = getTemplateFundingLine(fundingLines[key].value);
        templateFundingLines.push(templateFundingLine);
    }

    return templateFundingLines;
}

export const datasourceToTemplateFundingLines = (ds: Array<FundingLineDictionaryEntry>): Array<TemplateFundingLine> => {
    const templateFundingLines = getTemplateFundingLinesFromDatasource(ds);
    return templateFundingLines;
}

export function getLastUsedId(fundingLines: TemplateFundingLine[]): number {
    let ids = [];
    const flString = JSON.stringify(fundingLines);
    const flMatches = flString.matchAll(/"templateLineId":(.*?)"/g);
    for (const match of flMatches) {
        ids.push(parseInt(match[1].replace(',', ''), 10));
    }
    const calcMatches = flString.matchAll(/"templateCalculationId":(.*?)"/g);
    for (const match of calcMatches) {
        ids.push(parseInt(match[1].replace(',', ''), 10));
    }
    return Math.max(...ids);
}

export const getAllCalculations = (fundingLines: FundingLine[]): CalculationDictionaryItem[] => {
    const result: CalculationDictionaryItem[] = [];

    for (let fundingLine = 0; fundingLine < fundingLines.length; fundingLine++) {
        let stack: FundingLineOrCalculation[] = [];
        let array: CalculationDictionaryItem[] = [];
        let hashMap: any = {};

        stack.push(fundingLines[fundingLine]);

        while (stack.length !== 0) {
            const node = stack.pop();
            if (node && (node.children === undefined || node.children.length === 0)) {
                node.kind === NodeType.Calculation && visitNode(node as Calculation, hashMap, array);
            } else {
                if (node && node.children && node.children.length > 0) {
                    for (let i: number = node.children.length - 1; i >= 0; i--) {
                        stack.push(node.children[i]);
                    }
                }
            }

            if (node && node.kind === NodeType.Calculation) {
                visitNode(node as Calculation, hashMap, array);
            }
        }
        result.push(...array);
    }

    return result.sort(compare);
}

function compare(a: CalculationDictionaryItem, b: CalculationDictionaryItem) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    let comparison = 0;
    if (nameA > nameB) {
        comparison = 1;
    } else if (nameA < nameB) {
        comparison = -1;
    }
    return comparison;
}

function visitNode(node: Calculation, hashMap: any, array: CalculationDictionaryItem[]) {
    if (!node.id.includes(":") && !hashMap[node.id]) {
        hashMap[node.id] = true;
        array.push({
            id: node.id,
            templateCalculationId: node.templateCalculationId,
            aggregationType: node.aggregationType,
            name: node.name
        });
    }
}

export const isChildOf = async (datasource: FundingLineDictionaryEntry[], parentId: string, childId: string): Promise<boolean> => {
    const parent: FundingLineOrCalculation = await findNodeById(datasource, parentId);
    if (!parent.children || parent.children.length === 0 || parentId === childId) {
        return false;
    }
    return childMatches(parent.children, childId);
}

function childMatches(children: FundingLineOrCalculation[] | undefined, childId: string): boolean {
    if (children && children.length > 0) {
        let match = false;
        for (let childIndex = 0; childIndex < children.length; childIndex++) {
            match = children[childIndex].id === childId || childMatches(children[childIndex].children, childId);
            if (match) {
                return true;
            }
        }
    }
    return false;
}

export async function saveTemplateContent(command: TemplateContentUpdateCommand) {
    return await axiosInstance(`/api/templates/build/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        data: command
    })
}

export async function searchForTemplates(searchRequest: TemplateSearchRequest) {
    return await axiosInstance(`/api/templates/build/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: searchRequest
    })
}

export async function getTemplateById(templateId: string): Promise<AxiosResponse<TemplateResponse>> {
    return axiosInstance.get(`/api/templates/build/${templateId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getAllFundingStreamsWithAvailablePeriods(): Promise<AxiosResponse<FundingStreamWithPeriodsResponse[]>> {
    return await axiosInstance.get(`/api/templates/build/available-stream-periods`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function createNewDraftTemplate(fundingStreamId: string, fundingPeriodId: string, description: string): Promise<AxiosResponse<string>> {
    return await axiosInstance(`/api/templates/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { fundingStreamId, fundingPeriodId, description }
    })
}

export async function publishTemplate(templateId: string, note: string): Promise<AxiosResponse<string>> {
    return await axios(`/api/templates/build/${templateId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {templateId, note}
    })
}