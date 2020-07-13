import { FundingLineDictionaryEntry } from '../types/TemplateBuilderDefinitions';

export const templateBuilderStateKey = "templateBuilderState";
export const templateBuilderPastStateKey = "templateBuilderPastState";
export const templateBuilderFutureStateKey = "templateBuilderFutureState";

export const useTemplateUndo = (updateFunction: Function) => {
    const initialiseState = (ds: FundingLineDictionaryEntry[]) => {
        window.localStorage.setItem(templateBuilderStateKey, JSON.stringify(ds));
        updateFunction(ds);
    }

    const updatePresentState = (ds: FundingLineDictionaryEntry[]) => {
        const currentState = getPresentState();
        const pastState = getTimeItems(templateBuilderPastStateKey);
        pastState.push(currentState);

        window.localStorage.setItem(templateBuilderStateKey, JSON.stringify(ds));
        window.localStorage.setItem(templateBuilderPastStateKey, JSON.stringify(pastState));

        updateFunction(ds);
    }

    const undo = () => {
        const present = getPresentState();
        if (present.length === 0) {
            return;
        }

        const futureState = getTimeItems(templateBuilderFutureStateKey);
        futureState.unshift(present);

        const past = getTimeItems(templateBuilderPastStateKey);
        if (past.length === 0) {
            return;
        }

        const pastItem = past.pop();
        if (pastItem) {
            window.localStorage.setItem(templateBuilderStateKey, JSON.stringify(pastItem));
            window.localStorage.setItem(templateBuilderPastStateKey, JSON.stringify(past));
            window.localStorage.setItem(templateBuilderFutureStateKey, JSON.stringify(futureState));
            updateFunction(pastItem);
        }
    }

    const redo = () => {
        const currentState = getPresentState();
        const pastState = getTimeItems(templateBuilderPastStateKey);
        pastState.push(currentState);
        const futureState = getTimeItems(templateBuilderFutureStateKey);
        const future = futureState.shift();
        if (future) {
            window.localStorage.setItem(templateBuilderFutureStateKey, JSON.stringify(futureState));
            window.localStorage.setItem(templateBuilderPastStateKey, JSON.stringify(pastState));
            initialiseState(future);
        }
    }

    const clearPresentState = () => {
        window.localStorage.removeItem(templateBuilderStateKey);
    }

    const clearUndoState = () => {
        window.localStorage.removeItem(templateBuilderPastStateKey);
    }

    const clearRedoState = () => {
        window.localStorage.removeItem(templateBuilderFutureStateKey);
    }

    const undoCount = () => {
        return getTimeItems(templateBuilderPastStateKey).length;
    }

    const redoCount = () => {
        return getTimeItems(templateBuilderFutureStateKey).length;
    }

    const canUndo = () => {
        return getTimeItems(templateBuilderPastStateKey).length > 0;
    }

    const canRedo = () => {
        return getTimeItems(templateBuilderFutureStateKey).length > 0;
    }

    function getPresentState(): FundingLineDictionaryEntry[] {
        const presentStateString = window.localStorage.getItem(templateBuilderStateKey);
        if (presentStateString) {
            const presentState: FundingLineDictionaryEntry[] = JSON.parse(presentStateString);
            return presentState;
        }
        return [];
    }

    function getTimeItems(state: string): Array<FundingLineDictionaryEntry[]> {
        const itemsString = window.localStorage.getItem(state);
        if (itemsString) {
            const items = JSON.parse(itemsString);
            if (!items) {
                return [];
            }
            return items;
        }
        return [];
    }

    return {
        initialiseState,
        updatePresentState,
        undo,
        redo,
        clearPresentState,
        clearUndoState,
        clearRedoState,
        undoCount,
        redoCount,
        canUndo: canUndo(),
        canRedo: canRedo()
    }
}