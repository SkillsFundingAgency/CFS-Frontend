import JSONDigger from "json-digger";
import { v4 as uuidv4 } from 'uuid';
import { FundingLine, FundingLineUpdateModel, CalculationUpdateModel, Calculation, FundingLineOrCalculation, FundingLineDictionaryEntry } from "../types/TemplateBuilderDefinitions";

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