import React from 'react';
import {EligibleSpecificationReferenceModel} from "../types/Datasets/EligibleSpecificationReferenceModel";
import {PublishedSpecificationTemplateMetadata} from "../types/Datasets/PublishedSpecificationTemplateMetadata";

export type Action = 
    {type: 'setCreateDatasetWorkflowState', payload: CreateDatasetWorkflowState} | 
    {type: 'resetCreateDatasetWorkflowState'};

export type Dispatch = (action: Action) => void;

export interface AppContextState {
    createDatasetWorkflowState?: CreateDatasetWorkflowState,
}

export interface CreateDatasetWorkflowState {
    forSpecId?: string,
    datasetName?: string,
    datasetDescription?: string,
    referencingSpec?: EligibleSpecificationReferenceModel,
    selectedItems?: PublishedSpecificationTemplateMetadata[]
}

export type AppContextProps = {children: React.ReactNode};

const AppContext = React.createContext<{state: AppContextState; dispatch: Dispatch} | undefined>(undefined);

const appContextEventReducer = (state: AppContextState, action: Action): AppContextState => {
    switch (action.type) {
        case 'setCreateDatasetWorkflowState': {
            return {...state, createDatasetWorkflowState: action.payload} as AppContextState
        }
        case 'resetCreateDatasetWorkflowState': {
            return {...state, createDatasetWorkflowState: undefined} as AppContextState
        }
    }
};

export const AppContextWrapper = ({children}: AppContextProps) => {
    const [state, dispatch] = React.useReducer(appContextEventReducer, {} as AppContextState)
    const contextValue = React.useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);
    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
};

export const useAppContext = () => {
    const context = React.useContext(AppContext)
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContext Provider')
    }
    return context;
};
