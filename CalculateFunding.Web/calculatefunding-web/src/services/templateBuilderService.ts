import { Subject } from "rxjs";
import { NodeType } from "../types/TemplateBuilderDefinitions";

interface dragSubject {
    draggedNodeId: string,
    draggedNodeKind: NodeType
}

interface selectSubject {
    selectedNodeId: string
}

const subject1 = new Subject<dragSubject>();
const subject2 = new Subject<selectSubject>();

export const sendDragInfo = (id: string, kind: NodeType) => subject1.next({ draggedNodeId: id, draggedNodeKind: kind });
export const clearDragInfo = () => subject1.next();
export const getDragInfo = () => subject1.asObservable();

export const sendSelectedNodeInfo = (id: string) => subject2.next({ selectedNodeId: id });
export const clearSelectedNodeInfo = () => subject2.next();
export const getSelectedNodeInfo = () => subject2.asObservable();