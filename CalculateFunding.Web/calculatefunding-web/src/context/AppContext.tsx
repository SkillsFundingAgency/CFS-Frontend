import React from "react";

import { AppContextState, CreateDatasetWorkflowState, EditDatasetWorkflowState } from "./states";

export type Action =
  | { type: "setCreateDatasetWorkflowState"; payload: CreateDatasetWorkflowState }
  | { type: "resetCreateDatasetWorkflowState" }
  | { type: "setEditDatasetWorkflowState"; payload: EditDatasetWorkflowState }
  | { type: "resetEditDatasetWorkflowState" };

export type Dispatch = (action: Action) => void;

export type AppContextProps = { children: React.ReactNode };

export const AppContext = React.createContext<{ state: AppContextState; dispatch: Dispatch } | undefined>(
  undefined
);
