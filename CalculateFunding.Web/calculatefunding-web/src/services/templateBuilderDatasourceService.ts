import axios from "axios";
import { AxiosResponse } from "axios";
import JSONDigger from "json-digger";
import cloneDeep from "lodash/cloneDeep";
import { v4 as uuidv4 } from "uuid";

import {
  AggregrationType,
  Calculation,
  CalculationDictionaryItem,
  CalculationType,
  CalculationUpdateModel,
  FundingLine,
  FundingLineDictionaryEntry,
  FundingLineDictionaryItem,
  FundingLineOrCalculation,
  FundingLineType,
  FundingLineUpdateModel,
  FundingStreamWithPeriodsResponse,
  GetTemplateVersionsResponse,
  NodeDictionaryItem,
  NodeType,
  TemplateCalculation,
  TemplateContentUpdateCommand,
  TemplateFundingLine,
  TemplateResponse, TemplateSearchResponse,
  TemplateStatus,
  ValueFormatType,
} from "../types/TemplateBuilderDefinitions";
import { TemplateSearchRequest } from "../types/templateSearchRequest";

const fundingLineIdField = "id";
const fundingLineChildrenField = "children";

export const addNode = async (
  ds: Array<FundingLineDictionaryEntry>,
  id: string,
  newChild: FundingLine | Calculation,
  incrementNextId: () => void
) => {
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
      } catch {
        // ignore
      }
    }
  }
};

export const findNodeById = async (ds: Array<FundingLineDictionaryEntry>, id: string) => {
  for (let fl = 0; fl < ds.length; fl++) {
    const digger = new JSONDigger(ds[fl].value, fundingLineIdField, fundingLineChildrenField);
    try {
      const node = await digger.findNodeById(id);
      return node;
    } catch {
      // Node does not exist in current funding line
    }
  }

  throw new Error(`Node with id ${id} not found.`);
};

function isRootNode(ds: Array<FundingLineDictionaryEntry>, id: string): boolean {
  const rootNodeIds = ds.map((d) => d.value).map((v) => v.id);
  return rootNodeIds.includes(id);
}

export const removeNode = async (ds: Array<FundingLineDictionaryEntry>, id: string) => {
  const rootNodesToDelete: Array<number> = [];
  const isNodeToDeleteAClone: boolean = isClonedNode(id);
  const isNodeToDeleteACloneRoot: boolean = isCloneRoot(
    ds.map((d) => d.value),
    id
  );

  if (isNodeToDeleteAClone && !isNodeToDeleteACloneRoot) throw new Error("Cannot delete a clone child");

  for (let i = 0; i < ds.length; i++) {
    const fundingLine = ds[i];
    if (!fundingLine) return;

    const digger = new JSONDigger(fundingLine.value, fundingLineIdField, fundingLineChildrenField);
    const clonedNodeIds = await findAllClonedNodeIds(fundingLine.value, id);

    for (let j = 0; j < clonedNodeIds.length; j++) {
      try {
        const clonedNodeId = clonedNodeIds[j];
        if (!isNodeToDeleteAClone && isRootNode(ds, clonedNodeId)) {
          rootNodesToDelete.push(fundingLine.key);
          break;
        }
        if (!isNodeToDeleteACloneRoot || (isNodeToDeleteACloneRoot && clonedNodeId === id)) {
          await digger.removeNode(clonedNodeId);
        }
      } catch {
        // ignore
      }
    }
  }

  rootNodesToDelete.forEach((k) => {
    const fundingLineKeyIndex = ds.findIndex((d) => d.key === k);
    ds.splice(fundingLineKeyIndex, 1);
  });
};

export const isClonedNode = (id: string): boolean => {
  return id.includes(":");
};

function getNewCloneId(id: string) {
  return `${id.split(":")[0]}:${uuidv4()}`.replace(/-/gi, "");
}

export const isCloneRoot = (fundingLines: FundingLine[], id: string) => {
  const isClone = id.includes(":");
  if (!isClone) return false;
  const parentId = findParentId(fundingLines, id);
  return parentId.length === 0 || !parentId.includes(":");
};

