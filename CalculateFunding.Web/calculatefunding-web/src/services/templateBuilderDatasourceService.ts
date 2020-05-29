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
    TemplateResponse, Template, TemplateContentUpdateCommand
} from "../types/TemplateBuilderDefinitions";
import { TemplateSearchRequest } from "../types/searchRequestViewModel";
import axios, { AxiosResponse } from "axios";

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

const nodeExistsInFundingLine = async (digger: any, id: string) => {
    try {
        await digger.findNodeById(id);
        return true;
    }
    catch {
        return false;
    }
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

        const clonedNodeIds = await findAllClonedNodeIds(fundingLine.value, id);
        for (let j = 0; j < clonedNodeIds.length; j++) {
            try {
                const clonedNodeId = clonedNodeIds[j];
                if (isRootNode(ds, clonedNodeId)) {
                    rootNodesToDelete.push(fundingLine.key);
                    break;
                }
                await digger.removeNode(clonedNodeId);
            }
            catch {
                // ignore
            }
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
    draggedItemData.dsKey = dropTargetDsKey;
    const id = getNewCloneId(draggedItemData.id);
    draggedItemData.id = id;
    const destinationDsDigger = new JSONDigger(destinationFundingLine.value, fundingLineIdField, fundingLineChildrenField);
    await destinationDsDigger.addChildren(dropTargetId, draggedItemData);
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

function initialiseId() {
    id = 0;
}

function getId() {
    return id++;
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
        id: `n${getId()}`,
        templateCalculationId: templateCalculation.templateCalculationId,
        kind: NodeType.Calculation,
        type: <CalculationType>templateCalculation.type,
        name: templateCalculation.name,
        aggregationType: <AggregrationType>templateCalculation.aggregationType,
        dsKey: key,
        formulaText: templateCalculation.formulaText,
        valueFormat: <ValueFormatType>templateCalculation.valueFormat,
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
        id: `n${getId()}`,
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

export async function saveTemplateContent(command: TemplateContentUpdateCommand) {
    return await axios(`/api/templates/build/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        data: command
    })
}

export async function searchForTemplates(searchRequest: TemplateSearchRequest) {
    return await axios(`/api/templates/build/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: searchRequest
    })
}

export async function getTemplateById(templateId: string): Promise<AxiosResponse<TemplateResponse>> {
    return await axios.get(`/api/templates/build/${templateId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}