import React from "react";

interface ITabsContext {
    activeTab: string;
    setActiveTab: (label: string) => void;
}

export const TabsContext = React.createContext<ITabsContext | undefined>(undefined);

export const useTabs = (): ITabsContext => {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error('This component must be used within a <Tabs> component.');
    }
    return context;
};