export const cloneNode = async (
  ds: Array<FundingLineDictionaryEntry>,
  draggedItemData: FundingLineOrCalculation,
  draggedItemDsKey: number,
  dropTargetId: string,
  dropTargetDsKey: number
) => {
  const sourceFundingLine = ds.find((k) => k.key === draggedItemDsKey);
  if (!sourceFundingLine) return;
  const destinationFundingLine = ds.find((k) => k.key === dropTargetDsKey);
  if (!destinationFundingLine) return;
  draggedItemData.dsKey = cloneDeep(dropTargetDsKey);
  draggedItemData.id = getNewCloneId(draggedItemData.id);

  if (draggedItemData.children && draggedItemData.children.length > 0) {
    cloneChildNodes(draggedItemData.children, dropTargetDsKey);
  }

  await addNode(ds, dropTargetId, cloneDeep(draggedItemData), () => {
  });
};

export const cloneCalculation = async (
  ds: Array<FundingLineDictionaryEntry>,
  targetCalculationId: string,
  sourceCalculationId: string
) => {
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
};

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

export const moveNode = async (
  ds: Array<FundingLineDictionaryEntry>,
  draggedItemData: FundingLineOrCalculation,
  draggedItemDsKey: number,
  dropTargetId: string,
  dropTargetDsKey: number
) => {
  const sourceFundingLine = ds.find((k) => k.key === draggedItemDsKey);
  if (!sourceFundingLine) return;
  const destinationFundingLine = ds.find((k) => k.key === dropTargetDsKey);
  if (!destinationFundingLine) return;
  const destinationDsDigger = new JSONDigger(
    destinationFundingLine.value,
    fundingLineIdField,
    fundingLineChildrenField
  );
  draggedItemData.dsKey = dropTargetDsKey;
  if (isRootNode(ds, draggedItemData.id)) {
    await destinationDsDigger.addChildren(dropTargetId, draggedItemData);
    const fundingLineKeyIndex = ds.findIndex((d) => d.key === draggedItemDsKey);
    ds.splice(fundingLineKeyIndex, 1);
  } else {
    await removeNode(ds, draggedItemData.id);
    await addNode(ds, dropTargetId, draggedItemData, () => {
    });
  }
};

export async function findAllClonedNodeIds(fundingLine: FundingLine, id: string): Promise<Array<string>> {
  const digger = new JSONDigger(fundingLine, fundingLineIdField, fundingLineChildrenField);
  const originalId = id.split(":")[0];
  const findClonedNodesCondition = new RegExp(`${originalId}:|^${originalId}$`, "i");
  try {
    const clonedNodes: Array<FundingLineOrCalculation> = await digger.findNodes({
      id: findClonedNodesCondition,
    });
    return clonedNodes ? clonedNodes.map((n: FundingLineOrCalculation) => n.id) : [];
  } catch (err) {
    return [];
  }
}

