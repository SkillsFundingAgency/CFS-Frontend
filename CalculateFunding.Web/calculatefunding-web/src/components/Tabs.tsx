import * as React from 'react';
import { Tab, ITabProps } from './Tab';
import { Panel, IPanelProps } from './Panel';

interface ITabsContext {
    activeTab: string;
    setActiveTab: (label: string) => void;
}

interface ITabsComposition {
    Tab: React.FC<ITabProps>;
    Panel: React.FC<IPanelProps>;
}

const TabsContext = React.createContext<ITabsContext | undefined>(undefined);

const Tabs: React.FC<{initialTab:string}> & ITabsComposition = props => {
    const [activeTab, setActiveTab] = React.useState(props.initialTab);
    const memoizedContextValue = React.useMemo(
        () => ({
            activeTab,
            setActiveTab,
        }),
        [activeTab, setActiveTab],
    );

    return (
        <TabsContext.Provider value={memoizedContextValue}>
            {props.children}
        </TabsContext.Provider>
    );
};

export const useTabs = (): ITabsContext => {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error('This component must be used within a <Tabs> component.');
    }
    return context;
};

Tabs.Tab = Tab;
Tabs.Panel = Panel;

export { Tabs };