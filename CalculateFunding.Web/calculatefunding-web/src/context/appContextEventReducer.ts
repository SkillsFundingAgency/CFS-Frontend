import { Action } from "./AppContext";
import { AppContextState } from "./states";

export const appContextEventReducer = (state: AppContextState, action: Action): AppContextState => {
  switch (action.type) {
    case "setCreateDatasetWorkflowState": {
      return { ...state, createDatasetWorkflowState: action.payload } as AppContextState;
    }
    case "resetCreateDatasetWorkflowState": {
      return { ...state, createDatasetWorkflowState: undefined } as AppContextState;
    }
    case "setEditDatasetWorkflowState": {
      return { ...state, editDatasetWorkflowState: action.payload } as AppContextState;
    }
    case "resetEditDatasetWorkflowState": {
      return { ...state, editDatasetWorkflowState: undefined } as AppContextState;
    }
  }
};
