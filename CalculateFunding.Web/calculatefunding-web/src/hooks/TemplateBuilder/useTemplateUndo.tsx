import * as React from "react";
import { v4 as uuidv4 } from "uuid";

import { clear, deleteItem, findByKey, open, update } from "../../services/indexedDbWrapper";
import { FundingLineDictionaryEntry } from "../../types/TemplateBuilderDefinitions";

export const useTemplateUndo = (updateFunction: Function, enabled: boolean) => {
  const [localStorageKey] = React.useState<string>(`${uuidv4()}`);

  const templateBuilderStateKey = () => `templateBuilderState-${localStorageKey}`;
  const templateBuilderPastStateKey = () => `templateBuilderPastState-${localStorageKey}`;
  const templateBuilderFutureStateKey = () => `templateBuilderFutureState-${localStorageKey}`;

  const cleanUpDatabase = async () => {
    await clearItems();
  };

  const initialiseDatabase = async () => {
    await open();
  };

  const clearItems = async () => {
    await clear(localStorageKey);
  };

  React.useEffect(() => {
    if (enabled) {
      window.addEventListener("beforeunload", cleanUpDatabase);
      initialiseDatabase();
    }

    return () => {
      enabled && clearItems();
      window.removeEventListener("beforeunload", cleanUpDatabase);
    };
  }, []);

  const initialiseState = async (ds: FundingLineDictionaryEntry[]) => {
    if (enabled) {
      await update({
        key: templateBuilderStateKey(),
        storageKey: localStorageKey,
        templateJson: JSON.stringify(ds),
      });
    }
    updateFunction(ds);
  };

  const updatePresentState = async (ds: FundingLineDictionaryEntry[]) => {
    if (enabled) {
      const currentState = await getPresentState();
      const pastState = await getTimeItems(templateBuilderPastStateKey());
      pastState.push(currentState);

      await update({
        key: templateBuilderStateKey(),
        storageKey: localStorageKey,
        templateJson: JSON.stringify(ds),
      });
      await update({
        key: templateBuilderPastStateKey(),
        storageKey: localStorageKey,
        templateJson: JSON.stringify(pastState),
      });
      await clearRedoState();
    }

    updateFunction(ds);
  };

  const undo = async () => {
    if (enabled) {
      const present = await getPresentState();

      const futureState = await getTimeItems(templateBuilderFutureStateKey());
      futureState.unshift(present);

      const past = await getTimeItems(templateBuilderPastStateKey());
      if (past.length === 0) {
        return;
      }

      const pastItem = past.pop();
      if (pastItem) {
        await update({
          key: templateBuilderStateKey(),
          storageKey: localStorageKey,
          templateJson: JSON.stringify(pastItem),
        });
        await update({
          key: templateBuilderPastStateKey(),
          storageKey: localStorageKey,
          templateJson: JSON.stringify(past),
        });
        await update({
          key: templateBuilderFutureStateKey(),
          storageKey: localStorageKey,
          templateJson: JSON.stringify(futureState),
        });

        updateFunction(pastItem);
      }
    }
  };

  const redo = async () => {
    if (enabled) {
      const currentState = await getPresentState();
      const pastState = await getTimeItems(templateBuilderPastStateKey());
      pastState.push(currentState);
      const futureState = await getTimeItems(templateBuilderFutureStateKey());
      const future = futureState.shift();
      if (future) {
        await update({
          key: templateBuilderFutureStateKey(),
          storageKey: localStorageKey,
          templateJson: JSON.stringify(futureState),
        });
        await update({
          key: templateBuilderPastStateKey(),
          storageKey: localStorageKey,
          templateJson: JSON.stringify(pastState),
        });
        await update({
          key: templateBuilderStateKey(),
          storageKey: localStorageKey,
          templateJson: JSON.stringify(future),
        });

        updateFunction(future);
      }
    }
  };

  const clearPresentState = async () => {
    enabled && (await deleteItem(templateBuilderStateKey()));
  };

  const clearUndoState = async () => {
    enabled && (await deleteItem(templateBuilderPastStateKey()));
  };

  const clearRedoState = async () => {
    enabled && (await deleteItem(templateBuilderFutureStateKey()));
  };

  const undoCount = async () => {
    if (!enabled) return 0;
    const items = await getTimeItems(templateBuilderPastStateKey());
    return items.length;
  };

  const redoCount = async () => {
    if (!enabled) return 0;
    const items = await getTimeItems(templateBuilderFutureStateKey());
    return items.length;
  };

  const getPresentState = async () => {
    const templateBuilderHistory = await findByKey(templateBuilderStateKey());
    if (templateBuilderHistory) {
      const presentState: FundingLineDictionaryEntry[] = JSON.parse(templateBuilderHistory.templateJson);
      return presentState;
    }
    return [];
  };

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
  };

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
  };
};
