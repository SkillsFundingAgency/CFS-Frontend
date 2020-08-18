import * as React from 'react';
import {FundingLineDictionaryEntry} from '../types/TemplateBuilderDefinitions';
import {v4 as uuidv4} from 'uuid';

export const useTemplateUndo = (updateFunction: Function) => {
    const [localStorageKey] = React.useState<string>(`${uuidv4()}`);

    const templateBuilderStateKey = () => `templateBuilderState-${localStorageKey}`;
    const templateBuilderPastStateKey = () => `templateBuilderPastState-${localStorageKey}`;
    const templateBuilderFutureStateKey = () => `templateBuilderFutureState-${localStorageKey}`;

    const initialiseState = (ds: FundingLineDictionaryEntry[]) => {
        window.localStorage.setItem(templateBuilderStateKey(), JSON.stringify(ds));
        updateFunction(ds);
    }

    const updatePresentState = (ds: FundingLineDictionaryEntry[]) => {
        const currentState = getPresentState();
        const pastState = getTimeItems(templateBuilderPastStateKey());
        pastState.push(currentState);

        window.localStorage.setItem(templateBuilderStateKey(), JSON.stringify(ds));
        window.localStorage.setItem(templateBuilderPastStateKey(), JSON.stringify(pastState));

        updateFunction(ds);
    }

    const undo = () => {
        const present = getPresentState();
        if (present.length === 0) {
            return;
        }

        const futureState = getTimeItems(templateBuilderFutureStateKey());
        futureState.unshift(present);

        const past = getTimeItems(templateBuilderPastStateKey());
        if (past.length === 0) {
            return;
        }

        const pastItem = past.pop();
        if (pastItem) {
            window.localStorage.setItem(templateBuilderStateKey(), JSON.stringify(pastItem));
            window.localStorage.setItem(templateBuilderPastStateKey(), JSON.stringify(past));
            window.localStorage.setItem(templateBuilderFutureStateKey(), JSON.stringify(futureState));
            updateFunction(pastItem);
        }
    }

    const redo = () => {
        const currentState = getPresentState();
        const pastState = getTimeItems(templateBuilderPastStateKey());
        pastState.push(currentState);
        const futureState = getTimeItems(templateBuilderFutureStateKey());
        const future = futureState.shift();
        if (future) {
            window.localStorage.setItem(templateBuilderFutureStateKey(), JSON.stringify(futureState));
            window.localStorage.setItem(templateBuilderPastStateKey(), JSON.stringify(pastState));
            initialiseState(future);
        }
    }

    const clearPresentState = () => {
        window.localStorage.removeItem(templateBuilderStateKey());
    }

    const clearUndoState = () => {
        window.localStorage.removeItem(templateBuilderPastStateKey());
    }

    const clearRedoState = () => {
        window.localStorage.removeItem(templateBuilderFutureStateKey());
    }

    const undoCount = () => {
        return getTimeItems(templateBuilderPastStateKey()).length;
    }

    const redoCount = () => {
        return getTimeItems(templateBuilderFutureStateKey()).length;
    }

    function getPresentState(): FundingLineDictionaryEntry[] {
        const presentStateString = window.localStorage.getItem(templateBuilderStateKey());
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
        redoCount
    }
}