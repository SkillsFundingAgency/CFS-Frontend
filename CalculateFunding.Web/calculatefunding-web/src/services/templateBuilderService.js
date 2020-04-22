import { Subject } from "rxjs";

const subject1 = new Subject();
const subject2 = new Subject();

export const sendDragInfo = (id, kind) => subject1.next({ draggedNodeId: id, draggedNodeKind: kind });
export const clearDragInfo = () => subject1.next();
export const getDragInfo = () => subject1.asObservable();

export const sendSelectedNodeInfo = id => subject2.next({ selectedNodeId: id });
export const clearSelectedNodeInfo = () => subject2.next();
export const getSelectedNodeInfo = () => subject2.asObservable();