export const updateNode = async (
  ds: Array<FundingLineDictionaryEntry>,
  updateModel: FundingLineUpdateModel | CalculationUpdateModel
) => {
  for (let i = 0; i < ds.length; i++) {
    const fundingLine = ds[i];
    if (!fundingLine) continue;
    try {
      const digger = new JSONDigger(fundingLine.value, fundingLineIdField, fundingLineChildrenField);
      const clonedNodeIds = await findAllClonedNodeIds(fundingLine.value, updateModel.id);
      clonedNodeIds.forEach(async (c) => {
        const cloneUpdateModel = { ...updateModel };
        cloneUpdateModel.id = c;
        try {
          await digger.updateNode(cloneUpdateModel);
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
  }
};

let id = 0;
let templateLineAndCalculationIds: any = {};

function initialiseId() {
  id = 0;
  templateLineAndCalculationIds = {};
}

function getId(templateLineOrCalculationId: number) {
  if (templateLineAndCalculationIds.hasOwnProperty(`n${templateLineOrCalculationId}`)) {
    return `${templateLineAndCalculationIds[`n${templateLineOrCalculationId}`]}:${uuidv4()}`.replace(
      /-/gi,
      ""
    );
  }
  const nodeId = id++;
  templateLineAndCalculationIds[`n${templateLineOrCalculationId}`] = nodeId;
  return nodeId;
}

function getChildren(
  fundingLinesOrCalculations: Array<TemplateFundingLine> | Array<TemplateCalculation> | undefined,
  id: number,
  key: number
): Array<FundingLineOrCalculation> {
  const children: Array<FundingLineOrCalculation> = [];
  if (fundingLinesOrCalculations) {
    for (let i = 0; i < fundingLinesOrCalculations.length; i++) {
      const node: TemplateFundingLine | TemplateCalculation = fundingLinesOrCalculations[i];
      if ("templateLineId" in node) {
        const childFundingLine = getFundingLine(node, id, key);
        children.push(childFundingLine);
      } else {
        const childCalculation = getCalculation(node, id, key);
        children.push(childCalculation);
      }
    }
  }
  return children;
}

export function getStringArray(options: string | undefined, delimiter = ","): string[] | undefined {
  if (!options || options.length === 0) {
    return undefined;
  }

  return options.split(`${delimiter}`).map((s) => s.trim());
}

export function stringArrayToString(options: string[] | undefined, delimiter = ","): string | undefined {
  if (!options || options.length === 0) {
    return undefined;
  }

  return options.join(`${delimiter}`).trimEnd();
}

function getCalculation(templateCalculation: TemplateCalculation, id: number, key: number): Calculation {
  const currentId = id;
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
    children: childCalculations,
  };
}

function getFundingLine(templateFundingLine: TemplateFundingLine, id: number, key: number): FundingLine {
  const currentId = id;
  const childFundingLines = getChildren(templateFundingLine.fundingLines, currentId, key);
  const childCalculations = getChildren(templateFundingLine.calculations, currentId, key);
  return {
    id: `n${getId(templateFundingLine.templateLineId)}`,
    templateLineId: templateFundingLine.templateLineId,
    type: templateFundingLine.type as FundingLineType,
    fundingLineCode: templateFundingLine.fundingLineCode,
    name: templateFundingLine.name,
    kind: NodeType.FundingLine,
    dsKey: key,
    children: childFundingLines.concat(childCalculations),
  };
}

export const templateFundingLinesToDatasource = (
  templateFundingLines: Array<TemplateFundingLine>
): Array<FundingLineDictionaryEntry> => {
  initialiseId();
  const datasource: Array<FundingLineDictionaryEntry> = [];
  const id = 0;
  for (let i = 0; i < templateFundingLines.length; i++) {
    const key: number = i + 1;
    const fundingLine: FundingLine = getFundingLine(templateFundingLines[i], id, key);
    datasource.push({ key, value: fundingLine });
  }
  return datasource;
};

function getTemplateFundingLines(
  fundingLines: FundingLineOrCalculation[] | undefined
): TemplateFundingLine[] {
  const result: TemplateFundingLine[] = [];

  if (fundingLines === undefined || fundingLines.length === 0) {
    return result;
  }

  for (let fl = 0; fl < fundingLines.length; fl++) {
    if (fundingLines[fl].kind === NodeType.Calculation) {
      continue;
    }
    const fundingLine = fundingLines[fl] as FundingLine;
    const templateFundingLine: TemplateFundingLine = getTemplateFundingLine(fundingLine);
    result.push(templateFundingLine);
  }

  return result;
}

function getTemplateCalculations(
  fundingLines: FundingLineOrCalculation[] | undefined
): TemplateCalculation[] {
  const result: TemplateCalculation[] = [];

  if (fundingLines === undefined || fundingLines.length === 0) {
    return result;
  }

  for (let fl = 0; fl < fundingLines.length; fl++) {
    if (fundingLines[fl].kind === NodeType.FundingLine) {
      continue;
    }
    const calculation = fundingLines[fl] as Calculation;
    const templateCalculation: TemplateCalculation = getTemplateCalculation(calculation);
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
    calculations: childCalculations,
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
    calculations: childCalculations,
  };

  return templateFundingLine;
}

function getTemplateFundingLinesFromDatasource(
  fundingLines: Array<FundingLineDictionaryEntry>
): Array<TemplateFundingLine> {
  const templateFundingLines: Array<TemplateFundingLine> = [];

  for (let key = 0; key < fundingLines.length; key++) {
    const templateFundingLine: TemplateFundingLine = getTemplateFundingLine(fundingLines[key].value);
    templateFundingLines.push(templateFundingLine);
  }

  return templateFundingLines;
}

export const datasourceToTemplateFundingLines = (
  ds: Array<FundingLineDictionaryEntry>
): Array<TemplateFundingLine> => {
  const templateFundingLines = getTemplateFundingLinesFromDatasource(ds);
  return templateFundingLines;
};

export function getLastUsedId(fundingLines: TemplateFundingLine[] | FundingLineDictionaryEntry[]): number {
  const ids = [];
  const flString = JSON.stringify(fundingLines);
  const flMatches = flString.matchAll(/"templateLineId":(.*?)"/g);
  for (const match of flMatches) {
    ids.push(parseInt(match[1].replace(",", ""), 10));
  }
  const calcMatches = flString.matchAll(/"templateCalculationId":(.*?)"/g);
  for (const match of calcMatches) {
    ids.push(parseInt(match[1].replace(",", ""), 10));
  }
  return Math.max(...ids);
}

export function getAllTemplateCalculationIds(fundingLines: FundingLineDictionaryEntry[]): number[] {
  const ids = [];
  const flString = JSON.stringify(fundingLines);
  const calcMatches = flString.matchAll(/"templateCalculationId":(.*?)"/g);
  for (const match of calcMatches) {
    ids.push(parseInt(match[1].replace(",", ""), 10));
  }
  return [...new Set(ids)].sort();
}

export function getAllTemplateLineIds(fundingLines: FundingLineDictionaryEntry[]): number[] {
  const ids = [];
  const flString = JSON.stringify(fundingLines);
  const calcMatches = flString.matchAll(/"templateLineId":(.*?)"/g);
  for (const match of calcMatches) {
    ids.push(parseInt(match[1].replace(",", ""), 10));
  }
  return [...new Set(ids)].sort();
}

export const findParentId = (fundingLines: FundingLine[], childId: string) => {
  for (let fundingLine = 0; fundingLine < fundingLines.length; fundingLine++) {
    const stack: FundingLineOrCalculation[] = [];

    stack.push(fundingLines[fundingLine]);

    while (stack.length !== 0) {
      const node = stack.pop();
      if (node && node.children && node.children.length > 0) {
        const parentId = node.id;
        for (let i: number = node.children.length - 1; i >= 0; i--) {
          const childNode = node.children[i];
          if (childNode.id === childId) return parentId;
          stack.push(node.children[i]);
        }
      }
    }
  }

  return "";
};

export const getAllCalculations = (
  fundingLines: FundingLine[],
  includeClones = false
): CalculationDictionaryItem[] => {
  const result: CalculationDictionaryItem[] = [];

  for (let fundingLine = 0; fundingLine < fundingLines.length; fundingLine++) {
    const stack: FundingLineOrCalculation[] = [];
    const array: CalculationDictionaryItem[] = [];
    const hashMap: any = {};

    stack.push(fundingLines[fundingLine]);

    while (stack.length !== 0) {
      const node = stack.pop();
      if (node && (node.children === undefined || node.children.length === 0)) {
        node.kind === NodeType.Calculation && visitNode(node as Calculation, hashMap, array, includeClones);
      } else {
        if (node && node.children && node.children.length > 0) {
          for (let i: number = node.children.length - 1; i >= 0; i--) {
            stack.push(node.children[i]);
          }
        }
      }

      if (node && node.kind === NodeType.Calculation) {
        visitNode(node as Calculation, hashMap, array, includeClones);
      }
    }
    result.push(...array);
  }

  return result.sort(compareNode);
};

export const getAllFundingLines = (
  fundingLines: FundingLine[],
  includeClones = false
): FundingLineDictionaryItem[] => {
  const result: FundingLineDictionaryItem[] = [];

  for (let fundingLine = 0; fundingLine < fundingLines.length; fundingLine++) {
    const stack: FundingLineOrCalculation[] = [];
    const array: FundingLineDictionaryItem[] = [];
    const hashMap: any = {};

    stack.push(fundingLines[fundingLine]);

    while (stack.length !== 0) {
      const node = stack.pop();
      if (node && (node.children === undefined || node.children.length === 0)) {
        node.kind === NodeType.FundingLine && visitNode(node as FundingLine, hashMap, array, includeClones);
      } else {
        if (node && node.children && node.children.length > 0) {
          for (let i: number = node.children.length - 1; i >= 0; i--) {
            stack.push(node.children[i]);
          }
        }
      }

      if (node && node.kind === NodeType.FundingLine) {
        visitNode(node as FundingLine, hashMap, array, includeClones);
      }
    }
    result.push(...array);
  }

  return result.sort(compareNode);
};

function compareNode(a: NodeDictionaryItem, b: NodeDictionaryItem) {
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

function visitNode(
  node: FundingLineOrCalculation,
  hashMap: any,
  array: NodeDictionaryItem[],
  visitClone: boolean
) {
  if ((visitClone || !node.id.includes(":")) && !hashMap[node.id]) {
    hashMap[node.id] = true;
    if (node.kind === NodeType.Calculation) {
      const item: Calculation = node as Calculation;
      array.push({
        id: item.id,
        templateCalculationId: item.templateCalculationId,
        aggregationType: item.aggregationType,
        name: node.name,
      });
    }
    if (node.kind === NodeType.FundingLine) {
      const item: FundingLine = node as FundingLine;
      array.push({
        id: item.id,
        templateLineId: item.templateLineId,
        name: item.name,
      });
    }
  }
}

export const isChildOf = async (
  datasource: FundingLineDictionaryEntry[],
  parentId: string,
  childId: string
): Promise<boolean> => {
  const parent: FundingLineOrCalculation = await findNodeById(datasource, parentId);
  if (!parent.children || parent.children.length === 0 || parentId === childId) {
    return false;
  }
  return childMatches(parent.children, childId);
};

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

export async function saveTemplateContent(
  command: TemplateContentUpdateCommand
): Promise<AxiosResponse<number>> {
  return await axios("/api/templates/build/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    data: command,
  });
}

export async function restoreTemplateContent(
  command: TemplateContentUpdateCommand,
  templateId: string,
  version: number
): Promise<AxiosResponse<number>> {
  return await axios(`/api/templates/build/${templateId}/restore/${version}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    data: command,
  });
}

export const searchForTemplates = (searchRequest: TemplateSearchRequest) => {
  return axios.post<TemplateSearchResponse>(
    "/api/templates/build/search",
    searchRequest);
}

export async function getTemplateById(templateId: string): Promise<AxiosResponse<TemplateResponse>> {
  const url = `/api/templates/build/${templateId}`;
  return axios.get(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getAllFundingStreamsWithAvailablePeriods(): Promise<AxiosResponse<FundingStreamWithPeriodsResponse[]>> {
  return await axios.get("/api/templates/build/available-stream-periods", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function createNewDraftTemplate(
  fundingStreamId: string,
  fundingPeriodId: string,
  description: string
): Promise<AxiosResponse<string>> {
  return await axios("/api/templates/build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { fundingStreamId, fundingPeriodId, description },
  });
}

export async function cloneNewTemplateFromExisting(
  fromTemplateId: string,
  fromTemplateVersion: number,
  fundingStreamId: string,
  fundingPeriodId: string,
  description: string
): Promise<AxiosResponse<string>> {
  return await axios("/api/templates/build/clone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: {
      cloneFromTemplateId: fromTemplateId,
      version: fromTemplateVersion,
      fundingStreamId,
      fundingPeriodId,
      description,
    },
  });
}

export async function publishTemplate(templateId: string, note: string): Promise<AxiosResponse<string>> {
  return await axios(`/api/templates/build/${templateId}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { templateId, note },
  });
}

export async function getVersionsOfTemplate(
  templateId: string,
  page: number,
  itemsPerPage: number,
  statuses?: TemplateStatus[]
): Promise<AxiosResponse<GetTemplateVersionsResponse>> {
  let uri = `/api/templates/build/${templateId}/versions?page=${page}&itemsPerPage=${itemsPerPage}`;
  if (statuses) {
    uri += statuses.map((x) => `&statuses=${x}`).join("");
  }
  return await axios(uri, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateTemplateDescription(
  templateId: string,
  description: string
): Promise<AxiosResponse<string>> {
  return await axios("/api/templates/build/description", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    data: { templateId, description },
  });
}

export async function getTemplateVersion(
  templateId: string,
  version: number
): Promise<AxiosResponse<TemplateResponse>> {
  return await axios(`/api/templates/build/${templateId}/versions/${version}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}
