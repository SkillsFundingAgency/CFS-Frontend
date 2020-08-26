import * as React from 'react';
import {FundingLineDictionaryEntry} from '../types/TemplateBuilderDefinitions';
import {v4 as uuidv4} from "uuid";
import {open, clear, update, deleteItem, findByKey} from "../services/indexedDbWrapper";

export const useTemplateUndo = (updateFunction: Function) => {
    const [localStorageKey] = React.useState<string>(`${uuidv4()}`);

    const templateBuilderStateKey = () => `templateBuilderState-${localStorageKey}`;
    const templateBuilderPastStateKey = () => `templateBuilderPastState-${localStorageKey}`;
    const templateBuilderFutureStateKey = () => `templateBuilderFutureState-${localStorageKey}`;

    const initialiseDatabase = async () => {
        await open();
    }

    const clearItems = async () => {
        await clear(localStorageKey).catch(() => {});
    }

    React.useEffect(() => {
        initialiseDatabase();

        return () => {
            clearItems();
        }
    }, []);

    const initialiseState = async (ds: FundingLineDictionaryEntry[]) => {
        await update({key: templateBuilderStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(ds)});
        updateFunction(ds);
    }

    const updatePresentState = async (ds: FundingLineDictionaryEntry[]) => {
        const currentState = await getPresentState();
        const pastState = await getTimeItems(templateBuilderPastStateKey());
        pastState.push(currentState);

        await update({key: templateBuilderStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(ds)});
        await update({key: templateBuilderPastStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(pastState)});
        await clearRedoState();

        updateFunction(ds);
    }

    const undo = async () => {
        const present = await getPresentState();

        const futureState = await getTimeItems(templateBuilderFutureStateKey());
        futureState.unshift(present);

        const past = await getTimeItems(templateBuilderPastStateKey());
        if (past.length === 0) {
            return;
        }

        const pastItem = past.pop();
        if (pastItem) {
            await update({key: templateBuilderStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(pastItem)});
            await update({key: templateBuilderPastStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(past)});
            await update({key: templateBuilderFutureStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(futureState)});

            updateFunction(pastItem);
        }
    }

    const redo = async () => {
        const currentState = await getPresentState();
        const pastState = await getTimeItems(templateBuilderPastStateKey());
        pastState.push(currentState);
        const futureState = await getTimeItems(templateBuilderFutureStateKey());
        const future = futureState.shift();
        if (future) {
            await update({key: templateBuilderFutureStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(futureState)});
            await update({key: templateBuilderPastStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(pastState)});
            await update({key: templateBuilderStateKey(), storageKey: localStorageKey, templateJson: JSON.stringify(future)});

            updateFunction(future);
        }
    }

    const clearPresentState = async () => {
        await deleteItem(templateBuilderStateKey());
    }

    const clearUndoState = async () => {
        await deleteItem(templateBuilderPastStateKey());
    }

    const clearRedoState = async () => {
        await deleteItem(templateBuilderFutureStateKey());
    }

    const undoCount = async () => {
        const items = await getTimeItems(templateBuilderPastStateKey());
        return items.length;
    }

    const redoCount = async () => {
        const items = await getTimeItems(templateBuilderFutureStateKey());
        return items.length;
    }

    const getPresentState = async () => {
        const templateBuilderHistory = await findByKey(templateBuilderStateKey());
        if (templateBuilderHistory) {
            const presentState: FundingLineDictionaryEntry[] = JSON.parse(templateBuilderHistory.templateJson);
            return presentState;
        }
        return [];
    }

    const getTimeItems = async (state: string) => {
        const templateBuilderHistory = await findByKey(state);
        if (templateBuilderHistory) {
            const items = JSON.parse(templateBuilderHistory.templateJson);
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